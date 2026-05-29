# UGC Campaign Ops — Agent Context (Confirmation Draft)

This document summarizes my understanding of the project after reading `PRD.md`, `milestone.md`, `CONTEXT.md`, all of `docs/`, `twenty-app-official/AGENTS.md`, and the `backend/` + `twenty-app-official/` codebases. It is written for you to confirm or correct before implementation work begins.

**Not a replacement for:** `PRD.md`, `docs/data-model.md`, or `milestone.md`.

---

## 1. Product in one sentence

An internal **UGC campaign operating system** for EveryLab’s Growth Team: turn scattered creator discoveries (TikTok, IG, DMs, chats) into a structured, collaborative workflow from mobile capture → team review → outreach → content → reporting.

**Not:** a creator marketplace, scraping platform, generic CRM, or auto-DM tool for Instagram/TikTok in v1.

---

## 2. Users and what they need

| Role | Needs |
|------|--------|
| **Growth Lead** | Campaign status, approve/reject creators, blockers, metrics, compare quality |
| **Growth Team Member** | Fast capture (&lt;30s), propose with context, feedback, own outreach/follow-ups |
| **Reviewer / Founder** | Campaign health summary, risks, comment on selected creators |

---

## 3. Target end-to-end flow

1. Team member finds a creator on mobile → shares link via **Telegram bot**.
2. Backend creates **`Creator`** (reuse if duplicate) + **`CampaignCreatorCandidate`** in Twenty.
3. Optional **Apify** enrichment and **AI** tags/summary run asynchronously (must not block intake).
4. Team reviews in Twenty (**Creator Review** kanban): scorecards, comments, votes.
5. Growth Lead approves → handoff creates/links **`OutreachRecord`** → **Creator Operations** kanban.
6. **Contact workflows** schedule outreach; **messaging engine** generates drafts; humans send manually.
7. Content via **Brief** / **Deliverable**; **CampaignMetric** for goal vs actual (no `weeklySummary` field on Campaign — removed from Twenty).

---

## 4. Architecture — who owns what

```
Telegram Bot  →  FastAPI Backend (`backend/`)  →  Self-Hosted Twenty (system of record)
                      ↓
              Apify, OpenAI, scheduled jobs, webhooks
```

| Layer | Responsibility |
|-------|----------------|
| **Self-hosted Twenty** | All CRM records, relations, workspace UI (table + kanbans + future workflow/draft views), simple native automations, outbound webhooks on record changes |
| **External backend** | Telegram multi-step state, URL normalization, Twenty API read/write, Apify jobs, AI calls, reminders, webhook validation, secrets, idempotency, `IntegrationEvent` logging |
| **Telegram** | Mobile gateway only: link intake, campaign/reason capture, confirmations, reminders — **not** the full workspace |
| **Apify** | Best-effort enrichment; failures logged, never block candidate creation |

### Failure rules (non-negotiable for implementation)

- Telegram intake **must** create a candidate even if Apify or AI fails.
- Duplicate Telegram updates **must not** create duplicate candidates.
- AI output is **advisory** and editable in Twenty.
- Provider secrets live in **backend env vars**, not Twenty record fields.
- Instagram/TikTok **auto-send is out of scope** for v1; MVP is draft + manual send + status tracking.

### Deployment shape

- Twenty: local `http://localhost:2020` (Docker `twenty-app-dev`) → VPS with HTTPS for production webhooks.
- Backend: single FastAPI service, ideally same network as Twenty for MVP.
- Scheduler: cron hitting backend job endpoints; queue can stay in-process locally, Redis/Celery later.

---

## 5. Repo layout

```
UGC_ops/
├── PRD.md                    # Product requirements
├── milestone.md              # M0–M15 execution tracker
├── CONTEXT.md                # Prior orientation doc
├── CONTEXT2.md               # This confirmation draft
├── docs/                     # architecture, data-model, workflows, guides, mini-plans
├── backend/                  # FastAPI integration service (active integration work)
├── twenty-app/               # Legacy manual scaffold (superseded)
└── twenty-app-official/      # Official create-twenty-app scaffold — SOURCE OF TRUTH
```

---

## 6. Twenty app (`twenty-app-official/`)

- Built on **`create-twenty-app@2.8.0`** (`twenty-sdk` 2.8.0).
- Every object, field, relation, view, and nav item has a stable **`universalIdentifier`** (UUID v4) in `src/constants/ugc-universal-identifiers.ts`.
- Relations are **bidirectional** with `MANY_TO_ONE` + `ONE_TO_MANY` and `joinColumnName`.
- Dev: `yarn twenty dev` / `yarn twenty dev --once`; tests: `yarn test`.
- New entities should use `yarn twenty dev:add` per `AGENTS.md`.

### 16 custom objects

`campaign`, `creator`, `campaignCreatorCandidate`, `creatorEvaluation`, `outreachRecord`, `brief`, `deliverable`, `campaignMetric`, `creatorPerformanceMetric`, `messageThread`, `message`, `messageDraft`, `contactWorkflow`, `contactWorkflowStep`, `scheduledContactTask`, `integrationEvent`

### Naming decision

`CampaignCreatorCandidate` replaces `CreatorProposal` — it is an **internal team recommendation**, not a proposal submitted by the creator.

### Sidebar views (shipped)

| View | Type | Primary object | Milestone |
|------|------|----------------|-----------|
| **Creator Database** | TABLE | `Creator` | M5 — identity, engagement, denormalized review + pipeline fields |
| **Creator Review** | KANBAN (6 columns) | `CampaignCreatorCandidate` | M6 — grouped by `status` |
| **Creator Operations** | KANBAN + Calendar | `OutreachRecord` | M6b pipeline kanban; M12 follow-up calendar on `nextFollowUpAt` (3-day no-reply rule) |
| **Campaigns** | TABLE | `Campaign` | M13 — campaign row with brief fields, `productRef`, guidelines |
| **Content Review** | KANBAN (5 columns) | `Deliverable` | M13 — grouped by `reviewStatus`; syncs to outreach via logic function |

### Sidebar views (not shipped)

| View | Milestone | Purpose |
|------|-----------|---------|
| **Contact Workflows** | M7 | Workflow table, scheduled task queue, draft queue |

### Status lifecycles

**Candidate** (`CampaignCreatorCandidate.status`):  
Proposed → Under Review → Approved to Contact → Rejected / Duplicate / Needs More Info

**Pipeline** (`OutreachRecord.pipelineStatus`):  
Approved to Contact → Contacted → Replied → Needs Follow-Up → Deal Confirmed → Brief Sent → Content Submitted → Needs Revision → Approved → Ready for Ad Test → Paid → Closed

**Messaging MVP** (`MessageDraft.status`):  
Draft → Approved → Sent Manually (no auto-send for IG/TikTok DMs in v1)

### M12 handoff rule (approve → operations)

When a candidate moves to **Approved to Contact** on Creator Review:

1. Create `OutreachRecord` linked to `creator`, `campaign`, and `candidate`.
2. Set `pipelineStatus = APPROVED_TO_CONTACT`, `creatorHandle` from `creator.handle`, and `member` (assigned teammate).
3. Card appears on Creator Operations kanban (title shows the handle, e.g. `@sofiawellness`).
4. Denormalize onto `Creator`: `reviewStatus`, `pipelineStatus`, `outreachOwner`, follow-up dates.

Until automation exists: manual in Twenty or seed script for local testing.

### M13 content review (deliverable → operations)

1. Edit campaign brief copy in **Campaigns** (brief fields on the campaign row).
2. Create a **Deliverable** when content is submitted; set `submissionLink` and `reviewStatus`.
3. Review on **Content Review** kanban; card title = `creatorHandle`.
4. `sync-deliverable-review` updates matching `OutreachRecord.pipelineStatus`, `outreach.submitted`, and `Creator.contentReviewStatus`.

Ops kanban `brief` / `submitted` LINKS fields remain quick URLs; deliverable records hold revision notes and approved assets.

---

## 7. Backend (`backend/`)

FastAPI app `ugc_ops_backend` 0.1.0 with scaffolded services and jobs.

### Routes

| Route | Purpose | Implementation status |
|-------|---------|----------------------|
| `GET /health` | Service + integration config flags | Working |
| `POST /webhooks/telegram` | Creator link intake | **Partial** — see gaps below |
| `POST /webhooks/twenty` | CRM change events | **Stub** — receives payload, no business logic |
| `POST /jobs/enrich-creator` | Apify → update Creator | **Scaffold** — updates creator fields, no IntegrationEvent |
| `POST /jobs/send-reminders` | Overdue follow-ups via Telegram | **Stub** — returns skipped |

**Removed from scope:** `POST /jobs/generate-weekly-report` — Campaign no longer has `weeklySummary` in Twenty; reporting route/job should be dropped or redesigned later (e.g. write to `Campaign.notes` or a separate object).

### Services (what each one does)

These are Python modules under `backend/app/services/`. Routes and jobs call them; they do not run on their own.

#### `TwentyClient` (`twenty_client.py`)

The **CRM adapter**. Talks to your self-hosted Twenty REST API.

- **Input:** object plural name (`creators`, `campaignCreatorCandidates`, …) + field payload.
- **Output:** created/updated record JSON (or a fake placeholder if `TWENTY_API_KEY` is missing).
- **Today:** only `create_record` and `update_record`. No search, no “find by normalized link”, no delete.
- **Step 1 work:** add `find_creator_by_normalized_profile_link`, fix object/field names, verify relation fields (`creatorId`, `campaignId`) against your live API.

#### `TelegramBot` (`telegram_bot.py`)

The **outbound Telegram messenger**. Sends text back to the user’s chat.

- **Input:** `chat_id` + message text.
- **Output:** Telegram API response (or a local stub if no bot token).
- **Today:** only `send_message`. No inline keyboards, no “pick campaign from list” UI yet.
- **Step 2 work:** use this for multi-step prompts (“Which campaign?”, “Why this creator?”).

#### `normalizers` (`normalizers.py`)

**Pure URL logic** — no network, no database.

- **`detect_platform(url)`** → TikTok / Instagram / YouTube / X / Unknown from hostname.
- **`normalize_creator_url(url)`** → strips tracking params, canonical HTTPS URL, extracts handle when possible.
- **Why it matters:** dedupe and Apify both key off `normalizedProfileLink` (confirmed: match **only** on that field, not handle).

#### `ApifyClient` (`apify_client.py`)

The **enrichment fetcher**. Calls Apify actors to scrape public profile stats.

- **Input:** platform + profile URL + per-platform actor ID from env.
- **Output:** `EnrichmentResult` (handle, follower count, avg views, sample post links, raw JSON).
- **If not configured:** returns `skipped` without failing intake.
- **Step 3 work:** run after candidate is created; PATCH `creators` (+ optional candidate snapshot fields); log `IntegrationEvent` on failure.

#### `AIService` (`ai_service.py`)

The **LLM helper** for advisory text (not decisions).

- **Today:** `summarize_creator()` only — placeholder when no OpenAI key; real provider call is TODO.
- **Future use:** outreach draft text, optional intake tags (M11). Not used for weekly campaign reports anymore.
- **Rule:** AI never auto-approves creators or auto-sends DMs.

#### Jobs (`backend/app/jobs/`)

Thin orchestrators that combine services:

| Job | Uses | Purpose |
|-----|------|---------|
| `enrichment.py` | Apify + Twenty | Pull stats → update Creator |
| `reminders.py` | Twenty (query TBD) + Telegram | Notify owners of overdue `nextFollowUpAt` |
| ~~`reporting.py`~~ | ~~AIService + Campaign.weeklySummary~~ | **Out of scope** until reporting design is chosen |

### Config (`.env`)

`TWENTY_API_URL`, `TWENTY_API_KEY`, `TELEGRAM_BOT_TOKEN`, `APIFY_*`, `OPENAI_API_KEY`, webhook secrets, `TELEGRAM_ALLOWED_USER_IDS`.

### Known backend ↔ Twenty misalignment (must fix before M9)

The Telegram webhook in `backend/app/main.py` still uses **legacy names**:

| Current (wrong) | Should be (Twenty app) |
|-----------------|------------------------|
| REST object `creatorProposals` | `campaignCreatorCandidates` |
| Field `decisionStatus` | `status` |
| Field `creatorId` on flat payload | Relation via `creatorId` join column (verify REST shape against live API) |
| Field `currentStatus` on creator | Align to actual Creator fields (`reviewStatus` / denormalized fields per data model) |
| No `campaign` on candidate | Required for real intake |
| No multi-step bot state | PRD requires campaign + reason prompts |
| No idempotency | Required by architecture |
| No `IntegrationEvent` records | Required for observability |
| No post-create enrichment/AI queue | Spec’d in architecture flow |

`TwentyClient` is minimal: only `create_record` and `update_record` — no `find_by_normalized_link`, no GraphQL, no relation-aware upsert.

---

## 8. Three integration workstreams (your stated focus)

### A. Telegram bot → Twenty

**Spec** (`docs/workflows.md`):

1. Validate update + authorized user.
2. Normalize URL, detect platform.
3. Ask for campaign if missing.
4. Ask for reason if missing.
5. Dedupe: existing creator by **`normalizedProfileLink` only** (confirmed).
6. Create/reuse `Creator`, create `CampaignCreatorCandidate`.
7. Queue enrichment + AI summary.
8. Confirm with Twenty link.

**Gap:** Current handler is single-message, no conversation state (`TelegramIntakeState` exists in `models.py` but is unused), no campaign selection, wrong object names.

### B. Apify enrichment → Twenty

**Spec:**

- Triggered after intake (or via `POST /jobs/enrich-creator`).
- Updates `Creator` metrics: handle, follower count, views, engagement, etc.
- On failure: log `IntegrationEvent` with status Failed; do not block review.

**Gap:** Actor IDs not chosen; not chained from Telegram; no IntegrationEvent; field mapping may need alignment with `creator.object.ts`.

### C. Messaging engine → Twenty

**Spec** (`docs/view-and-messaging-mini-plans.md` Mini-Plan 5–6):

- `ContactWorkflow` + steps → `ScheduledContactTask` → `MessageDraft` at scheduled time.
- Channels: email, Instagram DM, TikTok DM — all **manual send** in v1.
- Draft linked to creator, campaign, outreach (and optionally candidate).
- Mark draft **Sent Manually** → update `OutreachRecord.lastContactedAt`, `pipelineStatus`.
- Log replies/content → update pipeline / `Deliverable`.
- Backend generates drafts from campaign + creator + outreach + brief context.
- Twenty webhooks drive handoffs (approve candidate, status changes).

**Gap:** M7 views not built; no draft-generation job; Twenty webhook is a stub; no scheduler for scheduled tasks.

---

## 9. Milestone status (my read of `milestone.md`)

### Done (M0–M6b)

Foundation, official Twenty scaffold, 16-object sync, self-hosted Twenty local, backend skeleton + health, Creator Database table, Creator Review kanban, Creator Operations kanban.

### Next (your critical path)

| ID | Milestone | Depends on |
|----|-----------|------------|
| **M7** | Contact Workflows views | Twenty views + nav items |
| **M8** | Messaging engine | M7 data model in use + backend draft jobs + Twenty API |
| **M9** | Telegram intake E2E | Backend ↔ Twenty alignment + bot token + public webhook URL |
| **M10** | Apify enrichment | Actor IDs + M9 create flow |
| **M12** | Outreach handoff, 3-day no-reply follow-up, calendar, reminders | Logic functions + Follow-up Calendar view |
| **M13** | Campaigns table, Product model, Content Review kanban, deliverable → outreach sync | `sync-deliverable-review` logic function |
| **M15** | Pilot | End-to-end campaign validation |

### Active blockers (from milestone)

- `TWENTY_API_KEY` not configured in backend
- `TELEGRAM_BOT_TOKEN` not configured
- Apify actor IDs not selected per platform
- IG/TikTok auto-send deferred by design

---

## 10. Data model mental model

Most implementation touches:

- **`CampaignCreatorCandidate`** — review workflow (Creator Review kanban).
- **`OutreachRecord`** — operations after approval (Creator Operations kanban).
- **`Creator`** — canonical profile; denormalized fields for Creator Database table.
- **Messaging objects** — threads, drafts, workflows, scheduled tasks, integration events.

Compact field principle: only add structured fields that support the four sidebar workflows or basic reporting; otherwise use notes.

---

## 11. Decision checklist before coding a feature

1. **Twenty or backend?** UI/records/views → Twenty app. Telegram state, external APIs, retries, secrets → backend.
2. **Which object?** Review → candidate. Operations → outreach. Messaging → draft/thread/workflow.
3. **Does it support a sidebar view?** If not, prefer notes over new fields.
4. **Can intake succeed without Apify/AI?** Always yes.

---

## 12. Implementation order (agreed — one step at a time)

We implement **one milestone slice at a time**. After each step: demo, you confirm, then we open the next step. No big-bang PR.

| Step | Scope | Exit criteria |
|------|--------|----------------|
| **1** | Align `TwentyClient` + live API smoke test | Create/find `Creator` by `normalizedProfileLink`; create `CampaignCreatorCandidate` with `creatorId` + `campaignId` using your API key |
| **2** | Telegram intake (M9) | Multi-step bot: link → campaign → reason → Twenty records + confirmation |
| **3** | Apify post-intake (M10) | Enrichment job after create; failures logged; intake still succeeds |
| **4** | Approve handoff (M12) | See §12a — automation when candidate → Approved to Contact |
| **5** | Contact Workflows views (M7) | Twenty sidebar views for workflows / tasks / drafts |
| **6** | Messaging engine (M8) | Draft generation + manual-send status sync |

**Current step:** **1 only** — do not start Step 2 until Step 1 is verified with you.

### 12a. Approve handoff (plain-language explanation)

You have **two different kanbans** for two different phases:

| Board | Object | Question it answers |
|-------|--------|-------------------|
| **Creator Review** | `CampaignCreatorCandidate` | “Should we contact this creator for this campaign?” |
| **Creator Operations** | `OutreachRecord` | “We said yes — who owns outreach, what’s the deal status, when is follow-up?” |

A **candidate** is a *recommendation* (“I found this person for Exam Season campaign”).  
An **outreach record** is the *operational tracker* after the team approves (“go contact them”).

**Approve handoff** = the moment someone moves a card to **Approved to Contact** on Creator Review, the system should automatically:

1. Create an `OutreachRecord` (if one doesn’t exist) linked to the same creator + campaign + candidate.
2. Set `pipelineStatus` to **Approved to Contact** so the card appears on **Creator Operations**.
3. Optionally copy handle/owner onto the outreach card and refresh denormalized fields on `Creator`.

Without this handoff, approved creators **only** exist on the review board — ops has no pipeline card to drag through Contacted → Replied → Brief Sent, etc.

**How automation can run (decision deferred to Step 4):**

| Approach | How it works | Pros / cons |
|----------|----------------|-------------|
| **Manual (now)** | Teammate creates OutreachRecord in Twenty after approving | Simple; easy to forget |
| **Twenty webhook → backend** | Twenty notifies backend on status change; backend creates outreach | Flexible; needs webhook URL + handler |
| **Twenty logic function** | Code inside Twenty app reacts on record update | Stays in CRM; SDK learning curve |

We do **not** need to choose the automation mechanism until Step 4. Step 1–3 only create candidates from Telegram.

### 12b. Campaign selection in Telegram (plain-language explanation)

Every **candidate** must belong to a **campaign** (e.g. “Exam Season AI Study App UGC”). Otherwise the review board doesn’t know which campaign the creator is for.

When someone sends only a TikTok link, the bot is missing that campaign. **Campaign selection** = the bot asks (or infers) which campaign before creating the candidate.

Example conversation:

```text
User:  https://tiktok.com/@creator123
Bot:   Which campaign is this for?
       1) Exam Season UGC
       2) Summer Launch
User:  1
Bot:   Why do you recommend them? (one line)
User:  Good student audience, natural facecam
Bot:   Saved — candidate #42 in Twenty [link]
```

**Campaign selection (confirmed):** **A** — always ask; bot lists active campaigns from Twenty by name.

---

## 13. Confirmed decisions

| Topic | Decision |
|-------|----------|
| Implementation pace | One step at a time; confirm after each |
| Order | Agreed §12 table (Steps 1→6) |
| Creator dedupe | **`normalizedProfileLink` only** |
| Twenty API key | **Available** — use real API in Step 1 (not placeholder mode) |
| Weekly report route | **Removed** — no `weeklySummary` on Campaign |
| Approve handoff mechanism | Explain first (§12a); choose at **Step 4** |
| Campaign selection UX | **A** — always list campaigns from Twenty |
| `proposedBy` | **Telegram `@username`** for now |
| Step 1 smoke test | **Approved** — may leave test records in Twenty |

### Step 1 completion (2026-05-29)

- `TwentyClient` uses **GraphQL** (`/graphql`), not legacy REST object names.
- API key resolves from `TWENTY_API_KEY` or `~/.twenty/config.json` (Twenty CLI).
- `normalizedProfileLink` storage format: `tiktok.com/@handle` (no `https://` / `www.`) via `to_storage_normalized_link()`.
- Methods: `find_creator_by_normalized_profile_link`, `find_or_create_creator`, `list_campaigns`, `create_campaign_creator_candidate`, plus outreach helpers for existing webhook/reminder code.
- Smoke script: `backend/scripts/smoke_step1_twenty.py` — passed against local Twenty.
- **Step 2 not started** — Telegram webhook still uses old `create_record` / `creatorProposals` paths.

## 14. Still open (please answer when ready)

1. **Approve handoff (Step 4):** Twenty webhook vs logic function vs manual — decide when we reach Step 4.

---

*Step 1 implemented — awaiting your verification in Twenty UI. Step 2 blocked until you confirm.*
