from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import app, get_twenty
from app.services.creator_intake import CreatorIntakeResult


@pytest.fixture(autouse=True)
def _clear_settings_cache() -> None:
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
    app.dependency_overrides.clear()


@pytest.fixture
def client() -> TestClient:
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
    return twenty


def _override_settings(**kwargs: object) -> None:
    def settings_override() -> Settings:
        return Settings(twenty_api_key="test-key", **kwargs)

    app.dependency_overrides[get_settings] = settings_override


def test_intake_options_returns_products_and_campaigns(
    client: TestClient,
    mock_twenty: MagicMock,
) -> None:
    _override_settings(app_env="local")
    app.dependency_overrides[get_twenty] = lambda: mock_twenty

    response = client.get("/intake/options")

    assert response.status_code == 200
    body = response.json()
    assert body["products"][0]["id"] == "prod-1"
    assert body["campaigns"][0]["product_id"] == "prod-1"


@patch("app.main.submit_creator_intake", new_callable=AsyncMock)
def test_intake_creator_success(
    mock_submit: AsyncMock,
    client: TestClient,
    mock_twenty: MagicMock,
) -> None:
    _override_settings(app_env="local")
    app.dependency_overrides[get_twenty] = lambda: mock_twenty
    mock_submit.return_value = CreatorIntakeResult(
        status="created",
        creator_id="creator-1",
        candidate_id="cand-1",
        creator_was_new=True,
        creator={"handle": "@test"},
    )

    response = client.post(
        "/intake/creator",
        json={
            "profile_url": "https://tiktok.com/@creator",
            "product_id": "prod-1",
            "campaign_id": "camp-1",
            "reason": "Strong engagement",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "created"
    assert body["candidate_id"] == "cand-1"
    mock_submit.assert_awaited_once()


@patch("app.main.submit_creator_intake", new_callable=AsyncMock)
def test_intake_creator_duplicate_returns_409(
    mock_submit: AsyncMock,
    client: TestClient,
    mock_twenty: MagicMock,
) -> None:
    _override_settings(app_env="local")
    app.dependency_overrides[get_twenty] = lambda: mock_twenty
    mock_submit.return_value = CreatorIntakeResult(
        status="duplicate_candidate",
        candidate_id="cand-existing",
        message="Already proposed",
        duplicate_candidate={"id": "cand-existing", "status": "PROPOSED"},
    )

    response = client.post(
        "/intake/creator",
        json={
            "profile_url": "https://tiktok.com/@creator",
            "product_id": "prod-1",
            "campaign_id": "camp-1",
            "reason": "Strong engagement",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"]["status"] == "duplicate_candidate"


def test_intake_requires_secret_in_production(
    client: TestClient,
    mock_twenty: MagicMock,
) -> None:
    _override_settings(app_env="production", intake_api_secret="secret-value")
    app.dependency_overrides[get_twenty] = lambda: mock_twenty

    response = client.get("/intake/options")

    assert response.status_code == 401


def test_intake_accepts_secret_header(
    client: TestClient,
    mock_twenty: MagicMock,
) -> None:
    _override_settings(app_env="production", intake_api_secret="secret-value")
    app.dependency_overrides[get_twenty] = lambda: mock_twenty

    response = client.get(
        "/intake/options",
        headers={"X-Intake-Secret": "secret-value"},
    )

    assert response.status_code == 200
