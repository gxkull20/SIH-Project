from __future__ import annotations

import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "VoiceShield-AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    DATABASE_URL: str = "sqlite:///./voiceshield.db"

    STORAGE_BACKEND: str = "local"          # "local" or "s3"
    LOCAL_STORAGE_PATH: str = "./data/audio"
    S3_ENDPOINT_URL: str | None = None
    S3_BUCKET: str | None = None
    S3_ACCESS_KEY: str | None = None
    S3_SECRET_KEY: str | None = None

    # Comma-separated list of allowed origins, e.g.:
    # CORS_ORIGINS=https://voiceshield.vercel.app,https://www.voiceshield.com
    # Defaults to allow all (*) so the app works out-of-the-box on Render.
    CORS_ORIGINS: list[str] = ["*"]

    MAX_UPLOAD_SIZE_MB: int = 200
    DEFAULT_SEGMENT_LENGTH_S: float = 5.0
    DEFAULT_SAMPLE_RATE: int = 16000

    SPECTROGRAM_MODEL_PATH: str | None = None
    WAVLM_MODEL_PATH: str | None = None
    WHISPER_MODEL_SIZE: str = "base"

    RATE_LIMIT_PER_MINUTE: int = 60

    LOG_LEVEL: str = "INFO"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors(cls, v: object) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v  # type: ignore[return-value]


settings = Settings()
