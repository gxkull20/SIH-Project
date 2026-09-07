from __future__ import annotations

import numpy as np
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models import db as models
from app.schemas.schemas import ExperimentRunRequest
from ml.model_cards.registry import list_model_cards, get_model_card
from ml.evaluation.asvspoof_experiments import ASVspoofExperimentRunner, ExperimentConfig
from ml.detectors.spectrogram_detector import SpectrogramDetector
from ml.detectors.wavlm_detector import WavLMDetector
from ml.detectors.prosody_analyzer import ProsodyAnalyzer

router = APIRouter(prefix="/api", tags=["research"])

_spectrogram_detector = SpectrogramDetector()
_wavlm_detector = WavLMDetector()
_prosody_analyzer = ProsodyAnalyzer()
_experiment_runner = ASVspoofExperimentRunner()


@router.get("/models")
def list_models():
    detectors = {
        "spectrogram-cnn": _spectrogram_detector,
        "wavlm-base-plus-antispoof": _wavlm_detector,
        "acoustic-prosody-analyzer": _prosody_analyzer,
    }
    out = []
    for key, detector in detectors.items():
        card = get_model_card(key) or {}
        out.append({
            "model_key": key,
            "status": "connected" if detector.is_connected() else "simulated",
            "model_card": card,
        })
    return {"models": out}


@router.get("/models/{model_key}/card")
def model_card(model_key: str):
    card = get_model_card(model_key)
    if not card:
        return {"error": "Model card not found."}
    return card


@router.get("/models/cards")
def all_model_cards():
    return {"model_cards": list_model_cards()}


@router.get("/experiments")
def list_experiments(db: Session = Depends(get_db)):
    experiments = db.query(models.Experiment).order_by(models.Experiment.created_at.desc()).all()
    out = []
    for exp in experiments:
        results = db.query(models.ExperimentResult).filter_by(experiment_id=exp.id).all()
        out.append({
            "experiment_id": exp.id,
            "dataset": exp.dataset,
            "model": exp.model,
            "attack_type": exp.attack_type,
            "created_at": exp.created_at.isoformat() if exp.created_at else None,
            "results": [
                {
                    "software_version": r.software_version,
                    "metrics": r.metrics,
                    "n_samples": r.n_samples,
                    "dataset_available": r.dataset_available,
                }
                for r in results
            ] or [{"metrics": None, "note": "No experiment results available."}],
        })
    return {"experiments": out}


@router.post("/experiments/run")
def run_experiment(payload: ExperimentRunRequest, db: Session = Depends(get_db)):
    config = ExperimentConfig(
        dataset=payload.dataset,
        model=payload.model,
        attack_type=payload.attack_type,
        segment_length_s=payload.segment_length_s,
        decision_threshold=payload.decision_threshold,
        fusion_weights=payload.fusion_weights,
    )

    scores = np.array(payload.scores) if payload.scores else None
    labels = np.array(payload.labels) if payload.labels else None

    result = _experiment_runner.run_experiment(config, scores, labels)

    exp_row = models.Experiment(
        dataset=payload.dataset,
        model=payload.model,
        attack_type=payload.attack_type,
        segment_length_s=payload.segment_length_s,
        decision_threshold=payload.decision_threshold,
        fusion_weights=payload.fusion_weights,
    )
    db.add(exp_row)
    db.flush()

    db.add(models.ExperimentResult(
        experiment_id=exp_row.id,
        software_version=result["software_version"],
        metrics=result["metrics"] or None,
        n_samples=result["n_samples"],
        dataset_available=result["dataset_available"],
    ))
    db.commit()

    if not result["dataset_available"]:
        result["message"] = "No experiment results available. Provide real (scores, labels) from an " \
                              "ASVspoof protocol run to compute metrics."
    return result
