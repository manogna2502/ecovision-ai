import io
import os
import time
import gc
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from typing import List, Optional

# Limit torch/BLAS threads BEFORE importing torch - reduces peak memory and
# avoids the free-tier CPU getting thrashed by a multi-threaded matmul.
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

import torch
torch.set_num_threads(1)

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from sqlalchemy import Column, JSON, func
from sqlmodel import Field, Session, SQLModel, create_engine, select
from transformers import AutoImageProcessor, SiglipForImageClassification

load_dotenv()

MODEL_NAME = "prithivMLmods/Trash-Net"

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
    """Load the model once at boot instead of on first request.

    This means the first user never pays the ~10-20s model-load cost, and it
    lets us see immediately in the logs if loading itself is the problem
    (rather than finding out only when a real request comes in).
    """
    get_model()
    print("Model loaded and ready at startup.")


@lru_cache(maxsize=1)
def get_model():
    """Load model + processor once and cache them across requests.

    Memory optimizations applied:
    - CPU-only torch build (no unused CUDA libs loaded into memory)
    - low_cpu_mem_usage avoids a duplicate copy of weights during load
    - dynamic int8 quantization on Linear layers shrinks the resident
      footprint of the largest layers substantially
    - torch.set_num_threads(1) avoids extra thread-local buffer overhead
    - explicit del + gc.collect() drops the unquantized fp32 copy immediately
    """
    processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
    model = SiglipForImageClassification.from_pretrained(
        MODEL_NAME, low_cpu_mem_usage=True, torch_dtype=torch.float32
    )
    model.eval()
    quantized_model = torch.quantization.quantize_dynamic(
        model, {torch.nn.Linear}, dtype=torch.qint8
    )
    del model
    gc.collect()
    return processor, quantized_model


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
    model_loaded = get_model.cache_info().currsize > 0
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

        # Downscale before inference - the model's own processor will resize
        # to its expected input size anyway, so there's no accuracy cost, but
        # it keeps peak memory during preprocessing much lower for large
        # phone-camera photos (4000x3000 etc).
        image.thumbnail((384, 384))

        processor, model = get_model()

        start = time.time()
        inputs = processor(images=image, return_tensors="pt")

        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1)[0]

        inference_ms = round((time.time() - start) * 1000, 1)

        id2label = model.config.id2label
        predictions = sorted(
            [
                {
                    "label": id2label[i],
                    "confidence": round(float(p) * 100, 1),
                }
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

        # Free intermediate tensors promptly - matters a lot at 512MB.
        del inputs, outputs, logits, probs
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