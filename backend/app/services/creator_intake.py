from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any, Literal

from app.config import Settings
from app.models import CreatorLink, Platform
from app.services.enrichment_runner import schedule_post_intake_enrichment
from app.services.normalizers import normalize_creator_url
from app.services.twenty_client import TwentyApiError, TwentyClient

IntakeSource = Literal["Telegram", "Twenty UI"]


@dataclass
class CreatorIntakeResult:
    status: Literal["created", "duplicate_candidate", "error"]
    creator_id: str | None = None
    candidate_id: str | None = None
    creator_was_new: bool = False
    duplicate_candidate: dict[str, Any] | None = None
    message: str | None = None
    creator: dict[str, Any] | None = None
    candidate: dict[str, Any] | None = None
    product_id: str | None = None


def event_type_prefix(source: IntakeSource) -> str:
    return "TELEGRAM" if source == "Telegram" else "TWENTY_UI"


async def submit_creator_intake(
    *,
    twenty: TwentyClient,
    settings: Settings,
    profile_url: str,
    product_id: str,
    product_name: str | None,
    campaign_id: str,
    campaign_name: str,
    reason: str,
    proposed_by: str,
    source: IntakeSource,
    external_id: str | None = None,
    schedule_enrichment: bool = True,
) -> CreatorIntakeResult:
    reason_stripped = reason.strip()
    if not reason_stripped:
        return CreatorIntakeResult(status="error", message="Reason cannot be empty.")

    creator_link = normalize_creator_url(profile_url.strip())
    if creator_link.platform == Platform.UNKNOWN:
        return CreatorIntakeResult(
            status="error",
            message="Unsupported profile URL. Use TikTok, Instagram, YouTube, or X.",
        )

    event_id = external_id or str(uuid.uuid4())
    prefix = event_type_prefix(source)

    try:
        creator, creator_was_new = await twenty.find_or_create_creator(creator_link)

        existing = await twenty.find_open_candidate_for_creator_campaign(
            creator["id"],
            campaign_id,
        )
        if existing:
            await twenty.create_integration_event(
                source=source,
                external_id=event_id,
                event_type=f"{prefix}_INTAKE_SKIPPED",
                status="SKIPPED",
                payload_summary=f"Duplicate candidate {existing.get('id')}",
                linked_object_type="campaignCreatorCandidate",
                linked_object_id=existing.get("id"),
            )
            return CreatorIntakeResult(
                status="duplicate_candidate",
                candidate_id=existing.get("id"),
                duplicate_candidate=existing,
                message=(
                    f"You already proposed this creator for {campaign_name} "
                    f"(status: {existing.get('status', 'unknown')})."
                ),
            )

        candidate = await twenty.create_campaign_creator_candidate(
            creator_id=creator["id"],
            campaign_id=campaign_id,
            product_id=product_id,
            proposed_by=proposed_by,
            reason=reason_stripped,
            source=source,
            creator_link=creator_link,
            campaign_name=campaign_name,
        )

        product_label = product_name or product_id
        await twenty.create_integration_event(
            source=source,
            external_id=event_id,
            event_type=f"{prefix}_INTAKE_SUCCEEDED",
            status="SUCCEEDED",
            payload_summary=f"Candidate {candidate.get('id')} for {product_label} / {campaign_name}",
            linked_object_type="campaignCreatorCandidate",
            linked_object_id=candidate.get("id"),
        )

        if schedule_enrichment:
            schedule_post_intake_enrichment(
                settings,
                creator_id=creator["id"],
                creator_link=creator_link,
                candidate_id=candidate.get("id"),
                campaign_id=campaign_id,
                proposal_reason=reason_stripped,
                external_id=event_id,
            )

        return CreatorIntakeResult(
            status="created",
            creator_id=creator.get("id"),
            candidate_id=candidate.get("id"),
            creator_was_new=creator_was_new,
            creator=creator,
            candidate=candidate,
            product_id=product_id,
        )

    except TwentyApiError as exc:
        await twenty.create_integration_event(
            source=source,
            external_id=event_id,
            event_type=f"{prefix}_INTAKE_FAILED",
            status="FAILED",
            payload_summary=profile_url[:200],
            error_message=str(exc)[:500],
        )
        return CreatorIntakeResult(status="error", message=str(exc))
