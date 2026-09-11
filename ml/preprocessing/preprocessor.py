"""
Audio preprocessing pipeline.

Responsibilities (Section 14 of the spec):
- file validation
- decoding
- channel normalization (stereo -> mono)
- resampling to a configurable target rate (default 16kHz)
- amplitude normalization
- structured, meaningful errors for bad input

This module intentionally has zero ML in it — it only prepares audio for
the detectors. Keeping it separate means a student can unit test it without
loading any model weights.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import numpy as np

DEFAULT_SAMPLE_RATE = 16_000
MAX_DURATION_SECONDS = 60 * 15   # 15 minutes hard cap for the prototype
MIN_DURATION_SECONDS = 0.5
MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024  # 200MB
SUPPORTED_EXTENSIONS = {".wav", ".mp3", ".flac"}


class AudioValidationError(Exception):
    """Raised for any audio that cannot be safely processed. Message is user-facing."""


@dataclass
class PreprocessConfig:
    target_sample_rate: int = DEFAULT_SAMPLE_RATE
    normalize_amplitude: bool = True
    force_mono: bool = True


@dataclass
class PreprocessedAudio:
    waveform: np.ndarray          # float32, mono, shape (n_samples,)
    sample_rate: int
    duration_s: float
    original_sample_rate: int
    original_channels: int
    original_format: str


def validate_upload(filename: str, size_bytes: int) -> None:
    ext = "." + filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in SUPPORTED_EXTENSIONS:
        raise AudioValidationError(
            f"Unsupported audio format '{ext or 'unknown'}'. Supported formats: WAV, MP3, FLAC."
        )
    if size_bytes <= 0:
        raise AudioValidationError("The uploaded file is empty.")
    if size_bytes > MAX_FILE_SIZE_BYTES:
        raise AudioValidationError(
            f"File is too large ({size_bytes / (1024*1024):.1f} MB). Maximum supported size is "
            f"{MAX_FILE_SIZE_BYTES / (1024*1024):.0f} MB."
        )


def load_and_preprocess(file_path: str, config: Optional[PreprocessConfig] = None) -> PreprocessedAudio:
    """
    Decode an audio file from disk and return a normalized, mono, resampled
    waveform ready for segmentation. Raises AudioValidationError with a
    user-safe message on any failure (corrupted file, unsupported codec,
    zero-length audio, etc.).
    """
    config = config or PreprocessConfig()
    try:
        import librosa
    except ImportError as exc:  # pragma: no cover - dependency not installed in this environment
        raise AudioValidationError(
            "Audio decoding library (librosa) is not installed on the server."
        ) from exc

    try:
        # librosa.load handles WAV, MP3, FLAC and most common formats.
        # mono=False keeps the original channel layout so we can record it.
        waveform_raw, original_sr = librosa.load(
            file_path, sr=None, mono=False, dtype=np.float32
        )
    except Exception as exc:
        raise AudioValidationError(
            f"Audio could not be decoded. The file may be corrupted or use an unsupported codec. ({exc})"
        ) from exc

    # Determine channel count and force mono if requested
    if waveform_raw.ndim == 1:
        original_channels = 1
        waveform = waveform_raw
    else:
        original_channels = waveform_raw.shape[0]
        waveform = np.mean(waveform_raw, axis=0) if config.force_mono else waveform_raw[0]

    if waveform.size == 0:
        raise AudioValidationError("The audio file contains no samples.")

    waveform = waveform.astype(np.float32)

    duration_s = len(waveform) / float(original_sr)
    if duration_s < MIN_DURATION_SECONDS:
        raise AudioValidationError(
            f"Audio is too short to analyze ({duration_s:.2f}s). Minimum duration is {MIN_DURATION_SECONDS}s."
        )
    if duration_s > MAX_DURATION_SECONDS:
        raise AudioValidationError(
            f"Audio is too long ({duration_s / 60:.1f} min). Maximum supported duration is "
            f"{MAX_DURATION_SECONDS / 60:.0f} minutes for this prototype."
        )

    if original_sr != config.target_sample_rate:
        waveform = librosa.resample(
            waveform, orig_sr=original_sr, target_sr=config.target_sample_rate
        )

    if config.normalize_amplitude:
        peak = np.max(np.abs(waveform)) if waveform.size else 0.0
        if peak > 1e-6:
            waveform = waveform / peak * 0.95

    return PreprocessedAudio(
        waveform=waveform,
        sample_rate=config.target_sample_rate,
        duration_s=len(waveform) / float(config.target_sample_rate),
        original_sample_rate=int(original_sr),
        original_channels=int(original_channels),
        original_format=file_path.rsplit(".", 1)[-1].lower(),
    )
