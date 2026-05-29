import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.config import Settings
from app.services.creator_intake import submit_creator_intake


@pytest.fixture
def settings() -> Settings:
    return Settings(twenty_api_key="test-key", app_env="local")


@pytest.fixture
def twenty() -> MagicMock:
    client = MagicMock()
    client.configured = True
    client.find_or_create_creator = AsyncMock(
        return_value=({"id": "creator-1", "handle": "@test"}, True)
    )
    client.find_open_candidate_for_creator_campaign = AsyncMock(return_value=None)
    client.create_campaign_creator_candidate = AsyncMock(
        return_value={
            "id": "cand-1",
            "status": "PROPOSED",
            "creator": {"id": "creator-1", "handle": "@test"},
            "campaign": {"id": "camp-1", "name": "Summer"},
        }
    )
    client.create_integration_event = AsyncMock(return_value={"id": "evt-1"})
    return client


def test_submit_creator_intake_success(settings: Settings, twenty: MagicMock) -> None:
    with patch("app.services.creator_intake.schedule_post_intake_enrichment") as mock_schedule:
        result = asyncio.run(
            submit_creator_intake(
                twenty=twenty,
                settings=settings,
                profile_url="https://tiktok.com/@creator",
                product_id="prod-1",
                product_name="Glow",
                campaign_id="camp-1",
                campaign_name="Summer",
                reason="Great fit",
                proposed_by="Tester",
                source="Twenty UI",
            )
        )

    assert result.status == "created"
    assert result.candidate_id == "cand-1"
    assert result.creator_was_new is True
    mock_schedule.assert_called_once()


def test_submit_creator_intake_duplicate(settings: Settings, twenty: MagicMock) -> None:
    twenty.find_open_candidate_for_creator_campaign = AsyncMock(
        return_value={"id": "cand-existing", "status": "PROPOSED"}
    )

    result = asyncio.run(
        submit_creator_intake(
            twenty=twenty,
            settings=settings,
            profile_url="https://tiktok.com/@creator",
            product_id="prod-1",
            product_name="Glow",
            campaign_id="camp-1",
            campaign_name="Summer",
            reason="Great fit",
            proposed_by="Tester",
            source="Twenty UI",
            schedule_enrichment=False,
        )
    )

    assert result.status == "duplicate_candidate"
    assert result.candidate_id == "cand-existing"
    twenty.create_campaign_creator_candidate.assert_not_called()


def test_submit_creator_intake_rejects_unknown_platform(
    settings: Settings,
    twenty: MagicMock,
) -> None:
    result = asyncio.run(
        submit_creator_intake(
            twenty=twenty,
            settings=settings,
            profile_url="https://example.com/user",
            product_id="prod-1",
            product_name="Glow",
            campaign_id="camp-1",
            campaign_name="Summer",
            reason="Great fit",
            proposed_by="Tester",
            source="Twenty UI",
        )
    )

    assert result.status == "error"
    assert "Unsupported" in (result.message or "")
    twenty.find_or_create_creator.assert_not_called()


def test_submit_creator_intake_rejects_empty_reason(
    settings: Settings,
    twenty: MagicMock,
) -> None:
    result = asyncio.run(
        submit_creator_intake(
            twenty=twenty,
            settings=settings,
            profile_url="https://tiktok.com/@creator",
            product_id="prod-1",
            product_name="Glow",
            campaign_id="camp-1",
            campaign_name="Summer",
            reason="   ",
            proposed_by="Tester",
            source="Telegram",
        )
    )

    assert result.status == "error"
    assert "empty" in (result.message or "").lower()
