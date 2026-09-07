from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "VoiceShield-AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./voiceshield.db"

    STORAGE_BACKEND: str = "local"          # "local" or "s3"
    LOCAL_STORAGE_PATH: str = "./data/audio"
    S3_ENDPOINT_URL: str | None = None
    S3_BUCKET: str | None = None
    S3_ACCESS_KEY: str | None = None
    S3_SECRET_KEY: str | None = None

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    MAX_UPLOAD_SIZE_MB: int = 200
    DEFAULT_SEGMENT_LENGTH_S: float = 5.0
    DEFAULT_SAMPLE_RATE: int = 16000

    SPECTROGRAM_MODEL_PATH: str | None = None
    WAVLM_MODEL_PATH: str | None = None
    WHISPER_MODEL_SIZE: str = "base"

    RATE_LIMIT_PER_MINUTE: int = 60

    LOG_LEVEL: str = "INFO"


settings = Settings()
