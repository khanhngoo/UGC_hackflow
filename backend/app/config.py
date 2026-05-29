import logging
from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: Literal["local", "staging", "production"] = "local"
    log_level: str = "INFO"

    twenty_api_url: str = "http://localhost:2020"
    twenty_app_url: str | None = None
    twenty_api_key: str | None = None
    twenty_webhook_secret: str | None = None

    telegram_bot_token: str | None = None
    telegram_webhook_secret: str | None = None
    telegram_allowed_user_ids: str = ""
    telegram_intake_state_ttl_seconds: int = 1800

    apify_token: str | None = None
    apify_tiktok_actor_id: str | None = None
    apify_instagram_actor_id: str | None = None
    apify_youtube_actor_id: str | None = None
    apify_x_actor_id: str | None = Field(default=None, alias="APIFY_X_ACTOR_ID")

    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"

    follow_up_days_no_reply: int = 3
    telegram_reminder_chat_id: str | None = None

    intake_api_secret: str | None = None
    intake_cors_origins: str = "http://localhost:2020"

    @property
    def intake_cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.intake_cors_origins.split(",") if origin.strip()]

    @property
    def intake_secret_required(self) -> bool:
        return self.app_env in ("staging", "production")

    def validate_intake_secret_config(self) -> None:
        if self.intake_secret_required and not self.intake_api_secret:
            raise ValueError("INTAKE_API_SECRET is required when APP_ENV is staging or production")

    @property
    def resolved_twenty_app_url(self) -> str:
        return (self.twenty_app_url or self.twenty_api_url).rstrip("/")

    @property
    def allowed_telegram_user_ids(self) -> set[int]:
        values: set[int] = set()
        for raw_value in self.telegram_allowed_user_ids.split(","):
            raw_value = raw_value.strip()
            if raw_value:
                values.add(int(raw_value))
        return values


@lru_cache
def get_settings() -> Settings:
    return Settings()
