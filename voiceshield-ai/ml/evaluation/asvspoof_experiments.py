"""
ASVspoof experiment framework (Section 38-39).

This module defines the experiment contract: dataset selection, model
selection, configuration, and metric computation (EER/ROC-AUC/F1/Precision/
Recall) using real sklearn/numpy math over whatever labeled scores are
actually supplied.

IMPORTANT: This prototype ships WITHOUT the ASVspoof dataset itself (it must
be obtained separately per its license — see docs/research/asvspoof.md).
`run_experiment` requires the caller to supply a real (or explicitly
synthetic-for-testing) set of (score, label) pairs. If no dataset is
configured, the API layer must return "No experiment results available." —
this module never invents scores to fill that gap.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import numpy as np


@dataclass
class ExperimentConfig:
    dataset: str
    model: str
    attack_type: str | None = None
    segment_length_s: float = 5.0
    decision_threshold: float = 0.5
    fusion_weights: dict[str, float] | None = None

    def to_dict(self) -> dict[str, Any]:
        return self.__dict__.copy()


@dataclass
class ExperimentResult:
    experiment_id: str
    config: ExperimentConfig
    timestamp: str
    software_version: str
    metrics: dict[str, float]
    n_samples: int
    dataset_available: bool

    def to_dict(self) -> dict[str, Any]:
        return {
            "experiment_id": self.experiment_id,
            "config": self.config.to_dict(),
            "timestamp": self.timestamp,
            "software_version": self.software_version,
            "metrics": self.metrics,
            "n_samples": self.n_samples,
            "dataset_available": self.dataset_available,
        }


def compute_eer(scores: np.ndarray, labels: np.ndarray) -> float:
    """
    Equal Error Rate from genuine (label=0) vs spoof (label=1) scores.
    Standard ASVspoof-style EER computation via ROC.
    """
    from sklearn.metrics import roc_curve

    fpr, tpr, _ = roc_curve(labels, scores)
    fnr = 1 - tpr
    idx = np.nanargmin(np.abs(fnr - fpr))
    return float((fpr[idx] + fnr[idx]) / 2)


def compute_metrics(scores: np.ndarray, labels: np.ndarray, threshold: float) -> dict[str, float]:
    from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score

    preds = (scores >= threshold).astype(int)
    return {
        "EER": compute_eer(scores, labels),
        "ROC_AUC": float(roc_auc_score(labels, scores)),
        "F1": float(f1_score(labels, preds, zero_division=0)),
        "Precision": float(precision_score(labels, preds, zero_division=0)),
        "Recall": float(recall_score(labels, preds, zero_division=0)),
    }


class ASVspoofExperimentRunner:
    SOFTWARE_VERSION = "voiceshield-ai-eval-0.1.0"

    def run_experiment(
        self,
        config: ExperimentConfig,
        scores: np.ndarray | None,
        labels: np.ndarray | None,
    ) -> dict[str, Any]:
        """
        `scores`/`labels` must come from an actual dataset run by the caller
        (e.g. ASVspoof2019 LA eval protocol scores). If either is None or
        empty, this returns dataset_available=False and metrics=None —
        the API layer surfaces "No experiment results available." verbatim.
        """
        if scores is None or labels is None or len(scores) == 0:
            return ExperimentResult(
                experiment_id=f"exp-{uuid.uuid4().hex[:8]}",
                config=config,
                timestamp=datetime.now(timezone.utc).isoformat(),
                software_version=self.SOFTWARE_VERSION,
                metrics={},
                n_samples=0,
                dataset_available=False,
            ).to_dict()

        metrics = compute_metrics(np.asarray(scores), np.asarray(labels), config.decision_threshold)

        return ExperimentResult(
            experiment_id=f"exp-{uuid.uuid4().hex[:8]}",
            config=config,
            timestamp=datetime.now(timezone.utc).isoformat(),
            software_version=self.SOFTWARE_VERSION,
            metrics=metrics,
            n_samples=int(len(scores)),
            dataset_available=True,
        ).to_dict()
