# UGC Campaign Ops Architecture

## System Boundary

Self-hosted Twenty is the system of record for campaign operations. The external backend owns provider integration, conversational state, retries, normalization, and scheduled jobs.

```text
Telegram Bot
    |
    v
External Backend ---> Apify Actors
    |             ---> AI Provider
    |             ---> Email/Social APIs later
    v
Self-Hosted Twenty App/API/Webhooks
```

## Responsibilities

### Self-Hosted Twenty

- Stores campaigns, creators, campaign creator candidates, evaluations, outreach records, briefs, deliverables, metrics, and integration events.
- Provides the Growth Team workspace: review boards, creator pipeline, dashboards, and record layouts.
- Sends webhooks to the backend when records change.
- Runs simple CRM-native automations where appropriate.
- Runs locally during development, then moves to a VPS or private server for team use.

### External Backend

- Receives Telegram webhook updates.
- Maintains Telegram multi-step intake state.
- Normalizes platform links.
- Creates and updates records in Twenty.
- Starts Apify enrichment jobs and normalizes actor output.
- Calls AI provider for outreach drafts (optional).
- Runs follow-up reminder jobs for overdue `nextFollowUpAt` on outreach records.
- Runs scheduled reminders and reports.
- Enforces webhook validation, idempotency, and provider rate limits.

### Telegram Bot

- Fast mobile gateway only.
- Supports creator link intake, campaign selection, short reason capture, confirmation, assignment reminders, and simple status updates.
- Does not replace the Twenty workspace.

### Apify

- Enrichment source only.
- Does not become the primary database.
- Failures are logged and do not block creator review.

## MVP Data Flow

1. Team member sends creator link to Telegram bot.
2. Backend receives update and extracts normalized platform/profile URL.
3. Backend asks for campaign and reason if missing.
4. Backend creates or reuses `Creator` in Twenty.
5. Backend creates `CampaignCreatorCandidate` in Twenty.
6. Backend queues Apify enrichment.
7. Backend queues AI tagging and summary.
8. Team reviews candidate in Twenty.
9. Growth Lead approves, rejects, or requests more info.
10. Approved creators enter outreach tracking.
11. Reminder job notifies owners of overdue follow-ups.
12. Weekly report job summarizes campaign progress.

## Failure Rules

- Telegram intake should still create a candidate if Apify or AI fails.
- Duplicate Telegram updates should not create duplicate candidates.
- Apify failures should create/update `IntegrationEvent` with status `Failed`.
- AI output is advisory and editable.
- Provider secrets stay in backend environment variables, not in Twenty record fields.

## Initial Deployment Shape

- Twenty: self-hosted Twenty instance, first local, then VPS/private server.
- Backend: one deployable FastAPI service, preferably on the same VPS/network as Twenty for MVP.
- Database/Redis: Twenty's own self-host stack manages its required services.
- Scheduler: start with backend cron-compatible endpoint or platform scheduler.
- Queue: start in-process for local development; move to Redis/RQ/Celery when jobs need reliability.

## Self-Hosted Development Path

1. Generate an official app scaffold with `npx create-twenty-app@latest`.
2. Migrate UGC definitions from the draft `twenty-app/` folder into the official scaffold.
3. Add stable `universalIdentifier` values for every object, field, relation, and view.
4. Replace loose relation placeholders with official bidirectional relation fields.
5. Run a local Twenty development server.
6. Sync the official app into that local workspace.
7. Generate a Twenty API key from the local workspace.
8. Set backend `TWENTY_API_URL` to the local Twenty API URL.
9. Validate backend can create/read creator and candidate records.
10. Move the same setup to a VPS when the local workflow is proven.
