"""
Speech-to-text (Section 24). Replaceable interface — plug in
faster-whisper/whisper.cpp/any ASR here. If unavailable, returns an empty
list with a clear "unavailable" flag; NEVER fabricates transcript text.
"""

from __future__ import annotations

import os
from typing import Any

import numpy as np

from ml.base import BaseTranscriber


class WhisperTranscriber(BaseTranscriber):
    def __init__(self, model_size: str | None = None):
        self.model_size = model_size or os.environ.get("WHISPER_MODEL_SIZE", "base")
        self._model = None
        self._load_attempted = False

    def _try_load(self) -> None:
        if self._load_attempted:
            return
        self._load_attempted = True
        try:
            from faster_whisper import WhisperModel
            self._model = WhisperModel(self.model_size, device="cpu", compute_type="int8")
        except Exception:
            self._model = None

    def is_connected(self) -> bool:
        self._try_load()
        return self._model is not None

    def transcribe(self, waveform: np.ndarray, sample_rate: int) -> list[dict[str, Any]]:
        self._try_load()
        if self._model is None:
            return []
        try:
            segments, _info = self._model.transcribe(waveform, language=None, vad_filter=True)
            return [
                {"start_s": float(s.start), "end_s": float(s.end), "text": s.text.strip()}
                for s in segments
            ]
        except Exception:
            return []
