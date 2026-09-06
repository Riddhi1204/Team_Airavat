import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "CivicPulse API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://civicpulse:civicpulse@localhost:5433/civicpulse_db"

    # Security & Auth
    JWT_SECRET: str = "civicpulse_super_secret_jwt_key_change_in_production_32bytes_min"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Initial Admin Seed
    ADMIN_DEFAULT_EMAIL: str = "admin@civicpulse.org"
    ADMIN_DEFAULT_PASSWORD: str = "Admin@123456"

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "*"

    # Media & Uploads
    UPLOAD_DIRECTORY: str = "uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_MEDIA_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    ]
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp", ".gif"]

    # Priority Scoring Engine Configurable Weights (Must sum to 1.0 or normalized)
    WEIGHT_SEVERITY: float = 0.35
    WEIGHT_POPULATION: float = 0.25
    WEIGHT_INFRASTRUCTURE: float = 0.15
    WEIGHT_WEATHER: float = 0.10
    WEIGHT_DURATION: float = 0.10
    WEIGHT_RECURRENCE: float = 0.05
    SCORING_VERSION: str = "v1.0"

    # Priority thresholds
    THRESHOLD_CRITICAL: float = 90.0
    THRESHOLD_HIGH: float = 75.0
    THRESHOLD_MEDIUM: float = 50.0
    THRESHOLD_LOW: float = 25.0

    # External Integrations
    GEOCODING_PROVIDER: str = "nominatim"
    GEOCODING_API_URL: str = "https://nominatim.openstreetmap.org"

    WEATHER_PROVIDER: str = "open-meteo"
    WEATHER_API_URL: str = "https://api.open-meteo.com/v1/forecast"

    SPEECH_PROVIDER: str = "mock"
    SPEECH_API_KEY: str = ""
    SPEECH_MODEL: str = "saaras:v4"

    TRANSLATION_PROVIDER: str = "mock"
    TRANSLATION_API_KEY: str = ""

    AI_PROVIDER: str = "mock"
    AI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    AI_MODEL_NAME: str = "gemini-1.5-flash"

    INFRASTRUCTURE_PROVIDER: str = "overpass"
    OVERPASS_API_URL: str = "https://overpass-api.de/api/interpreter"

    POPULATION_PROVIDER: str = "local"

    # Duplicate detection defaults
    DUPLICATE_MAX_DISTANCE_METERS: float = 200.0  # within 200m
    DUPLICATE_MAX_HOURS: int = 48  # within 48 hours

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
