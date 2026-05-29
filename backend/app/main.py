import logging
import uuid
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings, get_settings
from app.jobs.ai_summary import ai_summary_job
from app.jobs.enrichment import enrich_creator_job
from app.jobs.reminders import send_follow_up_reminders_job
from app.models import (
    AISummaryJobRequest,
    CreatorIntakeRequest,
    CreatorIntakeResponse,
    EnrichmentRequest,
    IntakeOptionsResponse,
    Platform,
)
from app.services.ai_service import AIService
from app.services.apify_client import ApifyClient
from app.services.creator_intake import submit_creator_intake
from app.services.intake_options import load_intake_options
from app.services.telegram_bot import TelegramBot
from app.services.telegram_intake import IntakeStateStore, process_telegram_update
from app.services.twenty_auth import resolve_twenty_api_key
from app.services.twenty_client import TwentyApiError, TwentyClient
from app.services.twenty_webhook import handle_twenty_webhook

logger = logging.getLogger(__name__)

app = FastAPI(title="UGC Ops Backend", version="0.1.0")

_startup_settings = get_settings()
if _startup_settings.intake_cors_origin_list:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_startup_settings.intake_cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

_intake_store: IntakeStateStore | None = None


def get_intake_store(settings: Settings = Depends(get_settings)) -> IntakeStateStore:
    global _intake_store
    if _intake_store is None or _intake_store._ttl_seconds != settings.telegram_intake_state_ttl_seconds:
        _intake_store = IntakeStateStore(ttl_seconds=settings.telegram_intake_state_ttl_seconds)
    return _intake_store


def get_twenty(settings: Settings = Depends(get_settings)) -> TwentyClient:
    return TwentyClient(settings.twenty_api_url, resolve_twenty_api_key(settings))


def get_telegram(settings: Settings = Depends(get_settings)) -> TelegramBot:
    return TelegramBot(settings.telegram_bot_token)


def get_apify(settings: Settings = Depends(get_settings)) -> ApifyClient:
    return ApifyClient(
        settings.apify_token,
        {
            Platform.TIKTOK: settings.apify_tiktok_actor_id,
            Platform.INSTAGRAM: settings.apify_instagram_actor_id,
            Platform.YOUTUBE: settings.apify_youtube_actor_id,
            Platform.X: settings.apify_x_actor_id,
        },
    )


def get_ai(settings: Settings = Depends(get_settings)) -> AIService:
    return AIService(settings.openai_api_key, model=settings.openai_model)


@app.on_event("startup")
async def on_startup() -> None:
    settings = get_settings()
    try:
        settings.validate_intake_secret_config()
    except ValueError as exc:
        raise RuntimeError(str(exc)) from exc
    if settings.app_env == "local" and not settings.intake_api_secret:
        logger.warning("INTAKE_API_SECRET is not set; intake API is open on local only.")


def verify_intake_secret(
    settings: Settings = Depends(get_settings),
    x_intake_secret: str | None = Header(default=None, alias="X-Intake-Secret"),
) -> None:
    if not settings.intake_api_secret:
        if settings.intake_secret_required:
            raise HTTPException(status_code=500, detail="Intake API secret is not configured")
        return
    if x_intake_secret != settings.intake_api_secret:
        raise HTTPException(status_code=401, detail="Invalid intake API secret")


async def resolve_intake_labels(
    twenty: TwentyClient,
    *,
    product_id: str,
    campaign_id: str,
) -> tuple[str | None, str]:
    products = await twenty.list_products_for_intake()
    product_name = next((p["name"] for p in products if p["id"] == product_id), None)

    campaigns = await twenty.list_campaigns_for_product(product_id)
    campaign = next((c for c in campaigns if c["id"] == campaign_id), None)
    if not campaign:
        raise HTTPException(status_code=400, detail="Campaign not found for the selected product.")
    return product_name, campaign["name"]


@app.get("/health")
async def health(settings: Settings = Depends(get_settings)) -> dict[str, Any]:
    return {
        "status": "ok",
        "env": settings.app_env,
        "twentyConfigured": bool(resolve_twenty_api_key(settings)),
        "telegramConfigured": bool(settings.telegram_bot_token),
        "apifyConfigured": bool(settings.apify_token),
        "aiConfigured": bool(settings.openai_api_key),
    }


@app.post("/webhooks/telegram")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
    twenty: TwentyClient = Depends(get_twenty),
    telegram: TelegramBot = Depends(get_telegram),
    intake_store: IntakeStateStore = Depends(get_intake_store),
) -> dict[str, Any]:
    if settings.telegram_webhook_secret and x_telegram_bot_api_secret_token != settings.telegram_webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid Telegram webhook secret")

    update = await request.json()
    user = (update.get("message") or {}).get("from") or {}
    allowed_users = settings.allowed_telegram_user_ids
    if allowed_users and user.get("id") not in allowed_users:
        raise HTTPException(status_code=403, detail="Telegram user is not allowed")

    return await process_telegram_update(
        update,
        twenty=twenty,
        telegram=telegram,
        settings=settings,
        state_store=intake_store,
    )


@app.post("/webhooks/twenty")
async def twenty_webhook(
    request: Request,
    x_twenty_webhook_signature: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
    twenty: TwentyClient = Depends(get_twenty),
) -> dict[str, Any]:
    if settings.twenty_webhook_secret and not x_twenty_webhook_signature:
        raise HTTPException(status_code=401, detail="Missing Twenty webhook signature")

    payload = await request.json()
    return await handle_twenty_webhook(
        payload,
        twenty,
        follow_up_days_no_reply=settings.follow_up_days_no_reply,
    )


@app.post("/jobs/enrich-creator")
async def enrich_creator(
    request: EnrichmentRequest,
    apify: ApifyClient = Depends(get_apify),
    twenty: TwentyClient = Depends(get_twenty),
) -> dict[str, Any]:
    return await enrich_creator_job(request, apify, twenty)


@app.post("/jobs/summarize-creator")
async def summarize_creator(
    request: AISummaryJobRequest,
    ai: AIService = Depends(get_ai),
    twenty: TwentyClient = Depends(get_twenty),
) -> dict[str, Any]:
    return await ai_summary_job(request, ai, twenty)


@app.post("/jobs/send-reminders")
async def send_reminders(
    telegram: TelegramBot = Depends(get_telegram),
    twenty: TwentyClient = Depends(get_twenty),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    return await send_follow_up_reminders_job(telegram, twenty, settings)


@app.get("/intake/options", response_model=IntakeOptionsResponse)
async def intake_options(
    _: None = Depends(verify_intake_secret),
    twenty: TwentyClient = Depends(get_twenty),
) -> IntakeOptionsResponse:
    if not twenty.configured:
        raise HTTPException(status_code=503, detail="Twenty is not configured")
    try:
        return await load_intake_options(twenty)
    except TwentyApiError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/intake/creator", response_model=CreatorIntakeResponse)
async def intake_creator(
    body: CreatorIntakeRequest,
    _: None = Depends(verify_intake_secret),
    settings: Settings = Depends(get_settings),
    twenty: TwentyClient = Depends(get_twenty),
) -> CreatorIntakeResponse:
    if not twenty.configured:
        raise HTTPException(status_code=503, detail="Twenty is not configured")

    try:
        product_name, campaign_name = await resolve_intake_labels(
            twenty,
            product_id=body.product_id,
            campaign_id=body.campaign_id,
        )
    except TwentyApiError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    proposed_by = (body.proposed_by or "").strip() or "Twenty UI"
    result = await submit_creator_intake(
        twenty=twenty,
        settings=settings,
        profile_url=body.profile_url,
        product_id=body.product_id,
        product_name=product_name,
        campaign_id=body.campaign_id,
        campaign_name=campaign_name,
        reason=body.reason,
        proposed_by=proposed_by,
        source="Twenty UI",
        external_id=str(uuid.uuid4()),
    )

    if result.status == "duplicate_candidate":
        raise HTTPException(
            status_code=409,
            detail={
                "status": "duplicate_candidate",
                "candidate_id": result.candidate_id,
                "message": result.message,
                "duplicate_candidate": result.duplicate_candidate,
            },
        )

    if result.status == "error":
        is_client_error = bool(
            result.message
            and (
                "Unsupported" in result.message
                or "empty" in result.message.lower()
            )
        )
        raise HTTPException(
            status_code=400 if is_client_error else 502,
            detail=result.message or "Intake failed",
        )

    handle = (result.creator or {}).get("handle") or "creator"
    return CreatorIntakeResponse(
        status="created",
        creator_id=result.creator_id,
        candidate_id=result.candidate_id,
        creator_was_new=result.creator_was_new,
        message=(
            f"Saved for Creator Review. Creator: {handle}. "
            f"Campaign: {campaign_name}. Check the Creator Review board."
        ),
    )
