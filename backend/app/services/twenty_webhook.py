"""Optional Twenty webhook fallback for approve handoff and follow-up scheduling.

Primary automation lives in twenty-app-official logic functions:
- approve-candidate-handoff (candidate status → APPROVED_TO_CONTACT)
- apply-outreach-follow-up (lastContactedAt + NO_REPLY → nextFollowUpAt)
"""

from typing import Any

from app.services.follow_up import should_apply_no_reply_follow_up
from app.services.outreach_handoff import (
    apply_no_reply_follow_up,
    create_outreach_from_approved_candidate,
)
from app.services.twenty_client import TwentyClient


async def handle_twenty_webhook(
    payload: dict[str, Any],
    twenty: TwentyClient,
    *,
    follow_up_days_no_reply: int = 3,
) -> dict[str, Any]:
    event_name = payload.get("event") or payload.get("name") or ""
    record = payload.get("record") or payload.get("properties", {}).get("after") or {}
    before = payload.get("properties", {}).get("before") or {}
    record_id = payload.get("recordId") or record.get("id")

    if not twenty.configured:
        return {"status": "skipped", "reason": "Twenty API not configured", "event": event_name}

    if "campaignCreatorCandidate" in event_name and record.get("status") == "APPROVED_TO_CONTACT":
        if before.get("status") == "APPROVED_TO_CONTACT":
            return {"status": "ignored", "reason": "already approved"}

        outreach = await create_outreach_from_approved_candidate(
            twenty,
            candidate_id=record_id,
            creator_id=record.get("creatorId"),
            campaign_id=record.get("campaignId"),
            creator_handle_link=record.get("creatorHandleLink"),
            creator_handle=record.get("creatorHandle"),
            member=record.get("proposedBy"),
        )
        return {"status": "handoff", "outreach": outreach}

    if "outreachRecord" in event_name and record.get("lastContactedAt"):
        last_contacted = record.get("lastContactedAt")
        if before.get("lastContactedAt") == last_contacted and not payload.get("forceFollowUp"):
            return {"status": "ignored", "reason": "lastContactedAt unchanged"}

        if should_apply_no_reply_follow_up(record.get("replyStatus")):
            updated = await apply_no_reply_follow_up(
                twenty,
                record_id,
                last_contacted,
                record.get("replyStatus"),
                follow_up_days=follow_up_days_no_reply,
            )
            return {"status": "follow_up_scheduled", "outreach": updated}

        return {"status": "ignored", "reason": "reply received or no contact date"}

    return {"status": "received", "event": event_name}
