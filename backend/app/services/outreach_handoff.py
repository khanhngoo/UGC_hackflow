from typing import Any

from app.services.follow_up import (
    compute_next_follow_up_at,
    should_apply_no_reply_follow_up,
)
from app.services.twenty_client import TwentyClient


async def apply_no_reply_follow_up(
    twenty: TwentyClient,
    outreach_id: str,
    last_contacted_at: str,
    reply_status: str | None,
    *,
    force: bool = False,
    follow_up_days: int = 3,
) -> dict[str, Any] | None:
    if not should_apply_no_reply_follow_up(reply_status):
        return None

    payload: dict[str, Any] = {
        "nextFollowUpAt": compute_next_follow_up_at(last_contacted_at, days=follow_up_days),
    }

    if force:
        return await twenty.update_record("outreachRecords", outreach_id, payload)

    return await twenty.update_record("outreachRecords", outreach_id, payload)


async def create_outreach_from_approved_candidate(
    twenty: TwentyClient,
    *,
    candidate_id: str,
    creator_id: str,
    campaign_id: str,
    creator_handle_link: dict[str, Any] | None,
    creator_handle: str | None,
    member: str | None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "candidateId": candidate_id,
        "creatorId": creator_id,
        "campaignId": campaign_id,
        "pipelineStatus": "APPROVED_TO_CONTACT",
        "replyStatus": "NO_REPLY",
    }

    if creator_handle_link:
        payload["creatorHandleLink"] = creator_handle_link
    handle_label = (creator_handle_link or {}).get("primaryLinkLabel") or creator_handle
    if handle_label:
        payload["creatorHandle"] = handle_label
    if member:
        payload["member"] = member

    return await twenty.create_record("outreachRecords", payload)
