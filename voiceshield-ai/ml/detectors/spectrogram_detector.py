"""
SpectrogramDetector (Section 16).

Pipeline: audio segment -> mel-spectrogram -> CNN classifier -> prediction.

Two modes:
  - CONNECTED: a real checkpoint is found at SPECTROGRAM_MODEL_PATH and loads
    successfully. Runs an actual forward pass with torch.
  - SIMULATED: no checkpoint configured/available. Returns a clearly labeled
    development prediction derived from simple deterministic signal
    statistics (NOT a trained model) so the rest of the pipeline is
    exercisable end-to-end. This is explicitly a dev adapter, never
    presented as production inference (see ml/base.py DetectorPrediction.is_simulated).
"""

from __future__ import annotations

import hashlib
import os
from typing import Optional

import numpy as np

from ml.base import BaseVoiceDetector, DetectorPrediction, ModelStatus

MODEL_NAME = "spectrogram-cnn"
MODEL_VERSION = os.environ.get("SPECTROGRAM_MODEL_VERSION", "dev-0.1.0")


class SpectrogramDetector(BaseVoiceDetector):
    model_name = MODEL_NAME
    model_version = MODEL_VERSION

    def __init__(self, checkpoint_path: Optional[str] = None):
        self.checkpoint_path = checkpoint_path or os.environ.get("SPECTROGRAM_MODEL_PATH")
        self._model = None
        self._load_attempted = False

    def _try_load(self) -> None:
        if self._load_attempted:
            return
        self._load_attempted = True
        if not self.checkpoint_path or not os.path.exists(self.checkpoint_path):
            return
        try:
            import torch  # noqa: F401
            self._model = torch.load(self.checkpoint_path, map_location="cpu")
        except Exception:
            self._model = None

    def is_connected(self) -> bool:
        self._try_load()
        return self._model is not None

    def _mel_spectrogram(self, waveform: np.ndarray, sample_rate: int) -> Optional[np.ndarray]:
        try:
            import librosa
            spec = librosa.feature.melspectrogram(y=waveform, sr=sample_rate, n_mels=80)
            return librosa.power_to_db(spec, ref=np.max)
        except Exception:
            return None

    def predict(self, segment_id: str, waveform: np.ndarray, sample_rate: int) -> DetectorPrediction:
        self._try_load()
        spec = self._mel_spectrogram(waveform, sample_rate)
        evidence_ref = f"spectrogram:{segment_id}" if spec is not None else None

        if self._model is not None and spec is not None:
            # Real inference path (only exercised once a checkpoint is actually configured).
            try:
                import torch
                with torch.no_grad():
                    tensor = torch.tensor(spec).unsqueeze(0).unsqueeze(0).float()
                    logits = self._model(tensor)
                    prob_synthetic = float(torch.sigmoid(logits).flatten()[0])
                return DetectorPrediction(
                    segment_id=segment_id,
                    model_name=self.model_name,
                    model_version=self.model_version,
                    status=ModelStatus.CONNECTED,
                    synthetic_likelihood=prob_synthetic,
                    human_likelihood=1.0 - prob_synthetic,
                    uncertainty=None,
                    is_simulated=False,
                    evidence_ref=evidence_ref,
                )
            except Exception as exc:
                return DetectorPrediction(
                    segment_id=segment_id,
                    model_name=self.model_name,
                    model_version=self.model_version,
                    status=ModelStatus.UNAVAILABLE,
                    is_simulated=True,
                    message=f"Model inference failed: {exc.__class__.__name__}",
                    evidence_ref=evidence_ref,
                )

        if spec is None:
            return DetectorPrediction(
                segment_id=segment_id,
                model_name=self.model_name,
                model_version=self.model_version,
                status=ModelStatus.UNAVAILABLE,
                is_simulated=True,
                message="Spectrogram extraction unavailable (librosa not installed).",
            )

        # SIMULATION MODE — explicitly not a trained model.
        # Deterministic pseudo-signal from spectral variance, seeded by segment_id
        # so results are stable/reproducible across runs, but has NO scientific
        # validity as a synthetic-speech signal.
        variance = float(np.var(spec))
        seed = int(hashlib.sha256(segment_id.encode()).hexdigest(), 16) % (2**32)
        rng = np.random.default_rng(seed)
        noise = rng.uniform(-0.05, 0.05)
        pseudo_score = float(np.clip(0.5 + np.tanh((variance - 40) / 80) * 0.3 + noise, 0.02, 0.98))

        return DetectorPrediction(
            segment_id=segment_id,
            model_name=self.model_name,
            model_version=self.model_version,
            status=ModelStatus.SIMULATED,
            synthetic_likelihood=pseudo_score,
            human_likelihood=1.0 - pseudo_score,
            uncertainty=0.35,
            is_simulated=True,
            message="Development/Simulation Mode — no trained checkpoint connected.",
            evidence_ref=evidence_ref,
        )
