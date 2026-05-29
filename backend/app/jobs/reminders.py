from datetime import datetime, timezone

from app.config import Settings, get_settings
from app.services.telegram_bot import TelegramBot
from app.services.twenty_client import TwentyClient


def _parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def filter_overdue_no_reply(records: list[dict]) -> list[dict]:
    now = datetime.now(timezone.utc)
    overdue: list[dict] = []

    for record in records:
        if record.get("pipelineStatus") == "CLOSED":
            continue
        if record.get("replyStatus") not in (None, "NO_REPLY"):
            continue

        follow_up_at = _parse_iso(record.get("nextFollowUpAt"))
        if follow_up_at and follow_up_at < now:
            overdue.append(record)

    return overdue


async def send_follow_up_reminders_job(
    telegram: TelegramBot,
    twenty: TwentyClient,
    settings: Settings | None = None,
) -> dict:
    settings = settings or get_settings()

    if not twenty.configured:
        return {"status": "skipped", "reason": "Twenty API not configured"}

    records = await twenty.list_outreach_records()
    overdue = filter_overdue_no_reply(records)

    if not overdue:
        return {"status": "ok", "notified": 0, "overdue": []}

    lines = ["Overdue creator follow-ups (no reply):"]
    for record in overdue:
        handle_link = record.get("creatorHandleLink") or {}
        handle = handle_link.get("primaryLinkLabel") or record.get("id")
        member = record.get("member") or "unassigned"
        campaign = (record.get("campaign") or {}).get("name") or "campaign"
        due = record.get("nextFollowUpAt") or "unknown"
        lines.append(f"- {handle} ({campaign}) — member: {member}, due: {due}")

    message = "\n".join(lines)
    notified = 0

    if settings.telegram_reminder_chat_id and telegram.token:
        await telegram.send_message(int(settings.telegram_reminder_chat_id), message)
        notified = 1

    return {
        "status": "ok",
        "overdueCount": len(overdue),
        "notified": notified,
        "overdue": overdue,
        "message": message if notified == 0 else None,
    }
