"""
WavLMDetector (Section 17).

CONNECTED mode expects a HuggingFace WavLM-family checkpoint + a small
classification head fine-tuned for synthetic-speech detection
(e.g. on ASVspoof). SIMULATED mode is a clearly-labeled deterministic
dev adapter — see spectrogram_detector.py for the same pattern and rationale.
"""

from __future__ import annotations

import hashlib
import os
from typing import Optional

import numpy as np

from ml.base import BaseVoiceDetector, DetectorPrediction, ModelStatus

MODEL_NAME = "wavlm-base-plus-antispoof"
MODEL_VERSION = os.environ.get("WAVLM_MODEL_VERSION", "dev-0.1.0")


class WavLMDetector(BaseVoiceDetector):
    model_name = MODEL_NAME
    model_version = MODEL_VERSION

    def __init__(self, checkpoint_path: Optional[str] = None):
        self.checkpoint_path = checkpoint_path or os.environ.get("WAVLM_MODEL_PATH")
        self._model = None
        self._feature_extractor = None
        self._load_attempted = False

    def _try_load(self) -> None:
        if self._load_attempted:
            return
        self._load_attempted = True
        if not self.checkpoint_path or not os.path.exists(self.checkpoint_path):
            return
        try:
            import torch
            from transformers import WavLMModel, Wav2Vec2FeatureExtractor

            self._feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(
                "microsoft/wavlm-base-plus"
            )
            base = WavLMModel.from_pretrained("microsoft/wavlm-base-plus")
            head_state = torch.load(self.checkpoint_path, map_location="cpu")
            self._model = {"backbone": base, "head": head_state}
        except Exception:
            self._model = None

    def is_connected(self) -> bool:
        self._try_load()
        return self._model is not None

    def predict(self, segment_id: str, waveform: np.ndarray, sample_rate: int) -> DetectorPrediction:
        self._try_load()

        if self._model is not None:
            try:
                import torch

                inputs = self._feature_extractor(
                    waveform, sampling_rate=sample_rate, return_tensors="pt"
                )
                with torch.no_grad():
                    hidden = self._model["backbone"](**inputs).last_hidden_state.mean(dim=1)
                    logits = hidden @ self._model["head"]["weight"].T + self._model["head"]["bias"]
                    prob_synthetic = float(torch.sigmoid(logits).flatten()[0])
                return DetectorPrediction(
                    segment_id=segment_id,
                    model_name=self.model_name,
                    model_version=self.model_version,
                    status=ModelStatus.CONNECTED,
                    synthetic_likelihood=prob_synthetic,
                    human_likelihood=1.0 - prob_synthetic,
                    is_simulated=False,
                )
            except Exception as exc:
                return DetectorPrediction(
                    segment_id=segment_id,
                    model_name=self.model_name,
                    model_version=self.model_version,
                    status=ModelStatus.UNAVAILABLE,
                    is_simulated=True,
                    message=f"Model inference failed: {exc.__class__.__name__}",
                )

        # SIMULATION MODE
        seed = int(hashlib.sha256((segment_id + "wavlm").encode()).hexdigest(), 16) % (2**32)
        rng = np.random.default_rng(seed)
        zero_crossings = int(np.sum(np.diff(np.signbit(waveform)))) if waveform.size > 1 else 0
        zc_rate = zero_crossings / max(1, len(waveform))
        pseudo_score = float(np.clip(0.5 + (zc_rate - 0.05) * 2.0 + rng.uniform(-0.07, 0.07), 0.02, 0.98))

        return DetectorPrediction(
            segment_id=segment_id,
            model_name=self.model_name,
            model_version=self.model_version,
            status=ModelStatus.SIMULATED,
            synthetic_likelihood=pseudo_score,
            human_likelihood=1.0 - pseudo_score,
            uncertainty=0.4,
            is_simulated=True,
            message="Development/Simulation Mode — no fine-tuned WavLM checkpoint connected.",
        )
