from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Form
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.config import settings
from app.models import db as models
from app.services import pipeline, storage
from ml.preprocessing.preprocessor import validate_upload, AudioValidationError

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze/upload")
async def analyze_upload(
    file: UploadFile = File(...),
    segment_length_s: float = Form(5.0),
    claimed_organization: str | None = Form(None),
    claimed_branch: str | None = Form(None),
    claimed_city: str | None = Form(None),
    caller_id: str | None = Form(None),
    db: Session = Depends(get_db),
):
    contents = await file.read()
    try:
        validate_upload(file.filename or "upload.wav", len(contents))
    except AudioValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    store = storage.get_storage()
    saved_path = store.save(contents, file.filename or "upload.wav")

    session_row = models.AnalysisSession(
        mode="upload", status="processing", segment_length_s=segment_length_s
    )
    db.add(session_row)
    db.commit()
    db.refresh(session_row)

    result = pipeline.run_full_analysis(
        db,
        session_row=session_row,
        audio_path=saved_path,
        claimed_organization=claimed_organization,
        claimed_branch=claimed_branch,
        claimed_city=claimed_city,
        caller_id=caller_id,
    )

    if result["status"] == "failed":
        raise HTTPException(status_code=422, detail=result["error_message"])

    return _serialize_result(session_row.id, result)


@router.get("/analysis/{analysis_id}")
def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    session_row = db.query(models.AnalysisSession).filter_by(id=analysis_id).first()
    if not session_row:
        raise HTTPException(status_code=404, detail="Analysis session not found.")
    return _serialize_session_from_db(db, session_row)


@router.get("/analysis/{analysis_id}/segments")
def get_segments(analysis_id: str, db: Session = Depends(get_db)):
    segments = db.query(models.AudioSegment).filter_by(session_id=analysis_id).order_by(
        models.AudioSegment.segment_index
    ).all()
    out = []
    for seg in segments:
        preds = db.query(models.SegmentPrediction).filter_by(segment_id=seg.id).all()
        out.append({
            "segment_id": seg.id,
            "index": seg.segment_index,
            "start_s": seg.start_s,
            "end_s": seg.end_s,
            "transcript_text": seg.transcript_text,
            "predictions": [
                {
                    "model_name": p.model_name,
                    "model_version": p.model_version,
                    "status": p.status,
                    "synthetic_likelihood": p.synthetic_likelihood,
                    "human_likelihood": p.human_likelihood,
                    "uncertainty": p.uncertainty,
                    "processing_time_ms": p.processing_time_ms,
                    "is_simulated": p.is_simulated,
                    "message": p.message,
                    "evidence_ref": p.evidence_ref,
                }
                for p in preds
            ],
        })
    return {"segments": out}


@router.get("/analysis/{analysis_id}/explanation")
def get_explanation(analysis_id: str, db: Session = Depends(get_db)):
    items = db.query(models.EvidenceItemRow).filter_by(session_id=analysis_id).all()
    return {
        "evidence": [
            {
                "id": i.id,
                "category": i.category,
                "severity": i.severity,
                "title": i.title,
                "description": i.description,
                "source": i.source,
                "segment_id": i.segment_id,
                "timestamp_s": i.timestamp_s,
                "model_name": i.model_name,
            }
            for i in items
        ]
    }


def _serialize_result(session_id: str, result: dict) -> dict:
    audio = result["audio"]
    segments = [
        {
            "segment_id": seg.segment_id,
            "index": seg.index,
            "start_s": seg.start_s,
            "end_s": seg.end_s,
            "transcript_text": None,
            "predictions": [
                p.to_dict() for p in result.get("segment_predictions", [])
                if p.segment_id == seg.segment_id
            ],
        }
        for seg in result.get("segments", [])
    ]
    return {
        "session_id": session_id,
        "status": result["status"],
        "mode": "upload",
        "audio": {
            "duration_s": audio.duration_s,
            "sample_rate": audio.sample_rate,
            "original_sample_rate": audio.original_sample_rate,
            "channels": audio.original_channels,
            "format": audio.original_format,
        },
        "segments": segments,
        "fusion": result["fusion"],
        "conversation": result["conversation"],
        "verification": result["verification"],
        "risk": result["risk"],
        "evidence": result["evidence"],
    }


def _serialize_session_from_db(db: Session, session_row: models.AnalysisSession) -> dict:
    audio_row = db.query(models.AudioMetadata).filter_by(session_id=session_row.id).first()
    fusion_row = db.query(models.ModelPrediction).filter_by(session_id=session_row.id).first()
    verification_row = db.query(models.VerificationResult).filter_by(session_id=session_row.id).first()
    risk_row = db.query(models.RiskScore).filter_by(session_id=session_row.id).first()
    evidence_rows = db.query(models.EvidenceItemRow).filter_by(session_id=session_row.id).all()
    segment_rows = db.query(models.AudioSegment).filter_by(session_id=session_row.id).order_by(
        models.AudioSegment.segment_index
    ).all()

    segments_out = []
    for seg in segment_rows:
        preds = db.query(models.SegmentPrediction).filter_by(segment_id=seg.id).all()
        segments_out.append({
            "segment_id": seg.id,
            "index": seg.segment_index,
            "start_s": seg.start_s,
            "end_s": seg.end_s,
            "transcript_text": seg.transcript_text,
            "predictions": [
                {
                    "model_name": p.model_name,
                    "model_version": p.model_version,
                    "status": p.status,
                    "synthetic_likelihood": p.synthetic_likelihood,
                    "human_likelihood": p.human_likelihood,
                    "uncertainty": p.uncertainty,
                    "processing_time_ms": p.processing_time_ms,
                    "is_simulated": p.is_simulated,
                    "message": p.message,
                    "evidence_ref": p.evidence_ref,
                }
                for p in preds
            ],
        })

    otp_detected = any(e.source == "OTPDetector" for e in evidence_rows)
    otp_matches = [
        {"matched_phrase": e.title, "pattern_category": "otp_request", "timestamp_s": e.timestamp_s}
        for e in evidence_rows if e.source == "OTPDetector"
    ]

    return {
        "session_id": session_row.id,
        "status": session_row.status,
        "mode": session_row.mode,
        "error_message": session_row.error_message,
        "audio": None if not audio_row else {
            "filename": audio_row.filename,
            "duration_s": audio_row.duration_s,
            "sample_rate": audio_row.sample_rate,
            "original_sample_rate": audio_row.original_sample_rate,
            "channels": audio_row.channels,
            "format": audio_row.format,
        },
        "segments": segments_out,
        "fusion": None if not fusion_row else {
            "synthetic_likelihood": fusion_row.synthetic_likelihood,
            "human_likelihood": fusion_row.human_likelihood,
            "model_agreement": fusion_row.model_agreement,
            "uncertainty": fusion_row.uncertainty,
            "contributing_models": fusion_row.contributing_models,
            "unavailable_models": fusion_row.unavailable_models,
            "any_simulated": fusion_row.any_simulated,
            "weights_used": fusion_row.weights_used,
        },
        "conversation": {
            "signals": [],
            "signal_counts": {},
            "conversation_risk_hint": "high" if otp_detected else "low",
            "otp_detection": {"detected": otp_detected, "matches": otp_matches},
        },
        "verification": None if not verification_row else verification_row.raw_result,
        "risk": None if not risk_row else {
            "risk_score": risk_row.risk_score,
            "risk_level": risk_row.risk_level,
            "risk_factors": risk_row.risk_factors,
            "recommendation": risk_row.recommendation,
            "thresholds_used": risk_row.thresholds_used,
            "weights_used": risk_row.weights_used,
        },
        "evidence": [
            {
                "id": e.id, "category": e.category, "severity": e.severity, "title": e.title,
                "description": e.description, "source": e.source, "segment_id": e.segment_id,
                "timestamp_s": e.timestamp_s, "model_name": e.model_name,
            }
            for e in evidence_rows
        ],
    }
