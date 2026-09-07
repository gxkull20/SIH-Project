"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-01-01 00:00:00

"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("display_name", sa.String, nullable=True),
        sa.Column("role", sa.String, server_default="student"),
        sa.Column("created_at", sa.DateTime),
    )

    op.create_table(
        "analysis_sessions",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("user_id", sa.String, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("mode", sa.String, server_default="upload"),
        sa.Column("status", sa.String, server_default="pending"),
        sa.Column("segment_length_s", sa.Float, server_default="5.0"),
        sa.Column("fusion_weights", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime),
        sa.Column("completed_at", sa.DateTime, nullable=True),
        sa.Column("error_message", sa.Text, nullable=True),
    )

    op.create_table(
        "audio_metadata",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("session_id", sa.String, sa.ForeignKey("analysis_sessions.id")),
        sa.Column("filename", sa.String, nullable=True),
        sa.Column("duration_s", sa.Float),
        sa.Column("sample_rate", sa.Integer),
        sa.Column("original_sample_rate", sa.Integer, nullable=True),
        sa.Column("channels", sa.Integer, nullable=True),
        sa.Column("format", sa.String, nullable=True),
        sa.Column("storage_path", sa.String, nullable=True),
        sa.Column("created_at", sa.DateTime),
    )

    op.create_table(
        "audio_segments",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("session_id", sa.String, sa.ForeignKey("analysis_sessions.id"), index=True),
        sa.Column("segment_index", sa.Integer),
        sa.Column("start_s", sa.Float),
        sa.Column("end_s", sa.Float),
        sa.Column("transcript_text", sa.Text, nullable=True),
    )

    op.create_table(
        "segment_predictions",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("segment_id", sa.String, sa.ForeignKey("audio_segments.id"), index=True),
        sa.Column("model_name", sa.String),
        sa.Column("model_version", sa.String),
        sa.Column("status", sa.String),
        sa.Column("synthetic_likelihood", sa.Float, nullable=True),
        sa.Column("human_likelihood", sa.Float, nullable=True),
        sa.Column("uncertainty", sa.Float, nullable=True),
        sa.Column("processing_time_ms", sa.Float, nullable=True),
        sa.Column("is_simulated", sa.Boolean, server_default=sa.true()),
        sa.Column("message", sa.Text, nullable=True),
        sa.Column("evidence_ref", sa.String, nullable=True),
        sa.Column("created_at", sa.DateTime),
    )

    op.create_table(
        "model_predictions",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("session_id", sa.String, sa.ForeignKey("analysis_sessions.id"), index=True),
        sa.Column("synthetic_likelihood", sa.Float, nullable=True),
        sa.Column("human_likelihood", sa.Float, nullable=True),
        sa.Column("model_agreement", sa.Float, nullable=True),
        sa.Column("uncertainty", sa.Float, nullable=True),
        sa.Column("contributing_models", sa.JSON, nullable=True),
        sa.Column("unavailable_models", sa.JSON, nullable=True),
        sa.Column("any_simulated", sa.Boolean, server_default=sa.true()),
        sa.Column("weights_used", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime),
    )

    op.create_table(
        "organizations",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("name", sa.String, unique=True),
        sa.Column("is_fictional_demo_data", sa.Boolean, server_default=sa.true()),
    )

    op.create_table(
        "locations",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("city", sa.String),
        sa.Column("state", sa.String, nullable=True),
        sa.Column("country", sa.String, server_default="India"),
    )

    op.create_table(
        "branches",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("organization_id", sa.String, sa.ForeignKey("organizations.id")),
        sa.Column("name", sa.String),
        sa.Column("location_id", sa.String, sa.ForeignKey("locations.id"), nullable=True),
    )

    op.create_table(
        "verification_results",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("session_id", sa.String, sa.ForeignKey("analysis_sessions.id"), index=True),
        sa.Column("claimed_organization", sa.String, nullable=True),
        sa.Column("organization_state", sa.String, nullable=True),
        sa.Column("claimed_branch", sa.String, nullable=True),
        sa.Column("branch_state", sa.String, nullable=True),
        sa.Column("caller_id", sa.String, nullable=True),
        sa.Column("caller_state", sa.String, nullable=True),
        sa.Column("raw_result", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime),
    )

    op.create_table(
        "risk_scores",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("session_id", sa.String, sa.ForeignKey("analysis_sessions.id"), index=True),
        sa.Column("risk_score", sa.Float, nullable=True),
        sa.Column("risk_level", sa.String, nullable=True),
        sa.Column("risk_factors", sa.JSON, nullable=True),
        sa.Column("recommendation", sa.Text, nullable=True),
        sa.Column("thresholds_used", sa.JSON, nullable=True),
        sa.Column("weights_used", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime),
    )

    op.create_table(
        "evidence_items",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("session_id", sa.String, sa.ForeignKey("analysis_sessions.id"), index=True),
        sa.Column("category", sa.String),
        sa.Column("severity", sa.String),
        sa.Column("title", sa.String),
        sa.Column("description", sa.Text),
        sa.Column("source", sa.String),
        sa.Column("segment_id", sa.String, nullable=True),
        sa.Column("timestamp_s", sa.Float, nullable=True),
        sa.Column("model_name", sa.String, nullable=True),
        sa.Column("created_at", sa.DateTime),
    )

    op.create_table(
        "experiments",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("dataset", sa.String),
        sa.Column("model", sa.String),
        sa.Column("attack_type", sa.String, nullable=True),
        sa.Column("segment_length_s", sa.Float, server_default="5.0"),
        sa.Column("decision_threshold", sa.Float, server_default="0.5"),
        sa.Column("fusion_weights", sa.JSON, nullable=True),
        sa.Column("created_by", sa.String, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime),
    )

    op.create_table(
        "experiment_results",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("experiment_id", sa.String, sa.ForeignKey("experiments.id"), index=True),
        sa.Column("software_version", sa.String),
        sa.Column("metrics", sa.JSON, nullable=True),
        sa.Column("n_samples", sa.Integer, server_default="0"),
        sa.Column("dataset_available", sa.Boolean, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime),
    )

    op.create_table(
        "model_versions",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("model_key", sa.String, index=True),
        sa.Column("version", sa.String),
        sa.Column("status", sa.String),
        sa.Column("checkpoint_path", sa.String, nullable=True),
        sa.Column("registered_at", sa.DateTime),
    )

    op.create_table(
        "model_cards",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("model_key", sa.String, unique=True, index=True),
        sa.Column("card_data", sa.JSON),
        sa.Column("updated_at", sa.DateTime),
    )

    op.create_table(
        "reports",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("session_id", sa.String, sa.ForeignKey("analysis_sessions.id"), index=True),
        sa.Column("storage_path", sa.String, nullable=True),
        sa.Column("created_at", sa.DateTime),
    )


def downgrade() -> None:
    for table in [
        "reports", "model_cards", "model_versions", "experiment_results", "experiments",
        "evidence_items", "risk_scores", "verification_results", "branches", "locations",
        "organizations", "model_predictions", "segment_predictions", "audio_segments",
        "audio_metadata", "analysis_sessions", "users",
    ]:
        op.drop_table(table)
