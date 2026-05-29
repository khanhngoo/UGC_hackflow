import json
import os
from pathlib import Path

from app.config import Settings


def resolve_twenty_api_key(settings: Settings) -> str | None:
    if settings.twenty_api_key:
        return settings.twenty_api_key

    config_path = Path.home() / ".twenty" / "config.json"
    if not config_path.exists():
        return None

    config = json.loads(config_path.read_text(encoding="utf-8"))
    remote = config.get("defaultRemote", "local")
    return config.get("remotes", {}).get(remote, {}).get("apiKey")
