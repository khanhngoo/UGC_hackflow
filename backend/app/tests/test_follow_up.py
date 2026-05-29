from app.services.follow_up import compute_next_follow_up_at, should_apply_no_reply_follow_up


def test_should_apply_no_reply_follow_up() -> None:
    assert should_apply_no_reply_follow_up("NO_REPLY") is True
    assert should_apply_no_reply_follow_up(None) is True
    assert should_apply_no_reply_follow_up("REPLIED") is False


def test_compute_next_follow_up_at() -> None:
    result = compute_next_follow_up_at("2026-05-26T14:00:00.000Z")
    assert result.startswith("2026-05-29")
