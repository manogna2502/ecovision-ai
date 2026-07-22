import io
import os
import time
import gc
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from typing import List, Optional

import numpy as np
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from sqlalchemy import Column, JSON, func
from sqlmodel import Field, Session, SQLModel, create_engine, select
from huggingface_hub import hf_hub_download
import onnxruntime as ort

load_dotenv()

# --- Model config ------------------------------------------------------------
# Your uploaded ONNX repo - update ONNX_REPO if you re-upload elsewhere.
ONNX_REPO = "Manogna2502/ecovision-waste-onnx"
ONNX_FILENAME = "model_raw.onnx"
ONNX_DATA_FILENAME = "model_raw.onnx.data"  # external weights file - required
MODEL_NAME = "prithivMLmods/Trash-Net (ONNX, fp32)"

# From your exported config.json / preprocessor_config.json - keep these in
# sync if you ever re-export with different values.
ID2LABEL = {
    0: "cardboard",
    1: "glass",
    2: "metal",
    3: "paper",
    4: "plastic",
    5: "trash",
}
IMAGE_SIZE = (224, 224)  # (height, width)
IMAGE_MEAN = np.array([0.5, 0.5, 0.5], dtype=np.float32)
IMAGE_STD = np.array([0.5, 0.5, 0.5], dtype=np.float32)

# --- Database setup -------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecovision.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)


class Detection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: Optional[str] = None
    top_label: str
    top_confidence: float
    predictions: List[dict] = Field(sa_column=Column(JSON))
    risk_score: float
    risk_level: str
    cleanup_priority: str
    inference_ms: float
    model: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def get_session():
    with Session(engine) as session:
        yield session


# --- App setup --------------------------------------------------------------
app = FastAPI(title="EcoVision AI Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)


@app.on_event("startup")
def load_model_on_startup():
    """Download (if needed) and load the ONNX model once at boot.

    huggingface_hub caches the download, so redeploys after the first one
    reuse the cached file rather than re-downloading 80+ MB every time.
    """
    get_session_and_model()
    print("ONNX model loaded and ready at startup.")


@lru_cache(maxsize=1)
def get_session_and_model():
    """Download the quantized ONNX model from the Hub and create an
    inference session. Cached so this only happens once per process."""
    model_path = hf_hub_download(repo_id=ONNX_REPO, filename=ONNX_FILENAME)
    # The external weights file must be downloaded into the exact same local
    # folder as model_path, since the .onnx graph references it by relative
    # filename. hf_hub_download's local caching already handles this
    # correctly as long as both files live in the same repo.
    hf_hub_download(repo_id=ONNX_REPO, filename=ONNX_DATA_FILENAME)

    so = ort.SessionOptions()
    so.intra_op_num_threads = 1
    so.inter_op_num_threads = 1
    so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

    ort_session = ort.InferenceSession(
        model_path, sess_options=so, providers=["CPUExecutionProvider"]
    )
    input_name = ort_session.get_inputs()[0].name
    return ort_session, input_name


def preprocess_image(image: Image.Image) -> np.ndarray:
    """Replicates SiglipImageProcessor's preprocessing:
    resize -> rescale to [0,1] -> normalize with mean/std -> CHW -> batch dim.
    """
    image = image.resize((IMAGE_SIZE[1], IMAGE_SIZE[0]), Image.BILINEAR)
    arr = np.asarray(image).astype(np.float32) / 255.0  # rescale_factor
    arr = (arr - IMAGE_MEAN) / IMAGE_STD  # normalize
    arr = arr.transpose(2, 0, 1)  # HWC -> CHW
    arr = np.expand_dims(arr, axis=0)  # add batch dim
    return arr.astype(np.float32)


def softmax(x: np.ndarray) -> np.ndarray:
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()


CLASS_RISK_WEIGHT = {
    "cardboard": 0.2,
    "paper": 0.2,
    "glass": 0.5,
    "metal": 0.5,
    "plastic": 0.6,
    "trash": 0.9,
}


def risk_from_prediction(label: str, confidence: float):
    base = CLASS_RISK_WEIGHT.get(label.lower(), 0.5)
    score = round(base * confidence * 10, 1)

    if score >= 7:
        risk, priority = "Critical", "Critical"
    elif score >= 5:
        risk, priority = "High", "High"
    elif score >= 3:
        risk, priority = "Medium", "Medium"
    else:
        risk, priority = "Low", "Low"

    return score, risk, priority


@app.get("/api/health")
def health(session: Session = Depends(get_session)):
    db_ok = True
    try:
        session.exec(select(func.count(Detection.id))).one()
    except Exception:
        db_ok = False
    model_loaded = get_session_and_model.cache_info().currsize > 0
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "database_connected": db_ok,
        "model_loaded": model_loaded,
    }


@app.post("/api/detect")
async def detect(file: UploadFile = File(...), session: Session = Depends(get_session)):
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Please upload an image file.")

        raw = await file.read()

        try:
            image = Image.open(io.BytesIO(raw)).convert("RGB")
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Couldn't read that file as an image. Try a JPG or PNG.",
            )

        ort_session, input_name = get_session_and_model()

        start = time.time()
        input_array = preprocess_image(image)
        outputs = ort_session.run(None, {input_name: input_array})
        logits = outputs[0][0]  # first output, first (only) batch item
        probs = softmax(logits)
        inference_ms = round((time.time() - start) * 1000, 1)

        predictions = sorted(
            [
                {"label": ID2LABEL[i], "confidence": round(float(p) * 100, 1)}
                for i, p in enumerate(probs)
            ],
            key=lambda x: x["confidence"],
            reverse=True,
        )

        top = predictions[0]
        score, risk, priority = risk_from_prediction(top["label"], top["confidence"] / 100)

        record = Detection(
            filename=file.filename,
            top_label=top["label"],
            top_confidence=top["confidence"],
            predictions=predictions,
            risk_score=score,
            risk_level=risk,
            cleanup_priority=priority,
            inference_ms=inference_ms,
            model=MODEL_NAME,
        )

        session.add(record)
        session.commit()
        session.refresh(record)

        del input_array, outputs, logits, probs
        gc.collect()

        return {
            "id": record.id,
            "saved": True,
            "predictions": predictions,
            "top_label": top["label"],
            "top_confidence": top["confidence"],
            "risk_score": score,
            "risk_level": risk,
            "cleanup_priority": priority,
            "inference_ms": inference_ms,
            "model": MODEL_NAME,
            "created_at": record.created_at.isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


@app.get("/api/detections")
def list_detections(limit: int = 50, session: Session = Depends(get_session)):
    rows = session.exec(
        select(Detection).order_by(Detection.created_at.desc()).limit(limit)
    ).all()
    return rows


@app.get("/api/stats")
def get_stats(session: Session = Depends(get_session)):
    detections = session.exec(select(Detection)).all()
    total = len(detections)

    if total == 0:
        return {
            "total_detections": 0,
            "avg_risk_score": 0,
            "avg_confidence": 0,
            "label_breakdown": [],
            "priority_breakdown": [],
            "weekly_trend": [],
            "recent": [],
        }

    avg_risk = round(sum(d.risk_score for d in detections) / total, 2)
    avg_confidence = round(sum(d.top_confidence for d in detections) / total, 1)

    label_counts = defaultdict(int)
    for d in detections:
        label_counts[d.top_label] += 1
    label_breakdown = [
        {"label": k, "count": v, "pct": round(v / total * 100, 1)}
        for k, v in sorted(label_counts.items(), key=lambda x: -x[1])
    ]

    priority_counts = defaultdict(int)
    for d in detections:
        priority_counts[d.cleanup_priority] += 1
    priority_breakdown = [{"priority": k, "count": v} for k, v in priority_counts.items()]

    today = datetime.now(timezone.utc).date()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    day_counts = defaultdict(int)
    for d in detections:
        day_counts[d.created_at.date()] += 1
    weekly_trend = [
        {"day": d.strftime("%a"), "date": str(d), "count": day_counts.get(d, 0)}
        for d in days
    ]

    recent = sorted(detections, key=lambda d: d.created_at, reverse=True)[:10]
    recent_out = [
        {
            "id": d.id,
            "top_label": d.top_label,
            "top_confidence": d.top_confidence,
            "risk_level": d.risk_level,
            "cleanup_priority": d.cleanup_priority,
            "created_at": d.created_at.isoformat(),
        }
        for d in recent
    ]

    return {
        "total_detections": total,
        "avg_risk_score": avg_risk,
        "avg_confidence": avg_confidence,
        "label_breakdown": label_breakdown,
        "priority_breakdown": priority_breakdown,
        "weekly_trend": weekly_trend,
        "recent": recent_out,
    }