from __future__ import annotations

from typing import Any

from app.models import AISummaryJobRequest, AISummaryRequest, AISummaryResult
from app.services.ai_service import AIService
from app.services.twenty_client import TwentyClient


def rating_to_twenty(score: int | None) -> str | None:
    if score is None:
        return None
    if 1 <= score <= 5:
        return f"RATING_{score}"
    return None


def _non_null_fields(fields: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in fields.items() if value is not None}


def build_creator_ai_fields(result: AISummaryResult) -> dict[str, Any]:
    tags = result.suggested_tags or None
    return _non_null_fields(
        {
            "niche": result.niche,
            "tagList": tags,
            "brandFitRating": rating_to_twenty(result.brand_fit_score),
            "audienceFitRating": rating_to_twenty(result.audience_fit_score),
        }
    )


def build_candidate_ai_fields(result: AISummaryResult) -> dict[str, Any]:
    tags = result.suggested_tags or None
    return _non_null_fields(
        {
            "creatorNiche": result.niche,
            "candidateTagList": tags,
            "creatorBrandFitRating": rating_to_twenty(result.brand_fit_score),
            "creatorAudienceFitRating": rating_to_twenty(result.audience_fit_score),
        }
    )


async def ai_summary_job(
    request: AISummaryJobRequest,
    ai: AIService,
    twenty: TwentyClient,
    *,
    external_id: str | None = None,
) -> dict[str, Any]:
    event_id = external_id or f"ai:{request.creator_id}"

    if not twenty.configured:
        return {"status": "skipped", "reason": "twenty_not_configured"}

    if not ai.configured:
        await twenty.create_integration_event(
            source="OpenAI",
            external_id=event_id,
            event_type="AI_SUMMARY_SKIPPED",
            status="SKIPPED",
            payload_summary="OpenAI not configured",
            linked_object_type="creator",
            linked_object_id=request.creator_id,
        )
        return {"status": "skipped", "reason": "openai_not_configured"}

    campaign = await twenty.get_campaign(request.campaign_id)
    creator = await twenty.get_creator(request.creator_id)

    summary_request = AISummaryRequest(
        campaign=campaign,
        creator={
            **creator,
            "platform": request.platform.value,
            "profile_url": str(request.profile_url),
        },
        proposal_reason=request.proposal_reason,
        enrichment=request.enrichment,
    )

    try:
        result = await ai.summarize_creator(summary_request)
    except Exception as exc:
        await twenty.create_integration_event(
            source="OpenAI",
            external_id=event_id,
            event_type="AI_SUMMARY_FAILED",
            status="FAILED",
            payload_summary=str(request.profile_url)[:200],
            error_message=str(exc)[:500],
            linked_object_type="creator",
            linked_object_id=request.creator_id,
        )
        return {"status": "failed", "reason": str(exc)}

    if result.raw.get("status") == "skipped":
        await twenty.create_integration_event(
            source="OpenAI",
            external_id=event_id,
            event_type="AI_SUMMARY_SKIPPED",
            status="SKIPPED",
            payload_summary=result.raw.get("reason", "skipped"),
            linked_object_type="creator",
            linked_object_id=request.creator_id,
        )
        return result.model_dump()

    creator_fields = build_creator_ai_fields(result)
    if creator_fields:
        await twenty.update_creator(request.creator_id, creator_fields)

    if request.candidate_id:
        candidate_fields = build_candidate_ai_fields(result)
        if candidate_fields:
            await twenty.update_candidate_snapshots(request.candidate_id, candidate_fields)

    await twenty.create_integration_event(
        source="OpenAI",
        external_id=event_id,
        event_type="AI_SUMMARY_SUCCEEDED",
        status="SUCCEEDED",
        payload_summary=f"Updated creator {request.creator_id}",
        linked_object_type="creator",
        linked_object_id=request.creator_id,
    )

    payload = result.model_dump()
    payload["status"] = "succeeded"
    return payload
