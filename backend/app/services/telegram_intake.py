from __future__ import annotations

import re
import time
from collections import OrderedDict
from dataclasses import dataclass
from enum import Enum
from typing import Any, TypeVar

from app.config import Settings
from app.models import CampaignChoice, CreatorLink, IntakeStep, ProductChoice, TelegramIntakeState
from app.services.creator_intake import submit_creator_intake
from app.services.normalizers import normalize_creator_url
from app.services.telegram_bot import TelegramBot
from app.services.twenty_client import TwentyClient

CANCEL_COMMANDS = frozenset({"/cancel", "/start"})
LINK_PATTERN = re.compile(
    r"https?://[^\s]+|"
    r"(?:[a-zA-Z0-9][-a-zA-Z0-9]*\.)+(?:tiktok|instagram|youtube|youtu|twitter|x)\.com[^\s]*",
    re.IGNORECASE,
)

ChoiceT = TypeVar("ChoiceT", ProductChoice, CampaignChoice)


class IntakeAction(str, Enum):
    REPLY = "reply"
    SUBMIT = "submit"
    PRODUCT_SELECTED = "product_selected"
    NO_REPLY = "no_reply"


@dataclass
class IntakeResult:
    action: IntakeAction
    reply_text: str | None = None
    state: TelegramIntakeState | None = None


class IntakeStateStore:
    def __init__(self, ttl_seconds: int = 1800) -> None:
        self._ttl_seconds = ttl_seconds
        self._states: dict[int, tuple[TelegramIntakeState, float]] = {}

    def get(self, chat_id: int) -> TelegramIntakeState | None:
        entry = self._states.get(chat_id)
        if not entry:
            return None
        state, expires_at = entry
        if time.monotonic() > expires_at:
            del self._states[chat_id]
            return None
        return state

    def set(self, state: TelegramIntakeState) -> None:
        self._states[state.chat_id] = (state, time.monotonic() + self._ttl_seconds)

    def clear(self, chat_id: int) -> None:
        self._states.pop(chat_id, None)


class UpdateIdStore:
    """Bounded store of processed Telegram update_id values."""

    def __init__(self, max_size: int = 5000) -> None:
        self._max_size = max_size
        self._seen: OrderedDict[int, None] = OrderedDict()

    def seen(self, update_id: int) -> bool:
        if update_id in self._seen:
            return True
        self._seen[update_id] = None
        while len(self._seen) > self._max_size:
            self._seen.popitem(last=False)
        return False


intake_state_store = IntakeStateStore()
update_id_store = UpdateIdStore()


def extract_profile_link(text: str) -> str | None:
    for match in LINK_PATTERN.finditer(text):
        candidate = match.group(0).strip().rstrip(".,;)")
        if "." in candidate and ("/" in candidate or candidate.startswith("http")):
            return candidate
    for word in text.split():
        cleaned = word.strip().rstrip(".,;)")
        if "." in cleaned and ("/" in cleaned or cleaned.startswith("http")):
            return cleaned
    return None


def format_proposed_by(user: dict[str, Any]) -> str:
    username = user.get("username")
    if username:
        return f"@{username}"
    first_name = user.get("first_name")
    if first_name:
        return str(first_name)
    return f"user_{user.get('id', 'unknown')}"


def parse_numbered_selection(text: str, choices: list[ChoiceT]) -> ChoiceT | None:
    stripped = text.strip()
    if stripped.isdigit():
        index = int(stripped) - 1
        if 0 <= index < len(choices):
            return choices[index]
    lowered = stripped.lower()
    for choice in choices:
        if choice.name.lower() == lowered:
            return choice
    return None


def format_product_list(products: list[ProductChoice]) -> str:
    lines = ["Link saved. Which product?"]
    for index, product in enumerate(products, start=1):
        lines.append(f"{index}) {product.name}")
    lines.append("Reply with a number, or /cancel.")
    return "\n".join(lines)


def format_campaign_list(product_name: str, campaigns: list[CampaignChoice]) -> str:
    lines = [f"Product: {product_name}", "Which campaign?"]
    for index, campaign in enumerate(campaigns, start=1):
        lines.append(f"{index}) {campaign.name}")
    lines.append("Reply with a number, or /cancel.")
    return "\n".join(lines)


def handle_idle_message(
    text: str,
    *,
    chat_id: int,
    user_id: int,
    products: list[ProductChoice],
) -> IntakeResult:
    if is_cancel_command(text):
        return IntakeResult(action=IntakeAction.REPLY, reply_text="No intake in progress. Send a creator link to start.")

    link = extract_profile_link(text)
    if not link:
        return IntakeResult(
            action=IntakeAction.REPLY,
            reply_text="Send a creator profile or content link to start a proposal.",
        )

    if not products:
        return IntakeResult(
            action=IntakeAction.REPLY,
            reply_text="No active products found in Twenty. Add a product first, then try again.",
        )

    creator_link = normalize_creator_url(link)
    remainder = text.replace(link, "").strip()
    state = TelegramIntakeState(
        chat_id=chat_id,
        user_id=user_id,
        creator_link=creator_link,
        step=IntakeStep.AWAITING_PRODUCT,
        product_choices=products,
        draft_reason=remainder or None,
    )
    return IntakeResult(
        action=IntakeAction.REPLY,
        reply_text=format_product_list(products),
        state=state,
    )


def handle_awaiting_product(text: str, state: TelegramIntakeState) -> IntakeResult:
    if is_cancel_command(text):
        return IntakeResult(action=IntakeAction.REPLY, reply_text="Cancelled. Send a new link anytime.")

    link = extract_profile_link(text)
    if link:
        creator_link = normalize_creator_url(link)
        remainder = text.replace(link, "").strip()
        state.creator_link = creator_link
        state.draft_reason = remainder or state.draft_reason
        state.product_id = None
        state.product_name = None
        state.campaign_choices = []
        state.campaign_id = None
        state.campaign_name = None
        return IntakeResult(
            action=IntakeAction.REPLY,
            reply_text=format_product_list(state.product_choices),
            state=state,
        )

    choice = parse_numbered_selection(text, state.product_choices)
    if not choice:
        return IntakeResult(
            action=IntakeAction.REPLY,
            reply_text=f"Invalid selection. Reply with a number from 1 to {len(state.product_choices)}, or /cancel.",
            state=state,
        )

    state.product_id = choice.id
    state.product_name = choice.name
    return IntakeResult(action=IntakeAction.PRODUCT_SELECTED, state=state)


def handle_awaiting_campaign(text: str, state: TelegramIntakeState) -> IntakeResult:
    if is_cancel_command(text):
        return IntakeResult(action=IntakeAction.REPLY, reply_text="Cancelled. Send a new link anytime.")

    link = extract_profile_link(text)
    if link:
        creator_link = normalize_creator_url(link)
        remainder = text.replace(link, "").strip()
        state.creator_link = creator_link
        state.draft_reason = remainder or state.draft_reason
        state.campaign_id = None
        state.campaign_name = None
        return IntakeResult(
            action=IntakeAction.REPLY,
            reply_text=format_campaign_list(state.product_name or "Product", state.campaign_choices),
            state=state,
        )

    choice = parse_numbered_selection(text, state.campaign_choices)
    if not choice:
        return IntakeResult(
            action=IntakeAction.REPLY,
            reply_text=f"Invalid selection. Reply with a number from 1 to {len(state.campaign_choices)}, or /cancel.",
            state=state,
        )

    state.campaign_id = choice.id
    state.campaign_name = choice.name
    state.step = IntakeStep.AWAITING_REASON
    return IntakeResult(
        action=IntakeAction.REPLY,
        reply_text="Why do you recommend them? (one short line)",
        state=state,
    )


def handle_awaiting_reason(text: str, state: TelegramIntakeState) -> IntakeResult:
    if is_cancel_command(text):
        return IntakeResult(action=IntakeAction.REPLY, reply_text="Cancelled. Send a new link anytime.")

    link = extract_profile_link(text)
    if link:
        return IntakeResult(
            action=IntakeAction.REPLY,
            reply_text="Please send your reason as text, or /cancel to start over.",
            state=state,
        )

    reason = text.strip()
    if not reason:
        return IntakeResult(
            action=IntakeAction.REPLY,
            reply_text="Reason cannot be empty. Why do you recommend them?",
            state=state,
        )

    state.reason = reason
    return IntakeResult(action=IntakeAction.SUBMIT, state=state)


def is_cancel_command(text: str) -> bool:
    return text.strip().lower() in CANCEL_COMMANDS


def build_confirmation_message(
    *,
    candidate: dict[str, Any],
    creator: dict[str, Any],
    product_name: str | None,
    campaign_name: str,
    twenty_app_url: str,
    creator_was_new: bool,
) -> str:
    handle = candidate.get("creator", {}).get("handle") or creator.get("handle") or "creator"
    candidate_id = candidate.get("id", "")
    base_url = twenty_app_url.rstrip("/")
    reuse_note = "" if creator_was_new else "\n(Reused existing creator profile.)"
    product_line = f"Product: {product_name}\n" if product_name else ""
    return (
        f"Saved for Creator Review.\n"
        f"Creator: {handle}\n"
        f"{product_line}"
        f"Campaign: {campaign_name}\n"
        f"Candidate id: {candidate_id}{reuse_note}\n"
        f"Open Twenty: {base_url}\n"
        f"Check the Creator Review board for the new card."
    )


async def process_telegram_update(
    update: dict[str, Any],
    *,
    twenty: TwentyClient,
    telegram: TelegramBot,
    settings: Settings,
    state_store: IntakeStateStore | None = None,
) -> dict[str, Any]:
    store = state_store or intake_state_store
    message = update.get("message") or {}
    chat = message.get("chat") or {}
    user = message.get("from") or {}
    text = (message.get("text") or "").strip()
    chat_id = chat.get("id")
    user_id = user.get("id")

    if chat_id is None or user_id is None:
        return {"status": "ignored", "reason": "missing chat or user"}

    if not twenty.configured:
        await telegram.send_message(chat_id, "Twenty is not configured. Set TWENTY_API_KEY and try again.")
        return {"status": "error", "reason": "twenty_not_configured"}

    update_id = update.get("update_id")
    if update_id is not None and update_id_store.seen(int(update_id)):
        return {"status": "duplicate", "update_id": update_id}

    if is_cancel_command(text):
        store.clear(chat_id)
        await telegram.send_message(chat_id, "Cancelled. Send a creator link to start a new proposal.")
        return {"status": "cancelled"}

    state = store.get(chat_id)
    intake_result: IntakeResult

    if state is None:
        products_raw = await twenty.list_products_for_intake()
        products = [ProductChoice(id=p["id"], name=p["name"]) for p in products_raw]
        intake_result = handle_idle_message(text, chat_id=chat_id, user_id=user_id, products=products)
    elif state.step == IntakeStep.AWAITING_PRODUCT:
        intake_result = handle_awaiting_product(text, state)
    elif state.step == IntakeStep.AWAITING_CAMPAIGN:
        intake_result = handle_awaiting_campaign(text, state)
    elif state.step == IntakeStep.AWAITING_REASON:
        intake_result = handle_awaiting_reason(text, state)
    else:
        store.clear(chat_id)
        await telegram.send_message(chat_id, "Something went wrong. Send a creator link to start again.")
        return {"status": "error", "reason": "unknown_step"}

    if intake_result.action == IntakeAction.PRODUCT_SELECTED:
        selected = intake_result.state
        if not selected or not selected.product_id or not selected.product_name:
            store.clear(chat_id)
            await telegram.send_message(chat_id, "Missing product. Send a creator link to start again.")
            return {"status": "error", "reason": "missing_product"}

        campaigns_raw = await twenty.list_campaigns_for_product(selected.product_id)
        campaigns = [CampaignChoice(id=c["id"], name=c["name"]) for c in campaigns_raw]
        if not campaigns:
            selected.step = IntakeStep.AWAITING_PRODUCT
            store.set(selected)
            await telegram.send_message(
                chat_id,
                (
                    f"No active campaigns for {selected.product_name}.\n"
                    "Pick another product number, or /cancel."
                ),
            )
            return {"status": "awaiting_input", "step": IntakeStep.AWAITING_PRODUCT.value}

        selected.campaign_choices = campaigns
        selected.step = IntakeStep.AWAITING_CAMPAIGN
        store.set(selected)
        await telegram.send_message(
            chat_id,
            format_campaign_list(selected.product_name, campaigns),
        )
        return {"status": "awaiting_input", "step": IntakeStep.AWAITING_CAMPAIGN.value}

    if intake_result.action == IntakeAction.REPLY:
        if intake_result.state is not None:
            store.set(intake_result.state)
        else:
            store.clear(chat_id)
        if intake_result.reply_text:
            await telegram.send_message(chat_id, intake_result.reply_text)
        return {"status": "awaiting_input", "step": (intake_result.state.step if intake_result.state else None)}

    # SUBMIT
    submit_state = intake_result.state
    if (
        not submit_state
        or not submit_state.campaign_id
        or not submit_state.campaign_name
        or not submit_state.product_id
    ):
        store.clear(chat_id)
        await telegram.send_message(chat_id, "Missing product or campaign. Send a creator link to start again.")
        return {"status": "error", "reason": "missing_product_or_campaign"}

    reason = submit_state.reason or submit_state.draft_reason or ""
    proposed_by = format_proposed_by(user)
    external_id = str(update_id) if update_id is not None else f"{chat_id}:{user_id}"

    intake_result = await submit_creator_intake(
        twenty=twenty,
        settings=settings,
        profile_url=submit_state.creator_link.normalized_url,
        product_id=submit_state.product_id,
        product_name=submit_state.product_name,
        campaign_id=submit_state.campaign_id,
        campaign_name=submit_state.campaign_name,
        reason=reason,
        proposed_by=proposed_by,
        source="Telegram",
        external_id=external_id,
    )

    if intake_result.status == "duplicate_candidate":
        store.clear(chat_id)
        await telegram.send_message(
            chat_id,
            (
                f"{intake_result.message}\n"
                "Send a different link or pick another campaign."
            ),
        )
        return {
            "status": "duplicate_candidate",
            "candidate_id": intake_result.candidate_id,
        }

    if intake_result.status == "error":
        store.clear(chat_id)
        await telegram.send_message(
            chat_id,
            intake_result.message or "Could not save to Twenty. Please try again or contact the team.",
        )
        return {"status": "error", "reason": intake_result.message}

    store.clear(chat_id)
    confirmation = build_confirmation_message(
        candidate=intake_result.candidate or {},
        creator=intake_result.creator or {},
        product_name=submit_state.product_name,
        campaign_name=submit_state.campaign_name,
        twenty_app_url=settings.resolved_twenty_app_url,
        creator_was_new=bool(intake_result.creator_was_new),
    )
    await telegram.send_message(chat_id, confirmation)

    return {
        "status": "created",
        "creator_id": intake_result.creator_id,
        "candidate_id": intake_result.candidate_id,
        "product_id": submit_state.product_id,
        "creator_was_new": intake_result.creator_was_new,
    }
