"""
ProsodyAnalyzer (Section 18).

This module extracts real, measurable acoustic features (pitch, energy,
pause structure, speaking rate, spectral shape, jitter/shimmer-style
variation). These features ARE real DSP, not simulated — librosa/numpy
compute them directly from the waveform.

What IS a simulation here is the mapping from "features" to
"synthetic_likelihood": there is no trained classifier backing that number
in this prototype, so it is explicitly flagged `is_simulated=True` and
described as a weak heuristic, never as a validated model. The spec is
explicit: "Do not claim that any single feature proves synthetic speech."
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Optional

import numpy as np

from ml.base import BaseVoiceDetector, DetectorPrediction, ModelStatus

MODEL_NAME = "acoustic-prosody-analyzer"
MODEL_VERSION = os.environ.get("PROSODY_MODEL_VERSION", "0.1.0")


@dataclass
class ProsodyFeatures:
    pitch_mean_hz: Optional[float]
    pitch_std_hz: Optional[float]
    energy_mean: Optional[float]
    energy_std: Optional[float]
    pause_ratio: Optional[float]
    speaking_rate_proxy: Optional[float]
    spectral_centroid_mean: Optional[float]
    spectral_flatness_mean: Optional[float]
    jitter_like: Optional[float]

    def to_dict(self) -> dict[str, Any]:
        return self.__dict__.copy()


class ProsodyAnalyzer(BaseVoiceDetector):
    model_name = MODEL_NAME
    model_version = MODEL_VERSION

    def is_connected(self) -> bool:
        # Feature extraction itself is "real" (librosa), but there is no
        # trained classifier here — always report as a heuristic signal.
        try:
            import librosa  # noqa: F401
            return True
        except ImportError:
            return False

    def extract_features(self, waveform: np.ndarray, sample_rate: int) -> Optional[ProsodyFeatures]:
        try:
            import librosa
        except ImportError:
            return None

        if waveform.size < sample_rate // 4:
            return None

        try:
            f0, voiced_flag, _ = librosa.pyin(
                waveform, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"), sr=sample_rate
            )
            voiced_f0 = f0[~np.isnan(f0)] if f0 is not None else np.array([])
            pitch_mean = float(np.mean(voiced_f0)) if voiced_f0.size else None
            pitch_std = float(np.std(voiced_f0)) if voiced_f0.size else None

            rms = librosa.feature.rms(y=waveform)[0]
            energy_mean = float(np.mean(rms))
            energy_std = float(np.std(rms))

            voiced_ratio = float(np.mean(voiced_flag)) if voiced_flag is not None and voiced_flag.size else None
            pause_ratio = (1.0 - voiced_ratio) if voiced_ratio is not None else None

            zero_crossings = librosa.feature.zero_crossing_rate(waveform)[0]
            speaking_rate_proxy = float(np.mean(zero_crossings))

            centroid = librosa.feature.spectral_centroid(y=waveform, sr=sample_rate)[0]
            flatness = librosa.feature.spectral_flatness(y=waveform)[0]

            jitter_like = float(np.std(np.diff(voiced_f0))) if voiced_f0.size > 2 else None

            return ProsodyFeatures(
                pitch_mean_hz=pitch_mean,
                pitch_std_hz=pitch_std,
                energy_mean=energy_mean,
                energy_std=energy_std,
                pause_ratio=pause_ratio,
                speaking_rate_proxy=speaking_rate_proxy,
                spectral_centroid_mean=float(np.mean(centroid)),
                spectral_flatness_mean=float(np.mean(flatness)),
                jitter_like=jitter_like,
            )
        except Exception:
            return None

    def predict(self, segment_id: str, waveform: np.ndarray, sample_rate: int) -> DetectorPrediction:
        features = self.extract_features(waveform, sample_rate)

        if features is None:
            return DetectorPrediction(
                segment_id=segment_id,
                model_name=self.model_name,
                model_version=self.model_version,
                status=ModelStatus.UNAVAILABLE,
                is_simulated=True,
                message="Prosodic feature extraction unavailable for this segment.",
            )

        # Weak heuristic only — explicitly NOT a validated classifier.
        # Very low pitch variance combined with very high spectral flatness is
        # *sometimes* associated with synthetic speech in literature, but this
        # single heuristic is not sufficient evidence on its own.
        score = 0.5
        if features.pitch_std_hz is not None:
            score += -0.15 if features.pitch_std_hz > 25 else 0.1
        if features.spectral_flatness_mean is not None:
            score += 0.15 if features.spectral_flatness_mean > 0.3 else -0.05
        score = float(np.clip(score, 0.05, 0.95))

        return DetectorPrediction(
            segment_id=segment_id,
            model_name=self.model_name,
            model_version=self.model_version,
            status=ModelStatus.SIMULATED,
            synthetic_likelihood=score,
            human_likelihood=1.0 - score,
            uncertainty=0.5,
            is_simulated=True,
            message="Heuristic signal from acoustic features — not a trained classifier. "
                    "Do not treat any single prosodic feature as proof of synthetic speech.",
            evidence_ref=f"prosody-features:{segment_id}",
        )
