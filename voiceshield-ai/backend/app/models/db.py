from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    display_name = Column(String, nullable=True)     # no unnecessary PII stored
    role = Column(String, default="student")          # student | researcher | judge | admin
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("AnalysisSession", back_populates="user")


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    mode = Column(String, default="upload")           # upload | live | demo
    status = Column(String, default="pending")        # pending|processing|complete|failed
    segment_length_s = Column(Float, default=5.0)
    fusion_weights = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    user = relationship("User", back_populates="sessions")
    audio_metadata = relationship("AudioMetadata", back_populates="session", uselist=False)
    segments = relationship("AudioSegment", back_populates="session")
    risk_scores = relationship("RiskScore", back_populates="session")
    verification_results = relationship("VerificationResult", back_populates="session")
    reports = relationship("Report", back_populates="session")


class AudioMetadata(Base):
    __tablename__ = "audio_metadata"
    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("analysis_sessions.id"))
    filename = Column(String, nullable=True)
    duration_s = Column(Float)
    sample_rate = Column(Integer)
    original_sample_rate = Column(Integer, nullable=True)
    channels = Column(Integer, nullable=True)
    format = Column(String, nullable=True)
    storage_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("AnalysisSession", back_populates="audio_metadata")


class AudioSegment(Base):
    __tablename__ = "audio_segments"
    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("analysis_sessions.id"), index=True)
    segment_index = Column(Integer)
    start_s = Column(Float)
    end_s = Column(Float)
    transcript_text = Column(Text, nullable=True)

    session = relationship("AnalysisSession", back_populates="segments")
    predictions = relationship("SegmentPrediction", back_populates="segment")


class SegmentPrediction(Base):
    __tablename__ = "segment_predictions"
    id = Column(String, primary_key=True, default=gen_uuid)
    segment_id = Column(String, ForeignKey("audio_segments.id"), index=True)
    model_name = Column(String)
    model_version = Column(String)
    status = Column(String)
    synthetic_likelihood = Column(Float, nullable=True)
    human_likelihood = Column(Float, nullable=True)
    uncertainty = Column(Float, nullable=True)
    processing_time_ms = Column(Float, nullable=True)
    is_simulated = Column(Boolean, default=True)
    message = Column(Text, nullable=True)
    evidence_ref = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    segment = relationship("AudioSegment", back_populates="predictions")


class ModelPrediction(Base):
    """Session-level aggregate/fused prediction (as distinct from per-segment)."""
    __tablename__ = "model_predictions"
    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("analysis_sessions.id"), index=True)
    synthetic_likelihood = Column(Float, nullable=True)
    human_likelihood = Column(Float, nullable=True)
    model_agreement = Column(Float, nullable=True)
    uncertainty = Column(Float, nullable=True)
    contributing_models = Column(JSON, nullable=True)
    unavailable_models = Column(JSON, nullable=True)
    any_simulated = Column(Boolean, default=True)
    weights_used = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Organization(Base):
    __tablename__ = "organizations"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, unique=True)
    is_fictional_demo_data = Column(Boolean, default=True)

    branches = relationship("Branch", back_populates="organization")


class Branch(Base):
    __tablename__ = "branches"
    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"))
    name = Column(String)
    location_id = Column(String, ForeignKey("locations.id"), nullable=True)

    organization = relationship("Organization", back_populates="branches")
    location = relationship("Location")


class Location(Base):
    __tablename__ = "locations"
    id = Column(String, primary_key=True, default=gen_uuid)
    city = Column(String)
    state = Column(String, nullable=True)
    country = Column(String, default="India")


class VerificationResult(Base):
    __tablename__ = "verification_results"
    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("analysis_sessions.id"), index=True)
    claimed_organization = Column(String, nullable=True)
    organization_state = Column(String, nullable=True)
    claimed_branch = Column(String, nullable=True)
    branch_state = Column(String, nullable=True)
    caller_id = Column(String, nullable=True)
    caller_state = Column(String, nullable=True)
    raw_result = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("AnalysisSession", back_populates="verification_results")


class RiskScore(Base):
    __tablename__ = "risk_scores"
    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("analysis_sessions.id"), index=True)
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)
    risk_factors = Column(JSON, nullable=True)
    recommendation = Column(Text, nullable=True)
    thresholds_used = Column(JSON, nullable=True)
    weights_used = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("AnalysisSession", back_populates="risk_scores")


class EvidenceItemRow(Base):
    __tablename__ = "evidence_items"
    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("analysis_sessions.id"), index=True)
    category = Column(String)
    severity = Column(String)
    title = Column(String)
    description = Column(Text)
    source = Column(String)
    segment_id = Column(String, nullable=True)
    timestamp_s = Column(Float, nullable=True)
    model_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Experiment(Base):
    __tablename__ = "experiments"
    id = Column(String, primary_key=True, default=gen_uuid)
    dataset = Column(String)
    model = Column(String)
    attack_type = Column(String, nullable=True)
    segment_length_s = Column(Float, default=5.0)
    decision_threshold = Column(Float, default=0.5)
    fusion_weights = Column(JSON, nullable=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    results = relationship("ExperimentResult", back_populates="experiment")


class ExperimentResult(Base):
    __tablename__ = "experiment_results"
    id = Column(String, primary_key=True, default=gen_uuid)
    experiment_id = Column(String, ForeignKey("experiments.id"), index=True)
    software_version = Column(String)
    metrics = Column(JSON, nullable=True)
    n_samples = Column(Integer, default=0)
    dataset_available = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="results")


class ModelVersion(Base):
    __tablename__ = "model_versions"
    id = Column(String, primary_key=True, default=gen_uuid)
    model_key = Column(String, index=True)
    version = Column(String)
    status = Column(String)                # connected | simulated | unavailable
    checkpoint_path = Column(String, nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)


class ModelCard(Base):
    __tablename__ = "model_cards"
    id = Column(String, primary_key=True, default=gen_uuid)
    model_key = Column(String, unique=True, index=True)
    card_data = Column(JSON)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"
    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("analysis_sessions.id"), index=True)
    storage_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("AnalysisSession", back_populates="reports")
