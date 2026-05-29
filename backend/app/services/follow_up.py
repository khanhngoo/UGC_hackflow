from datetime import datetime, timedelta, timezone

DEFAULT_FOLLOW_UP_DAYS_NO_REPLY = 3


def should_apply_no_reply_follow_up(reply_status: str | None) -> bool:
    return reply_status in (None, "NO_REPLY")


def compute_next_follow_up_at(
    last_contacted_at: str | datetime,
    *,
    days: int = DEFAULT_FOLLOW_UP_DAYS_NO_REPLY,
) -> str:
    if isinstance(last_contacted_at, str):
        anchor = datetime.fromisoformat(last_contacted_at.replace("Z", "+00:00"))
    else:
        anchor = last_contacted_at

    if anchor.tzinfo is None:
        anchor = anchor.replace(tzinfo=timezone.utc)

    next_follow_up = anchor + timedelta(days=days)
    return next_follow_up.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
