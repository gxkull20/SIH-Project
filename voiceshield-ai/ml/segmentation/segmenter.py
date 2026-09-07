"""
Segmentation (Section 15).

Splits a preprocessed mono waveform into fixed-length segments for
per-segment analysis. Default 5 seconds, configurable. The last segment is
kept even if shorter than the window (padded metadata, not padded audio) so
no audio is silently dropped.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field

import numpy as np

DEFAULT_SEGMENT_SECONDS = 5.0
MIN_SEGMENT_SECONDS = 1.0
MAX_SEGMENT_SECONDS = 30.0


@dataclass
class Segment:
    segment_id: str
    index: int
    start_s: float
    end_s: float
    waveform: np.ndarray

    @property
    def duration_s(self) -> float:
        return self.end_s - self.start_s


@dataclass
class SegmentationResult:
    segments: list[Segment] = field(default_factory=list)
    segment_length_s: float = DEFAULT_SEGMENT_SECONDS
    total_duration_s: float = 0.0


def segment_waveform(
    waveform: np.ndarray,
    sample_rate: int,
    segment_length_s: float = DEFAULT_SEGMENT_SECONDS,
    session_id: str | None = None,
) -> SegmentationResult:
    segment_length_s = max(MIN_SEGMENT_SECONDS, min(MAX_SEGMENT_SECONDS, segment_length_s))
    window = int(segment_length_s * sample_rate)
    total_samples = len(waveform)
    total_duration_s = total_samples / float(sample_rate)

    segments: list[Segment] = []
    idx = 0
    pos = 0
    prefix = f"{session_id}-seg" if session_id else "seg"
    while pos < total_samples:
        end = min(pos + window, total_samples)
        chunk = waveform[pos:end]
        start_s = pos / float(sample_rate)
        end_s = end / float(sample_rate)
        segments.append(
            Segment(
                segment_id=f"{prefix}-{idx:03d}-{uuid.uuid4().hex[:6]}",
                index=idx,
                start_s=start_s,
                end_s=end_s,
                waveform=chunk,
            )
        )
        idx += 1
        pos = end

    return SegmentationResult(
        segments=segments,
        segment_length_s=segment_length_s,
        total_duration_s=total_duration_s,
    )
