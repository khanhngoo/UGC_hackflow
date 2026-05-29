# UGC Ops Backend

FastAPI service for Telegram intake, Twenty UI intake, Twenty API writes, Apify enrichment, follow-up reminders, and Twenty webhooks.

## Local Setup

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -e ".[dev]"
cp ../.env.example .env
uvicorn app.main:app --reload
```

## Endpoints

- `GET /health`
- `GET /intake/options` — products and campaigns for the UGC Ops intake form
- `POST /intake/creator` — submit creator proposal from Twenty UI
- `POST /webhooks/telegram`
- `POST /webhooks/twenty`
- `POST /jobs/enrich-creator`
- `POST /jobs/summarize-creator`
- `POST /jobs/send-reminders`

## Twenty API smoke test (Step 1)

```bash
python3 scripts/smoke_step1_twenty.py
```

Requires `TWENTY_API_KEY` in `.env` or `~/.twenty/config.json` from `yarn twenty remote:add`.

## Telegram intake (Step 2 / M9)

Multi-step flow: **link → product number → campaign number → reason → Twenty**.

### Environment

- `TELEGRAM_BOT_TOKEN` — from [@BotFather](https://t.me/BotFather)
- `TELEGRAM_WEBHOOK_SECRET` — optional secret token for `X-Telegram-Bot-Api-Secret-Token`
- `TELEGRAM_ALLOWED_USER_IDS` — optional comma-separated Telegram user IDs
- `TWENTY_APP_URL` — UI base for confirmation links (defaults to `TWENTY_API_URL`)
- `TELEGRAM_INTAKE_STATE_TTL_SECONDS` — conversation state TTL (default 1800)

### Webhook setup

Telegram requires HTTPS. For local dev, use a tunnel (e.g. ngrok, cloudflared):

```bash
# Example: expose local backend
ngrok http 8000
```

Register the webhook (replace token, URL, and secret):

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://<your-tunnel>/webhooks/telegram" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Run the backend on the same port your tunnel targets:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Manual test flow

1. Send a TikTok/Instagram profile link to the bot.
2. Reply with a product number from the list.
3. Reply with a campaign number for that product.
4. Reply with a one-line reason.
5. Confirm the card appears on **Creator Review** in Twenty.

Send `/cancel` to abort an in-progress intake.

**Note:** Intake conversation state is stored in memory (single backend process). Use Redis if you run multiple replicas.

## Twenty UI intake (UGC Ops page)

Single-page form on the **UGC Ops** home layout in Twenty (`twenty-app-official` front component).

### Environment

- `INTAKE_CORS_ORIGINS` — comma-separated browser origins allowed to call the API (default `http://localhost:2020`)
- `INTAKE_API_SECRET` — optional in `local`; required in `staging` / `production`. Send as header `X-Intake-Secret` when set.
- `TWENTY_API_KEY` — same as other backend jobs (writes to Twenty)

Update `UGC_BACKEND_URL` in `twenty-app-official/src/constants/intake-api.ts` when the API is not on `http://localhost:8000`.

### Manual test flow

1. Start Twenty (`yarn twenty docker:start`) and sync the app (`yarn twenty dev --once`).
2. Start the backend: `uvicorn app.main:app --reload --port 8000`.
3. Open Twenty → **UGC Ops**.
4. Submit a profile URL, product, campaign, and reason.
5. Confirm the card on **Creator Review**; metrics/tags may fill in after Apify/OpenAI run.

**Production note:** The intake form runs in the user's browser. Do not ship `INTAKE_API_SECRET` in the front-end bundle; restrict network access or add a server-side proxy before exposing intake publicly.

## AI creator summary (M11)

After Apify enrichment (or immediately if Apify is skipped), the backend runs an OpenAI job to suggest **niche**, **tags**, and **brand/audience fit star ratings** on the `Creator` and candidate snapshot fields. Risk notes and long summaries are not written.

- Configure `OPENAI_API_KEY` and optional `OPENAI_MODEL` (default `gpt-4o-mini`).
- Without OpenAI, the job is skipped and an `IntegrationEvent` with type `AI_SUMMARY_SKIPPED` is logged.
- Manual trigger: `POST /jobs/summarize-creator` with `creator_id`, `campaign_id`, `proposal_reason`, `platform`, `profile_url`, optional `candidate_id` and `enrichment`.

## Apify enrichment (Step 3 / M10)

After a successful Telegram or Twenty UI intake, the backend schedules Apify enrichment in the background (`asyncio.create_task`). Failures do not affect the user-facing success response or candidate creation.

- Configure `APIFY_TOKEN` and per-platform `APIFY_*_ACTOR_ID` in `.env` (see `.env.example`).
- Without Apify, enrichment is skipped and an `IntegrationEvent` with type `APIFY_ENRICHMENT_SKIPPED` is written to Twenty.
- Manual trigger: `POST /jobs/enrich-creator` with `{ "creator_id", "platform", "profile_url" }`.

Enrichment updates `Creator` metrics and copies snapshot fields onto the new `CampaignCreatorCandidate` when possible.

## Approve handoff (Step 4 / M12)

**Primary path:** Twenty logic functions in `twenty-app-official/` (deploy with `yarn twenty dev --once`):

- `approve-candidate-handoff` — when candidate `status` → `APPROVED_TO_CONTACT`, creates `OutreachRecord` and updates denormalized `Creator` fields.
- `apply-outreach-follow-up` — when `lastContactedAt` changes and `replyStatus` is `NO_REPLY`, sets `nextFollowUpAt` (+3 days).

`POST /webhooks/twenty` is an optional fallback for the same rules; you do not need it for normal operations.

Follow-up **reminders** still run on the backend: `POST /jobs/send-reminders` (uses `FOLLOW_UP_DAYS_NO_REPLY` and `TELEGRAM_REMINDER_CHAT_ID`).

The service is intentionally provider-adapter based. Telegram, Twenty, Apify, and AI calls can be mocked in tests and switched to real credentials through environment variables.

