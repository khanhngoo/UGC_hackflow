from __future__ import annotations

from typing import Any

from app.models import EnrichmentRequest, EnrichmentResult
from app.services.apify_client import ApifyClient
from app.services.twenty_client import TwentyClient


def _non_null_fields(fields: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in fields.items() if value is not None}


def build_creator_enrichment_fields(result: EnrichmentResult) -> dict[str, Any]:
    return _non_null_fields(
        {
            "handle": result.handle,
            "name": result.display_name,
            "followerCount": result.follower_count,
            "avgViewsRecent": result.average_views,
            "medianViewsRecent": result.average_views,
            "niche": result.bio[:200] if result.bio else None,
        }
    )


def build_candidate_metric_fields(result: EnrichmentResult) -> dict[str, Any]:
    return _non_null_fields(
        {
            "creatorFollowerCount": result.follower_count,
            "creatorAvgViewsRecent": result.average_views,
            "creatorMedianViewsRecent": result.average_views,
        }
    )


async def enrich_creator_job(
    request: EnrichmentRequest,
    apify: ApifyClient,
    twenty: TwentyClient,
    *,
    candidate_id: str | None = None,
    external_id: str | None = None,
) -> dict[str, Any]:
    event_id = external_id or f"enrich:{request.creator_id}"

    if not twenty.configured:
        return {"status": "skipped", "reason": "twenty_not_configured"}

    try:
        result = await apify.enrich_creator(request)
    except Exception as exc:
        await twenty.create_integration_event(
            source="Apify",
            external_id=event_id,
            event_type="APIFY_ENRICHMENT_FAILED",
            status="FAILED",
            payload_summary=str(request.profile_url)[:200],
            error_message=str(exc)[:500],
            linked_object_type="creator",
            linked_object_id=request.creator_id,
        )
        return {"status": "failed", "reason": str(exc)}

    if result.raw.get("status") == "skipped":
        await twenty.create_integration_event(
            source="Apify",
            external_id=event_id,
            event_type="APIFY_ENRICHMENT_SKIPPED",
            status="SKIPPED",
            payload_summary=result.raw.get("reason", "Apify not configured"),
            linked_object_type="creator",
            linked_object_id=request.creator_id,
        )
        return result.model_dump()

    creator_fields = build_creator_enrichment_fields(result)
    if creator_fields:
        await twenty.update_creator(request.creator_id, creator_fields)

    if candidate_id:
        candidate_fields = build_candidate_metric_fields(result)
        if candidate_fields:
            await twenty.update_candidate_metrics(candidate_id, candidate_fields)

    await twenty.create_integration_event(
        source="Apify",
        external_id=event_id,
        event_type="APIFY_ENRICHMENT_SUCCEEDED",
        status="SUCCEEDED",
        payload_summary=f"Updated creator {request.creator_id}",
        linked_object_type="creator",
        linked_object_id=request.creator_id,
    )

    payload = result.model_dump()
    payload["status"] = "succeeded"
    return payload
