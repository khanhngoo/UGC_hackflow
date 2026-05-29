from unittest.mock import AsyncMock, MagicMock

import pytest

from app.jobs.enrichment import enrich_creator_job
from app.models import EnrichmentRequest, EnrichmentResult, Platform


@pytest.fixture
def request_payload() -> EnrichmentRequest:
    return EnrichmentRequest(
        creator_id="creator-1",
        platform=Platform.TIKTOK,
        profile_url="tiktok.com/@test",
    )


@pytest.fixture
def twenty() -> MagicMock:
    client = MagicMock()
    client.configured = True
    client.update_creator = AsyncMock(return_value={"id": "creator-1"})
    client.update_candidate_metrics = AsyncMock(return_value={"id": "cand-1"})
    client.create_integration_event = AsyncMock(return_value={"id": "evt-1"})
    return client


@pytest.mark.asyncio
async def test_enrichment_success_updates_creator_and_logs_event(
    request_payload: EnrichmentRequest,
    twenty: MagicMock,
) -> None:
    apify = MagicMock()
    apify.enrich_creator = AsyncMock(
        return_value=EnrichmentResult(
            handle="@test",
            display_name="Test Creator",
            follower_count=10_000,
            average_views=5_000,
            raw={"items": []},
        )
    )

    result = await enrich_creator_job(request_payload, apify, twenty, candidate_id="cand-1")

    assert result["status"] == "succeeded"
    twenty.update_creator.assert_awaited_once()
    creator_fields = twenty.update_creator.call_args.args[1]
    assert creator_fields["handle"] == "@test"
    assert creator_fields["followerCount"] == 10_000
    twenty.update_candidate_metrics.assert_awaited_once()
    twenty.create_integration_event.assert_awaited_once()
    assert twenty.create_integration_event.call_args.kwargs["event_type"] == "APIFY_ENRICHMENT_SUCCEEDED"


@pytest.mark.asyncio
async def test_enrichment_skipped_logs_integration_event(
    request_payload: EnrichmentRequest,
    twenty: MagicMock,
) -> None:
    apify = MagicMock()
    apify.enrich_creator = AsyncMock(
        return_value=EnrichmentResult(raw={"status": "skipped", "reason": "Apify not configured"})
    )

    result = await enrich_creator_job(request_payload, apify, twenty)

    assert result["raw"]["status"] == "skipped"
    twenty.update_creator.assert_not_called()
    twenty.create_integration_event.assert_awaited_once()
    assert twenty.create_integration_event.call_args.kwargs["event_type"] == "APIFY_ENRICHMENT_SKIPPED"


@pytest.mark.asyncio
async def test_enrichment_failure_logs_integration_event(
    request_payload: EnrichmentRequest,
    twenty: MagicMock,
) -> None:
    apify = MagicMock()
    apify.enrich_creator = AsyncMock(side_effect=RuntimeError("actor timeout"))

    result = await enrich_creator_job(request_payload, apify, twenty)

    assert result["status"] == "failed"
    twenty.update_creator.assert_not_called()
    twenty.create_integration_event.assert_awaited_once()
    assert twenty.create_integration_event.call_args.kwargs["event_type"] == "APIFY_ENRICHMENT_FAILED"
