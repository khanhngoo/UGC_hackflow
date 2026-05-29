from app.models import CampaignChoice, IntakeStep, ProductChoice, TelegramIntakeState
from app.services.telegram_intake import (
    IntakeAction,
    extract_profile_link,
    format_proposed_by,
    handle_awaiting_campaign,
    handle_awaiting_product,
    handle_awaiting_reason,
    handle_idle_message,
    is_cancel_command,
    parse_numbered_selection,
)
from app.services.normalizers import normalize_creator_url


def test_extract_profile_link_from_message() -> None:
    text = "Check this https://www.tiktok.com/@creator123 cool find"
    assert extract_profile_link(text) == "https://www.tiktok.com/@creator123"


def test_format_proposed_by_username() -> None:
    assert format_proposed_by({"username": "growth_lead", "id": 1}) == "@growth_lead"


def test_format_proposed_by_fallback() -> None:
    assert format_proposed_by({"id": 42, "first_name": "Alex"}) == "Alex"
    assert format_proposed_by({"id": 99}) == "user_99"


def test_idle_message_starts_product_step() -> None:
    products = [
        ProductChoice(id="p1", name="Glow Bottle"),
        ProductChoice(id="p2", name="Other Product"),
    ]
    result = handle_idle_message(
        "https://tiktok.com/@newcreator",
        chat_id=1,
        user_id=2,
        products=products,
    )
    assert result.action == IntakeAction.REPLY
    assert result.state is not None
    assert result.state.step == IntakeStep.AWAITING_PRODUCT
    assert "1) Glow Bottle" in (result.reply_text or "")
    assert "Which product" in (result.reply_text or "")


def test_awaiting_product_selects_product() -> None:
    link = normalize_creator_url("https://tiktok.com/@creator")
    state = TelegramIntakeState(
        chat_id=1,
        user_id=2,
        creator_link=link,
        step=IntakeStep.AWAITING_PRODUCT,
        product_choices=[ProductChoice(id="p1", name="Glow Bottle")],
    )
    result = handle_awaiting_product("1", state)
    assert result.action == IntakeAction.PRODUCT_SELECTED
    assert result.state is not None
    assert result.state.product_id == "p1"
    assert result.state.product_name == "Glow Bottle"


def test_awaiting_campaign_parses_number() -> None:
    link = normalize_creator_url("https://tiktok.com/@creator")
    state = TelegramIntakeState(
        chat_id=1,
        user_id=2,
        creator_link=link,
        step=IntakeStep.AWAITING_CAMPAIGN,
        product_id="p1",
        product_name="Glow Bottle",
        campaign_choices=[CampaignChoice(id="c1", name="Campaign A")],
    )
    result = handle_awaiting_campaign("1", state)
    assert result.state is not None
    assert result.state.step == IntakeStep.AWAITING_REASON
    assert result.state.campaign_id == "c1"
    assert "Why do you recommend" in (result.reply_text or "")


def test_awaiting_reason_submits() -> None:
    link = normalize_creator_url("https://tiktok.com/@creator")
    state = TelegramIntakeState(
        chat_id=1,
        user_id=2,
        creator_link=link,
        step=IntakeStep.AWAITING_REASON,
        product_id="p1",
        product_name="Glow Bottle",
        campaign_id="c1",
        campaign_name="Campaign A",
    )
    result = handle_awaiting_reason("Great fit for students", state)
    assert result.action == IntakeAction.SUBMIT
    assert result.state is not None
    assert result.state.reason == "Great fit for students"


def test_cancel_command() -> None:
    assert is_cancel_command("/cancel")
    assert is_cancel_command("/start")
    assert not is_cancel_command("hello")


def test_parse_numbered_selection_by_name() -> None:
    choices = [CampaignChoice(id="x", name="Exam Season UGC")]
    assert parse_numbered_selection("Exam Season UGC", choices) is not None
    assert parse_numbered_selection("99", choices) is None
