from unittest.mock import AsyncMock, MagicMock

import pytest

from app.jobs.ai_summary import (
    ai_summary_job,
    build_candidate_ai_fields,
    build_creator_ai_fields,
    rating_to_twenty,
)
from app.models import AISummaryJobRequest, AISummaryResult, Platform
from app.services.ai_service import AIService, _normalize_tags


@pytest.mark.parametrize(
    ("score", "expected"),
    [(3, "RATING_3"), (None, None), (9, None)],
)
def test_rating_to_twenty(score: int | None, expected: str | None) -> None:
    assert rating_to_twenty(score) == expected


def test_normalize_tags_filters_invalid() -> None:
    assert _normalize_tags(["SKINCARE", "invalid", "ROUTINE", "skincare"]) == ["SKINCARE", "ROUTINE"]


def test_build_creator_ai_fields() -> None:
    result = AISummaryResult(
        niche="Skincare",
        suggested_tags=["SKINCARE", "ROUTINE"],
        brand_fit_score=4,
        audience_fit_score=5,
    )
    fields = build_creator_ai_fields(result)
    assert fields["niche"] == "Skincare"
    assert fields["tagList"] == ["SKINCARE", "ROUTINE"]
    assert fields["brandFitRating"] == "RATING_4"
    assert fields["audienceFitRating"] == "RATING_5"


def test_build_candidate_ai_fields() -> None:
    result = AISummaryResult(niche="Fitness", suggested_tags=["FITNESS"], brand_fit_score=2)
    fields = build_candidate_ai_fields(result)
    assert fields["creatorNiche"] == "Fitness"
    assert fields["candidateTagList"] == ["FITNESS"]
    assert fields["creatorBrandFitRating"] == "RATING_2"


@pytest.fixture
def job_request() -> AISummaryJobRequest:
    return AISummaryJobRequest(
        creator_id="creator-1",
        candidate_id="cand-1",
        campaign_id="camp-1",
        proposal_reason="Strong student audience",
        platform=Platform.TIKTOK,
        profile_url="tiktok.com/@test",
        enrichment={"follower_count": 10000},
    )


@pytest.fixture
def twenty() -> MagicMock:
    client = MagicMock()
    client.configured = True
    client.get_campaign = AsyncMock(return_value={"id": "camp-1", "name": "Test Campaign"})
    client.get_creator = AsyncMock(return_value={"id": "creator-1", "handle": "@test"})
    client.update_creator = AsyncMock(return_value={"id": "creator-1"})
    client.update_candidate_snapshots = AsyncMock(return_value={"id": "cand-1"})
    client.create_integration_event = AsyncMock(return_value={"id": "evt-1"})
    return client


@pytest.mark.asyncio
async def test_ai_summary_success(job_request: AISummaryJobRequest, twenty: MagicMock) -> None:
    ai = MagicMock(spec=AIService)
    ai.configured = True
    ai.summarize_creator = AsyncMock(
        return_value=AISummaryResult(
            niche="Study tips",
            suggested_tags=["ROUTINE"],
            brand_fit_score=4,
            audience_fit_score=3,
        )
    )

    result = await ai_summary_job(job_request, ai, twenty, external_id="ext-1")

    assert result["status"] == "succeeded"
    twenty.update_creator.assert_awaited_once()
    twenty.update_candidate_snapshots.assert_awaited_once()
    twenty.create_integration_event.assert_awaited_once()
    assert twenty.create_integration_event.call_args.kwargs["event_type"] == "AI_SUMMARY_SUCCEEDED"


@pytest.mark.asyncio
async def test_ai_summary_skipped_without_openai(job_request: AISummaryJobRequest, twenty: MagicMock) -> None:
    ai = MagicMock(spec=AIService)
    ai.configured = False

    result = await ai_summary_job(job_request, ai, twenty)

    assert result["status"] == "skipped"
    twenty.update_creator.assert_not_called()
    assert twenty.create_integration_event.call_args.kwargs["event_type"] == "AI_SUMMARY_SKIPPED"


@pytest.mark.asyncio
async def test_ai_summary_failure_logs_event(job_request: AISummaryJobRequest, twenty: MagicMock) -> None:
    ai = MagicMock(spec=AIService)
    ai.configured = True
    ai.summarize_creator = AsyncMock(side_effect=RuntimeError("rate limit"))

    result = await ai_summary_job(job_request, ai, twenty)

    assert result["status"] == "failed"
    assert twenty.create_integration_event.call_args.kwargs["event_type"] == "AI_SUMMARY_FAILED"
