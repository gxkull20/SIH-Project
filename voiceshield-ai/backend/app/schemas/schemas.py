from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class AudioMetadataOut(BaseModel):
    filename: Optional[str]
    duration_s: float
    sample_rate: int
    original_sample_rate: Optional[int]
    channels: Optional[int]
    format: Optional[str]


class SegmentPredictionOut(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_name: str
    model_version: str
    status: str
    synthetic_likelihood: Optional[float]
    human_likelihood: Optional[float]
    uncertainty: Optional[float]
    processing_time_ms: Optional[float]
    is_simulated: bool
    message: Optional[str]
    evidence_ref: Optional[str]


class SegmentOut(BaseModel):
    segment_id: str
    index: int
    start_s: float
    end_s: float
    transcript_text: Optional[str] = None
    predictions: list[SegmentPredictionOut] = Field(default_factory=list)


class FusionOut(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    synthetic_likelihood: Optional[float]
    human_likelihood: Optional[float]
    model_agreement: Optional[float]
    uncertainty: Optional[float]
    contributing_models: list[str]
    unavailable_models: list[str]
    any_simulated: bool
    weights_used: dict[str, float]


class VerificationOut(BaseModel):
    organization: dict[str, Any]
    branch: dict[str, Any]
    caller: dict[str, Any]


class ConversationOut(BaseModel):
    signals: list[dict[str, Any]]
    signal_counts: dict[str, int]
    conversation_risk_hint: str
    otp_detection: dict[str, Any]


class RiskOut(BaseModel):
    risk_score: Optional[float]
    risk_level: Optional[str]
    risk_factors: list[str]
    recommendation: Optional[str]
    thresholds_used: dict[str, Any]
    weights_used: dict[str, float]
    is_scientifically_calibrated_probability: bool


class EvidenceOut(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    id: str
    category: str
    severity: str
    title: str
    description: str
    source: str
    segment_id: Optional[str]
    timestamp_s: Optional[float]
    model_name: Optional[str]


class AnalysisRequestOptions(BaseModel):
    segment_length_s: float = 5.0
    claimed_organization: Optional[str] = None
    claimed_branch: Optional[str] = None
    claimed_city: Optional[str] = None
    caller_id: Optional[str] = None
    fusion_weights: Optional[dict[str, float]] = None


class AnalysisSessionOut(BaseModel):
    session_id: str
    status: str
    mode: str
    audio: Optional[AudioMetadataOut] = None
    segments: list[SegmentOut] = Field(default_factory=list)
    fusion: Optional[FusionOut] = None
    conversation: Optional[ConversationOut] = None
    verification: Optional[VerificationOut] = None
    risk: Optional[RiskOut] = None
    evidence: list[EvidenceOut] = Field(default_factory=list)
    error_message: Optional[str] = None


class CallerVerifyRequest(BaseModel):
    claimed_organization: Optional[str] = None
    claimed_branch: Optional[str] = None
    claimed_city: Optional[str] = None
    caller_id: Optional[str] = None


class ExperimentRunRequest(BaseModel):
    dataset: str
    model: str
    attack_type: Optional[str] = None
    segment_length_s: float = 5.0
    decision_threshold: float = 0.5
    fusion_weights: Optional[dict[str, float]] = None
    scores: Optional[list[float]] = None   # optional real eval scores, e.g. from ASVspoof protocol
    labels: Optional[list[int]] = None     # 0 = genuine, 1 = spoof
