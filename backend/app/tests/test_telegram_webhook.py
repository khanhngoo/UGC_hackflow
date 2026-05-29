from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import app, get_intake_store, get_telegram, get_twenty
from app.services.telegram_intake import IntakeStateStore, update_id_store


@pytest.fixture(autouse=True)
def _isolate_telegram_webhook_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_WEBHOOK_SECRET", "")
    monkeypatch.setenv("TELEGRAM_ALLOWED_USER_IDS", "")
    get_settings.cache_clear()


@pytest.fixture
def client() -> TestClient:
    update_id_store._seen.clear()
    return TestClient(app)


@pytest.fixture
def mock_twenty() -> MagicMock:
    twenty = MagicMock()
    twenty.configured = True
    twenty.list_products_for_intake = AsyncMock(
        return_value=[{"id": "prod-1", "name": "Glow Bottle", "status": "ACTIVE"}]
    )
    twenty.list_campaigns_for_product = AsyncMock(
        return_value=[{"id": "camp-1", "name": "Test Campaign", "status": "ACTIVE"}]
    )
    twenty.find_or_create_creator = AsyncMock(
        return_value=(
            {"id": "creator-1", "handle": "@test"},
            True,
        )
    )
    twenty.find_open_candidate_for_creator_campaign = AsyncMock(return_value=None)
    twenty.create_campaign_creator_candidate = AsyncMock(
        return_value={
            "id": "cand-1",
            "status": "PROPOSED",
            "creator": {"id": "creator-1", "handle": "@test"},
            "campaign": {"id": "camp-1", "name": "Test Campaign"},
        }
    )
    twenty.create_integration_event = AsyncMock(return_value={"id": "evt-1"})
    return twenty


@pytest.fixture
def mock_telegram() -> MagicMock:
    telegram = MagicMock()
    telegram.token = "fake"
    telegram.send_message = AsyncMock(return_value={"ok": True})
    return telegram


def _override_deps(client: TestClient, twenty: MagicMock, telegram: MagicMock) -> None:
    get_settings.cache_clear()
    store = IntakeStateStore(ttl_seconds=1800)

    def settings_override() -> Settings:
        return Settings(
            twenty_api_key="test-key",
            twenty_api_url="http://localhost:2020",
            telegram_bot_token="fake",
            telegram_webhook_secret="",
            telegram_allowed_user_ids="",
        )

    app.dependency_overrides[get_settings] = settings_override
    app.dependency_overrides[get_twenty] = lambda: twenty
    app.dependency_overrides[get_telegram] = lambda: telegram
    app.dependency_overrides[get_intake_store] = lambda: store


def _message_update(update_id: int, text: str, user_id: int = 100) -> dict:
    return {
        "update_id": update_id,
        "message": {
            "message_id": update_id,
            "chat": {"id": 200, "type": "private"},
            "from": {"id": user_id, "username": "tester", "first_name": "Test"},
            "text": text,
        },
    }


@patch("app.services.creator_intake.schedule_post_intake_enrichment")
def test_telegram_happy_path(
    mock_schedule_enrichment: MagicMock,
    client: TestClient,
    mock_twenty: MagicMock,
    mock_telegram: MagicMock,
) -> None:
    _override_deps(client, mock_twenty, mock_telegram)

    r1 = client.post("/webhooks/telegram", json=_message_update(1, "https://tiktok.com/@happy"))
    assert r1.status_code == 200
    assert r1.json()["status"] == "awaiting_input"
    assert r1.json()["step"] == "awaiting_product"

    r2 = client.post("/webhooks/telegram", json=_message_update(2, "1"))
    assert r2.status_code == 200
    assert r2.json()["status"] == "awaiting_input"
    assert r2.json()["step"] == "awaiting_campaign"
    mock_twenty.list_campaigns_for_product.assert_called_once_with("prod-1")

    r3 = client.post("/webhooks/telegram", json=_message_update(3, "1"))
    assert r3.status_code == 200
    assert r3.json()["status"] == "awaiting_input"
    assert r3.json()["step"] == "awaiting_reason"

    r4 = client.post("/webhooks/telegram", json=_message_update(4, "Strong student audience"))
    assert r4.status_code == 200
    assert r4.json()["status"] == "created"
    assert r4.json()["candidate_id"] == "cand-1"

    mock_twenty.create_campaign_creator_candidate.assert_called_once()
    call_kwargs = mock_twenty.create_campaign_creator_candidate.call_args.kwargs
    assert call_kwargs["proposed_by"] == "@tester"
    assert call_kwargs["source"] == "Telegram"
    assert call_kwargs["reason"] == "Strong student audience"
    assert call_kwargs["product_id"] == "prod-1"

    mock_schedule_enrichment.assert_called_once()
    enrich_kwargs = mock_schedule_enrichment.call_args.kwargs
    assert enrich_kwargs["creator_id"] == "creator-1"
    assert enrich_kwargs["candidate_id"] == "cand-1"
    assert enrich_kwargs["campaign_id"] == "camp-1"
    assert enrich_kwargs["proposal_reason"] == "Strong student audience"

    app.dependency_overrides.clear()
    get_settings.cache_clear()


def test_telegram_duplicate_update_id(client: TestClient, mock_twenty: MagicMock, mock_telegram: MagicMock) -> None:
    _override_deps(client, mock_twenty, mock_telegram)

    payload = _message_update(99, "https://tiktok.com/@dup")
    assert client.post("/webhooks/telegram", json=payload).json()["status"] == "awaiting_input"
    assert client.post("/webhooks/telegram", json=payload).json()["status"] == "duplicate"

    mock_twenty.create_campaign_creator_candidate.assert_not_called()
    app.dependency_overrides.clear()
    get_settings.cache_clear()
