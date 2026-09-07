"""
VoiceShield-AI — Core ML Interfaces
------------------------------------
Every detector, verifier and engine in this project implements one of the
abstract base classes defined here. This is what makes the architecture
"student-deployable": a researcher can write a new class that satisfies one
of these interfaces and drop it in, without touching the rest of the app.

HARD RULE (see /docs/research/scientific-integrity.md):
No component may invent a numeric result. If a real model is not loaded,
`is_simulated` MUST be True and the result must say so explicitly. Nothing
in the frontend is allowed to render a simulated value without the
"Development/Simulation Mode" badge.
"""

from __future__ import annotations

import abc
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional


class ModelStatus(str, Enum):
    CONNECTED = "connected"           # Real trained weights loaded
    SIMULATED = "simulated"           # Deterministic/dev adapter, clearly labeled
    UNAVAILABLE = "unavailable"       # Failed to load / crashed


class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class EvidenceCategory(str, Enum):
    VOICE = "VOICE"
    CONVERSATION = "CONVERSATION"
    IDENTITY = "IDENTITY"
    CONTEXT = "CONTEXT"


class EvidenceSeverity(str, Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class VerificationState(str, Enum):
    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    INCONSISTENT = "inconsistent"
    UNKNOWN = "unknown"
    REQUIRES_INDEPENDENT_VERIFICATION = "requires_independent_verification"


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class DetectorPrediction:
    """
    Standard output shape for every voice-authenticity detector
    (Spectrogram, WavLM, Prosody, ...). Never rename these fields —
    the fusion engine and frontend both depend on this exact contract.
    """
    segment_id: str
    model_name: str
    model_version: str
    status: ModelStatus
    synthetic_likelihood: Optional[float] = None   # 0.0 - 1.0, None if unavailable
    human_likelihood: Optional[float] = None       # 0.0 - 1.0, None if unavailable
    uncertainty: Optional[float] = None            # 0.0 - 1.0, None if not supported
    processing_time_ms: Optional[float] = None
    is_simulated: bool = True
    message: Optional[str] = None                  # e.g. "Model not connected"
    evidence_ref: Optional[str] = None              # pointer to spectrogram image / raw feature blob
    generated_at: str = field(default_factory=utcnow)

    def to_dict(self) -> dict[str, Any]:
        return {
            "segment_id": self.segment_id,
            "model_name": self.model_name,
            "model_version": self.model_version,
            "status": self.status.value,
            "synthetic_likelihood": self.synthetic_likelihood,
            "human_likelihood": self.human_likelihood,
            "uncertainty": self.uncertainty,
            "processing_time_ms": self.processing_time_ms,
            "is_simulated": self.is_simulated,
            "message": self.message,
            "evidence_ref": self.evidence_ref,
            "generated_at": self.generated_at,
        }


@dataclass
class EvidenceItem:
    id: str
    category: EvidenceCategory
    severity: EvidenceSeverity
    title: str
    description: str
    source: str                      # which module produced this evidence
    segment_id: Optional[str] = None
    timestamp_s: Optional[float] = None
    model_name: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "category": self.category.value,
            "severity": self.severity.value,
            "title": self.title,
            "description": self.description,
            "source": self.source,
            "segment_id": self.segment_id,
            "timestamp_s": self.timestamp_s,
            "model_name": self.model_name,
        }


class BaseVoiceDetector(abc.ABC):
    """
    Base contract for anything that scores a single audio segment for
    synthetic-speech likelihood (Spectrogram, WavLM, Prosody-based, or a
    future student-contributed model).
    """
    model_name: str = "unnamed-detector"
    model_version: str = "0.0.0"

    @abc.abstractmethod
    def is_connected(self) -> bool:
        """Return True only if real trained weights are loaded and usable."""
        raise NotImplementedError

    @abc.abstractmethod
    def predict(self, segment_id: str, waveform, sample_rate: int) -> DetectorPrediction:
        """
        Run inference on a single audio segment.
        MUST return status=UNAVAILABLE / is_simulated=True with likelihoods=None
        if a real model isn't loaded — never guess.
        """
        raise NotImplementedError

    def timed_predict(self, segment_id: str, waveform, sample_rate: int) -> DetectorPrediction:
        start = time.perf_counter()
        result = self.predict(segment_id, waveform, sample_rate)
        result.processing_time_ms = (time.perf_counter() - start) * 1000.0
        return result


class BaseFusionEngine(abc.ABC):
    @abc.abstractmethod
    def fuse(self, predictions: list[DetectorPrediction], weights: dict[str, float]) -> dict[str, Any]:
        """Combine multiple detector outputs into one fused signal + agreement/uncertainty stats."""
        raise NotImplementedError


class BaseTranscriber(abc.ABC):
    @abc.abstractmethod
    def is_connected(self) -> bool:
        raise NotImplementedError

    @abc.abstractmethod
    def transcribe(self, waveform, sample_rate: int) -> list[dict[str, Any]]:
        """Return list of {start_s, end_s, text} or raise/return [] with status flag if unavailable."""
        raise NotImplementedError


class BaseConversationAnalyzer(abc.ABC):
    @abc.abstractmethod
    def analyze(self, transcript_segments: list[dict[str, Any]]) -> dict[str, Any]:
        raise NotImplementedError


class BaseOTPDetector(abc.ABC):
    @abc.abstractmethod
    def detect(self, transcript_segments: list[dict[str, Any]]) -> dict[str, Any]:
        raise NotImplementedError


class BaseOrganizationVerifier(abc.ABC):
    @abc.abstractmethod
    def verify(self, claimed_org: Optional[str]) -> dict[str, Any]:
        raise NotImplementedError


class BaseBranchVerifier(abc.ABC):
    @abc.abstractmethod
    def verify(self, claimed_org: Optional[str], claimed_branch: Optional[str], claimed_city: Optional[str]) -> dict[str, Any]:
        raise NotImplementedError


class BaseCallerVerifier(abc.ABC):
    @abc.abstractmethod
    def verify(self, caller_id: Optional[str], org_result: dict[str, Any], branch_result: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError


class BaseRiskEngine(abc.ABC):
    @abc.abstractmethod
    def score(self, *, fusion_result: dict[str, Any], conversation_result: dict[str, Any],
               verification_result: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError


class BaseExplanationEngine(abc.ABC):
    @abc.abstractmethod
    def explain(self, *, fusion_result: dict[str, Any], conversation_result: dict[str, Any],
                 verification_result: dict[str, Any], risk_result: dict[str, Any]) -> list[EvidenceItem]:
        raise NotImplementedError


class BaseReportGenerator(abc.ABC):
    @abc.abstractmethod
    def generate(self, session_data: dict[str, Any]) -> bytes:
        raise NotImplementedError
