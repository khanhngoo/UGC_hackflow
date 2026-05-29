from __future__ import annotations

import asyncio
import logging
from typing import TYPE_CHECKING

from app.config import Settings
from app.jobs.ai_summary import ai_summary_job
from app.jobs.enrichment import enrich_creator_job
from app.models import AISummaryJobRequest, CreatorLink, EnrichmentRequest, Platform
from app.services.ai_service import AIService
from app.services.apify_client import ApifyClient
from app.services.twenty_auth import resolve_twenty_api_key
from app.services.twenty_client import TwentyClient

if TYPE_CHECKING:
    from asyncio import Task

logger = logging.getLogger(__name__)


def _build_apify(settings: Settings) -> ApifyClient:
    return ApifyClient(
        settings.apify_token,
        {
            Platform.TIKTOK: settings.apify_tiktok_actor_id,
            Platform.INSTAGRAM: settings.apify_instagram_actor_id,
            Platform.YOUTUBE: settings.apify_youtube_actor_id,
            Platform.X: settings.apify_x_actor_id,
        },
    )


def _log_task_error(task: Task[None]) -> None:
    if task.cancelled():
        return
    exc = task.exception()
    if exc is not None:
        logger.exception("Post-intake enrichment failed", exc_info=exc)


async def run_post_intake_enrichment(
    settings: Settings,
    *,
    creator_id: str,
    creator_link: CreatorLink,
    candidate_id: str | None = None,
    campaign_id: str | None = None,
    proposal_reason: str | None = None,
    external_id: str | None = None,
) -> None:
    twenty = TwentyClient(settings.twenty_api_url, resolve_twenty_api_key(settings))
    apify = _build_apify(settings)
    request = EnrichmentRequest(
        creator_id=creator_id,
        platform=creator_link.platform,
        profile_url=creator_link.normalized_url,
    )
    enrich_result = await enrich_creator_job(
        request,
        apify,
        twenty,
        candidate_id=candidate_id,
        external_id=external_id,
    )

    if campaign_id and proposal_reason:
        enrichment_context: dict | None = None
        if enrich_result.get("status") == "succeeded":
            enrichment_context = {
                "follower_count": enrich_result.get("follower_count"),
                "average_views": enrich_result.get("average_views"),
                "bio": enrich_result.get("bio"),
            }
        ai = AIService(settings.openai_api_key, model=settings.openai_model)
        await ai_summary_job(
            AISummaryJobRequest(
                creator_id=creator_id,
                candidate_id=candidate_id,
                campaign_id=campaign_id,
                proposal_reason=proposal_reason,
                platform=creator_link.platform,
                profile_url=creator_link.normalized_url,
                enrichment=enrichment_context,
            ),
            ai,
            twenty,
            external_id=external_id,
        )


def schedule_post_intake_enrichment(
    settings: Settings,
    *,
    creator_id: str,
    creator_link: CreatorLink,
    candidate_id: str | None = None,
    campaign_id: str | None = None,
    proposal_reason: str | None = None,
    external_id: str | None = None,
) -> None:
    task = asyncio.create_task(
        run_post_intake_enrichment(
            settings,
            creator_id=creator_id,
            creator_link=creator_link,
            candidate_id=candidate_id,
            campaign_id=campaign_id,
            proposal_reason=proposal_reason,
            external_id=external_id,
        ),
        name=f"enrich-{creator_id}",
    )
    task.add_done_callback(_log_task_error)
