"""
FusionEngine (Section 20).

Combines Spectrogram + WavLM + Prosody predictions for a segment (or across
segments) into one fused synthetic-speech signal, an explicit model
agreement measure, and an uncertainty measure. Weights are configurable and
must be surfaced to the frontend/research lab, never hidden.

Design choice: fusion is a *weighted average of available signals*, not a
learned meta-model, in this prototype. That's a deliberate, documented
limitation (see docs/research) — it keeps behavior transparent and
auditable, which matters more for an explainability-first product than a
marginal accuracy gain from a black-box fuser.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import numpy as np

from ml.base import BaseFusionEngine, DetectorPrediction

DEFAULT_WEIGHTS = {
    "spectrogram-cnn": 0.35,
    "wavlm-base-plus-antispoof": 0.45,
    "acoustic-prosody-analyzer": 0.20,
}


@dataclass
class FusionResult:
    synthetic_likelihood: float | None
    human_likelihood: float | None
    model_agreement: float | None      # 1.0 = perfect agreement, 0.0 = maximal disagreement
    uncertainty: float | None
    contributing_models: list[str] = field(default_factory=list)
    unavailable_models: list[str] = field(default_factory=list)
    any_simulated: bool = True
    weights_used: dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "synthetic_likelihood": self.synthetic_likelihood,
            "human_likelihood": self.human_likelihood,
            "model_agreement": self.model_agreement,
            "uncertainty": self.uncertainty,
            "contributing_models": self.contributing_models,
            "unavailable_models": self.unavailable_models,
            "any_simulated": self.any_simulated,
            "weights_used": self.weights_used,
        }


class WeightedFusionEngine(BaseFusionEngine):
    def fuse(
        self,
        predictions: list[DetectorPrediction],
        weights: dict[str, float] | None = None,
    ) -> dict[str, Any]:
        weights = weights or DEFAULT_WEIGHTS
        usable = [p for p in predictions if p.synthetic_likelihood is not None]
        unavailable = [p.model_name for p in predictions if p.synthetic_likelihood is None]

        if not usable:
            return FusionResult(
                synthetic_likelihood=None,
                human_likelihood=None,
                model_agreement=None,
                uncertainty=None,
                contributing_models=[],
                unavailable_models=unavailable,
                any_simulated=True,
                weights_used={},
            ).to_dict()

        raw_weights = np.array([weights.get(p.model_name, 1.0 / len(usable)) for p in usable])
        norm_weights = raw_weights / raw_weights.sum()

        scores = np.array([p.synthetic_likelihood for p in usable])
        fused_score = float(np.dot(norm_weights, scores))

        # Model agreement: 1 - normalized spread between highest/lowest score.
        spread = float(np.max(scores) - np.min(scores)) if len(scores) > 1 else 0.0
        agreement = float(np.clip(1.0 - spread, 0.0, 1.0))

        # Uncertainty: combine per-model uncertainty (if given) with disagreement.
        model_uncertainties = [p.uncertainty for p in usable if p.uncertainty is not None]
        mean_model_uncertainty = float(np.mean(model_uncertainties)) if model_uncertainties else 0.4
        uncertainty = float(np.clip(0.5 * mean_model_uncertainty + 0.5 * spread, 0.0, 1.0))

        return FusionResult(
            synthetic_likelihood=fused_score,
            human_likelihood=1.0 - fused_score,
            model_agreement=agreement,
            uncertainty=uncertainty,
            contributing_models=[p.model_name for p in usable],
            unavailable_models=unavailable,
            any_simulated=any(p.is_simulated for p in usable),
            weights_used={p.model_name: float(w) for p, w in zip(usable, norm_weights)},
        ).to_dict()
