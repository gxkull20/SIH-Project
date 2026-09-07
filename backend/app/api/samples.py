from __future__ import annotations

import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models import db as models
from app.services import pipeline
from app.api.analyze import _serialize_result

router = APIRouter(prefix="/api/samples", tags=["samples"])

_SAMPLES_DIR = Path(__file__).resolve().parents[3] / "samples"

_SAMPLE_PRESETS = [
    {
        "id": "sample_bank_call",
        "filename": "sample_bank_call.wav",
        "title": "Legitimate Bank Call",
        "subtitle": "Customer Care Address Update (Control Case)",
        "claimed_organization": "Demo Bank",
        "claimed_branch": "Chennai",
        "claimed_city": "Chennai",
        "caller_id": "+91-DEMO-1000",
        "expected_risk": "LOW",
        "preset_synthetic_likelihood": 0.08,
        "transcript": [
            {
                "start_s": 0.0,
                "end_s": 3.0,
                "text": "Good morning, this is Demo Bank customer verification desk calling from Chennai to confirm your address update request.",
            },
            {
                "start_s": 3.0,
                "end_s": 6.0,
                "text": "Your reference ticket is confirmed. Your details will be updated within twenty-four hours. Thank you for banking with us.",
            },
        ],
        "description": "Legitimate customer service confirmation adhering to banking protocols with zero credential solicitation.",
        "badge_color": "emerald",
    },
    {
        "id": "sample_suspicious_call",
        "filename": "sample_suspicious_call.wav",
        "title": "Suspicious Impersonation Call",
        "subtitle": "Urgent Unauthorized Transaction Alert",
        "claimed_organization": "Demo Bank",
        "claimed_branch": "Delhi",
        "claimed_city": "Delhi",
        "caller_id": "+91-98210-44912",
        "expected_risk": "HIGH",
        "preset_synthetic_likelihood": 0.88,
        "transcript": [
            {
                "start_s": 0.0,
                "end_s": 3.2,
                "text": "Urgent security alert from Demo Bank central fraud cell. An unauthorized charge of 48,990 rupees was attempted immediately on your card.",
            },
            {
                "start_s": 3.2,
                "end_s": 6.5,
                "text": "To stop this transaction immediately and block your account, you must share your 6-digit verification code right now.",
            },
            {
                "start_s": 6.5,
                "end_s": 10.0,
                "text": "Please read out the OTP immediately or your account will be permanently frozen under fraud suspicion.",
            },
        ],
        "description": "Impersonates bank central fraud cell, manufactures urgency, and uses unverified branch credentials.",
        "badge_color": "red",
    },
]


@router.get("")
def list_samples():
    """Returns list of bundled demo audio samples with preset verification metadata."""
    available = []
    for p in _SAMPLE_PRESETS:
        file_path = _SAMPLES_DIR / p["filename"]
        exists = file_path.exists()
        available.append({
            "id": p["id"],
            "filename": p["filename"],
            "title": p["title"],
            "subtitle": p["subtitle"],
            "claimed_organization": p["claimed_organization"],
            "claimed_branch": p["claimed_branch"],
            "claimed_city": p["claimed_city"],
            "caller_id": p["caller_id"],
            "expected_risk": p["expected_risk"],
            "description": p["description"],
            "badge_color": p["badge_color"],
            "preset_synthetic_likelihood": p.get("preset_synthetic_likelihood"),
            "exists": exists,
            "file_size_bytes": file_path.stat().st_size if exists else 0,
        })
    return {"samples": available}


@router.api_route("/{sample_name}/download", methods=["GET", "HEAD"])
def download_sample(sample_name: str):
    """Streams the audio file for in-browser playback."""
    file_path = _SAMPLES_DIR / sample_name
    if not file_path.exists():
        # Fallback search in working directory or parents
        alt_path = Path.cwd() / "samples" / sample_name
        if alt_path.exists():
            file_path = alt_path
        else:
            raise HTTPException(status_code=404, detail="Sample audio file not found.")
    return FileResponse(file_path, media_type="audio/wav", filename=sample_name)


@router.post("/{sample_name}/analyze")
def analyze_sample(sample_name: str, db: Session = Depends(get_db)):
    """
    Directly runs the complete 11-stage pipeline on the pre-packaged sample audio.
    No file upload needed — returns full AnalysisSession.
    """
    preset = next((p for p in _SAMPLE_PRESETS if p["filename"] == sample_name or p["id"] == sample_name), None)
    if not preset:
        raise HTTPException(status_code=404, detail="Sample preset not found.")

    file_path = _SAMPLES_DIR / preset["filename"]
    if not file_path.exists():
        alt_path = Path.cwd() / "samples" / preset["filename"]
        if alt_path.exists():
            file_path = alt_path
        else:
            raise HTTPException(status_code=404, detail=f"Audio file '{preset['filename']}' not found on server.")

    session_row = models.AnalysisSession(
        mode="sample_preset",
        status="processing",
        segment_length_s=5.0,
    )
    db.add(session_row)
    db.commit()
    db.refresh(session_row)

    result = pipeline.run_full_analysis(
        db,
        session_row=session_row,
        audio_path=str(file_path),
        claimed_organization=preset["claimed_organization"],
        claimed_branch=preset["claimed_branch"],
        claimed_city=preset["claimed_city"],
        caller_id=preset["caller_id"],
        preset_synthetic_likelihood=preset.get("preset_synthetic_likelihood"),
        manual_transcript=preset.get("transcript"),
    )

    if result.get("status") == "failed":
        raise HTTPException(status_code=422, detail=result.get("error_message", "Analysis failed."))

    return _serialize_result(session_row.id, result)
