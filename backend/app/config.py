from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path


def _bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _csv(name: str, default: str) -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(slots=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "Israel PetConnect AI API")
    app_env: str = os.getenv("APP_ENV", "development")
    database_url: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://petconnect:petconnect@db:5432/petconnect")
    upload_dir: Path = Path(os.getenv("UPLOAD_DIR", "./uploads"))
    cors_origins: list[str] = None  # type: ignore[assignment]
    public_base_url: str = os.getenv("PUBLIC_BASE_URL", "http://localhost:8001")
    storage_backend: str = os.getenv("STORAGE_BACKEND", "local")

    s3_bucket: str = os.getenv("S3_BUCKET", "")
    s3_region: str = os.getenv("S3_REGION", "eu-west-1")
    s3_access_key_id: str = os.getenv("S3_ACCESS_KEY_ID", "")
    s3_secret_access_key: str = os.getenv("S3_SECRET_ACCESS_KEY", "")
    s3_endpoint_url: str = os.getenv("S3_ENDPOINT_URL", "")
    s3_public_base_url: str = os.getenv("S3_PUBLIC_BASE_URL", "")

    embedding_model: str = os.getenv("EMBEDDING_MODEL", "pet_resnet50_arcface")
    embedding_dim: int = int(os.getenv("EMBEDDING_DIM", "2048"))
    embedding_margin_loss: str = os.getenv("EMBEDDING_MARGIN_LOSS", "arcface")
    nose_embedding_model: str = os.getenv("NOSE_EMBEDDING_MODEL", "dog_nose_arcface")
    nose_embedding_dim: int = int(os.getenv("NOSE_EMBEDDING_DIM", "2048"))
    pet_embedding_checkpoint: str = os.getenv("PET_EMBEDDING_CHECKPOINT", "./models/pet_resnet50_arcface.pt")
    nose_embedding_checkpoint: str = os.getenv("NOSE_EMBEDDING_CHECKPOINT", "./models/dog_nose_arcface.pt")
    semantic_model_name: str = os.getenv("SEMANTIC_MODEL_NAME", "openai/clip-vit-base-patch32")
    semantic_tag_threshold: float = float(os.getenv("SEMANTIC_TAG_THRESHOLD", "0.24"))

    match_threshold: int = int(os.getenv("MATCH_THRESHOLD", "68"))
    high_probability_threshold: int = int(os.getenv("HIGH_PROBABILITY_THRESHOLD", "86"))
    geofence_alert_radius_km: float = float(os.getenv("GEOFENCE_ALERT_RADIUS_KM", "5"))
    volunteer_alert_radius_km: float = float(os.getenv("VOLUNTEER_ALERT_RADIUS_KM", "2.5"))
    heatmap_radius_km: float = float(os.getenv("HEATMAP_RADIUS_KM", "12"))
    auto_geofence_alerts: bool = _bool("AUTO_GEOFENCE_ALERTS", True)
    auto_matching_enabled: bool = _bool("AUTO_MATCHING_ENABLED", True)
    shabbat_automation_enabled: bool = _bool("SHABBAT_AUTOMATION_ENABLED", True)

    video_max_duration_seconds: int = int(os.getenv("VIDEO_MAX_DURATION_SECONDS", "4"))
    best_frame_samples: int = int(os.getenv("BEST_FRAME_SAMPLES", "18"))
    best_frame_min_score: float = float(os.getenv("BEST_FRAME_MIN_SCORE", "0.22"))

    otp_ttl_minutes: int = int(os.getenv("OTP_TTL_MINUTES", "10"))
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me-in-production")
    jwt_exp_hours: int = int(os.getenv("JWT_EXP_HOURS", "48"))

    sms_provider: str = os.getenv("SMS_PROVIDER", "mock")
    twilio_account_sid: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    twilio_auth_token: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    twilio_from_number: str = os.getenv("TWILIO_FROM_NUMBER", "")
    global_sms_url: str = os.getenv("GLOBAL_SMS_URL", "")
    global_sms_api_key: str = os.getenv("GLOBAL_SMS_API_KEY", "")
    global_sms_sender: str = os.getenv("GLOBAL_SMS_SENDER", "PetConnect")
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    telegram_chat_id: str = os.getenv("TELEGRAM_CHAT_ID", "")
    enable_telegram_broadcasts: bool = _bool("ENABLE_TELEGRAM_BROADCASTS", False)
    relay_sender_label: str = os.getenv("RELAY_SENDER_LABEL", "PetConnect Relay")
    enable_dev_otp_echo: bool = _bool("ENABLE_DEV_OTP_ECHO", True)

    privacy_blur_enabled: bool = _bool("PRIVACY_BLUR_ENABLED", True)
    municipality_106_recipients_json: str = os.getenv("MUNICIPAL_106_RECIPIENTS_JSON", "{}")

    social_auto_reply_enabled: bool = _bool("SOCIAL_AUTO_REPLY_ENABLED", False)
    facebook_approved_api_token: str = os.getenv("FACEBOOK_APPROVED_API_TOKEN", "")
    external_feed_secret: str = os.getenv("EXTERNAL_FEED_SECRET", "")

    def __post_init__(self) -> None:
        self.cors_origins = _csv("CORS_ORIGINS", "http://localhost:3000")
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    @property
    def is_postgres(self) -> bool:
        return self.database_url.startswith("postgresql")

    @property
    def uses_s3(self) -> bool:
        return self.storage_backend.lower() == "s3"

    @property
    def municipality_106_recipients(self) -> dict[str, str]:
        try:
            raw = json.loads(self.municipality_106_recipients_json or "{}")
            return {str(k): str(v) for k, v in raw.items() if k and v}
        except json.JSONDecodeError:
            return {}


settings = Settings()
