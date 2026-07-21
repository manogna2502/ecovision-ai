import io
import os
import time
import httpx
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from sqlalchemy import Column, JSON, func
from sqlmodel import Field, Session, SQLModel, create_engine, select

load_dotenv()

MODEL_NAME = "prithivMLmods/Trash-Net"
HF_TOKEN = os.getenv("HF_TOKEN")  # REQUIRED now - set this in Render env vars
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL_NAME}"

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
    return {"status": "ok", "model": MODEL_NAME, "database_connected": db_ok, "hf_token_set": bool(HF_TOKEN)}


@app.post("/api/detect")
async def detect(file: UploadFile = File(...), session: Session = Depends(get_session)):
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Please upload an image file.")

        if not HF_TOKEN:
            raise HTTPException(
                status_code=500,
                detail="HF_TOKEN not configured on the server. Set it in Render environment variables.",
            )

        raw = await file.read()

        # Re-encode to a smaller JPEG to keep the request light and fast
        image = Image.open(io.BytesIO(raw)).convert("RGB")
        image.thumbnail((512, 512))
        buf = io.BytesIO()
        image.save(buf, format="JPEG", quality=85)
        payload = buf.getvalue()

        start = time.time()

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                HF_API_URL,
                headers={
                    "Authorization": f"Bearer {HF_TOKEN}",
                    "Content-Type": "image/jpeg",
                },
                content=payload,
            )

        inference_ms = round((time.time() - start) * 1000, 1)

        if resp.status_code == 503:
            # Model is cold-loading on HF's side, ask the client to retry shortly
            raise HTTPException(
                status_code=503,
                detail="Model is warming up on Hugging Face, please retry in a few seconds.",
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"HF Inference API error: {resp.text}")

        hf_predictions = resp.json()
        # HF image-classification pipeline returns [{"label": ..., "score": 0-1}, ...]
        predictions = sorted(
            [
                {"label": p["label"], "confidence": round(float(p["score"]) * 100, 1)}
                for p in hf_predictions
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