# UGC Campaign Ops — Project Context

This document captures my understanding of the UGC Ops project after reading `PRD.md`, `milestone.md`, `docs/`, and `twenty-app-official/`. It is meant as a working orientation for engineers and agents, not a replacement for the PRD or specs.

---

## What This Product Is

**UGC Campaign Ops** is an internal operations tool for EveryLab’s Growth Team. It is **not** a creator marketplace, scraper, or generic CRM.

The core problem: growth teams discover creators across TikTok, Instagram, YouTube Shorts, X, DMs, chats, and spreadsheets. Good leads get lost, evaluation is inconsistent, and the Growth Lead lacks visibility.

The product turns scattered discoveries into a **structured, collaborative campaign workflow** — from “found while scrolling” to outreach, content review, and reporting.

Positioning from the PRD:

> A collaborative UGC campaign operating system for startup growth teams.

---

## Who Uses It

| Role | Primary needs |
|------|----------------|
| **Growth Lead** | Campaign status, approve/reject creators, blockers, metrics, compare quality |
| **Growth Team Member** | Fast capture, propose with context, see feedback, own outreach/follow-ups |
| **Reviewer / Founder** | Campaign health summary, risks, comment on selected creators |

---

## End-to-End Workflow (Target State)

1. Team member finds a creator on mobile and shares a link (via **Telegram bot**).
2. System creates a **campaign creator candidate** with reason and optional AI tags/summary.
3. Team reviews via scorecards, comments, and votes in the **Twenty workspace**.
4. Growth Lead approves, rejects, or requests more info.
5. Approved creators enter **outreach** with owner, follow-up dates, and pipeline status.
6. Content is tracked through **briefs** and **deliverables** to “ready for ad test.”
7. **Campaign dashboard** and AI-assisted weekly reports show goal vs actual and blockers.

Success is measured by speed of intake (&lt;30s), fewer stale creators, faster decisions, and less manual reporting.

---

## Architecture (How the Pieces Fit)

```
Telegram Bot  →  FastAPI Backend  →  Self-Hosted Twenty (system of record)
                      ↓
              Apify (enrichment), AI (tags/summaries/drafts/reports)
```

### Division of responsibility

| Layer | Owns |
|-------|------|
| **Self-hosted Twenty** | Campaigns, creators, candidates, evaluations, outreach, briefs, deliverables, metrics, messaging objects, workspace UI (views, kanban, dashboards) |
| **External backend** (`backend/`) | Telegram conversation state, URL normalization, Twenty API writes, Apify jobs, AI calls, reminders, reporting jobs, webhook validation, secrets |
| **Telegram** | Mobile gateway only: link intake, campaign/reason capture, confirmations, simple status updates — **not** the full workspace |
| **Apify** | Best-effort enrichment; failures must not block candidate creation |

### Failure rules (important for implementation)

- Telegram intake must still create a candidate if Apify or AI fails.
- Duplicate Telegram updates must not create duplicate candidates.
- AI output is advisory and editable.
- Provider secrets live in backend env vars, not Twenty record fields.

Local Twenty runs at `http://localhost:2020` (Docker `twenty-app-dev`). Production target is VPS with HTTPS for webhooks.

---

## Data Model (Compact MVP)

Sixteen custom objects are defined in `twenty-app-official/` and documented in `docs/data-model.md`. Fields are intentionally compact — only what supports the three sidebar workflows plus basic reporting.

### Core entities

| Object | Purpose |
|--------|---------|
| `Campaign` | Container for goals, creators, outreach, content, metrics |
| `Creator` | Canonical creator profile across campaigns |
| `CampaignCreatorCandidate` | Internal recommendation when a teammate proposes a creator for a campaign (renamed from `CreatorProposal`) |
| `CreatorEvaluation` | Scorecard + vote per reviewer |
| `OutreachRecord` | Contact/deal/follow-up tracking |
| `Brief` / `Deliverable` | Creative instructions and submitted content |
| `CampaignMetric` / `CreatorPerformanceMetric` | Goal vs actual and creator-level performance |
| `MessageThread` / `Message` / `MessageDraft` | Conversation history and human-reviewed drafts |
| `ContactWorkflow` / `ContactWorkflowStep` / `ScheduledContactTask` | Timed outreach sequences |
| `IntegrationEvent` | Observable log for Telegram, Apify, AI, Twenty webhooks |

### Status lifecycles

**Candidate** (`CampaignCreatorCandidate.status`): Proposed → Under Review → Approved to Contact → Rejected / Duplicate / Needs More Info

**Pipeline** (`OutreachRecord.pipelineStatus`): Approved to Contact → Contacted → Replied → Needs Follow-Up → Deal Confirmed → Brief Sent → Content Submitted → Needs Revision → Approved → Ready for Ad Test → Paid → Closed

**Messaging MVP**: Draft → Approved → Sent Manually (no auto-send for Instagram/TikTok DMs in v1).

Relations are **bidirectional** with stable `universalIdentifier` UUIDs on every object, field, relation, view, and navigation item.

---

## Twenty App (`twenty-app-official/`)

Built on official **`create-twenty-app@2.8.0`** scaffold (`twenty-sdk` / `twenty-client-sdk` 2.8.0).

### Structure

```
twenty-app-official/
├── src/
│   ├── application-config.ts      # App identity
│   ├── default-role.ts            # Permissions
│   ├── constants/
│   │   ├── universal-identifiers.ts   # Scaffold IDs
│   │   ├── ugc-universal-identifiers.ts  # All UGC object/field/view IDs
│   │   └── ugc-options.ts         # SELECT options (status, priority, etc.)
│   ├── objects/                   # 16 defineObject() files
│   ├── views/                     # defineView() — table + kanban
│   ├── navigation-menu-items/     # Sidebar entries (required for views)
│   ├── front-components/          # Main page (scaffold default)
│   └── __tests__/                 # Schema integration tests
└── scripts/seed-sample-data.mjs
```

### Objects (16)

`campaign`, `creator`, `campaignCreatorCandidate`, `creatorEvaluation`, `outreachRecord`, `brief`, `deliverable`, `campaignMetric`, `creatorPerformanceMetric`, `messageThread`, `message`, `messageDraft`, `contactWorkflow`, `contactWorkflowStep`, `scheduledContactTask`, `integrationEvent`

### Views shipped (sidebar)

| View | Type | Primary object | Status |
|------|------|----------------|--------|
| **Creator Database** | TABLE (33 columns) | `Creator` | Done (M5) — identity, engagement, review + pipeline status |
| **Creator Review** | KANBAN (6 review columns) | `CampaignCreatorCandidate` | Done (M6) — social metrics + IG/TikTok links on cards |
| **Creator Operations** | KANBAN (12 pipeline columns) | `OutreachRecord` | Done (M6b) — card title = creator handle; member, brief/contract/submitted links |
| **Contact Workflows** | TBD | Multiple | Not started (M7) |

Each view has a matching `navigation-menu-item` so it appears in the Twenty sidebar.

### Dev workflow

```bash
cd twenty-app-official
yarn twenty dev              # watch sync
yarn twenty dev --once       # one-shot sync (used for M2 verification)
yarn test                    # vitest
```

App sync has succeeded locally against self-hosted Twenty on port 2020.

### Legacy draft

`twenty-app/` is the earlier manual scaffold; **`twenty-app-official/` is the source of truth** for synced UGC definitions.

---

## Backend (`backend/`)

FastAPI service (`ugc_ops_backend` 0.1.0) with scaffolded integrations.

### Endpoints

| Route | Purpose |
|-------|---------|
| `GET /health` | Service status + which integrations are configured |
| `POST /webhooks/telegram` | Creator link intake → create records in Twenty |
| `POST /webhooks/twenty` | Receive CRM change events (signature validation stub) |
| `POST /jobs/enrich-creator` | Apify enrichment job |
| `POST /jobs/generate-weekly-report` | AI weekly summary |
| `POST /jobs/send-reminders` | Overdue follow-up notifications via Telegram |

### Services

- `TwentyClient` — REST create/update against Twenty API (placeholder IDs when no API key)
- `TelegramBot` — send messages
- `normalizers` — platform URL detection and normalization
- `ApifyClient`, `AIService` — enrichment and AI (require env keys)
- Jobs in `app/jobs/` for enrichment, reminders, reporting

### Configuration (`.env`)

`TWENTY_API_URL`, `TWENTY_API_KEY`, `TELEGRAM_BOT_TOKEN`, `APIFY_*`, `OPENAI_API_KEY`, webhook secrets, allowed Telegram user IDs.

### Known gap

The Telegram webhook still references legacy REST object names (`creatorProposals`, `decisionStatus`) while Twenty defines `campaignCreatorCandidates` with `status`. **Backend ↔ Twenty API alignment is an active next step** (listed in milestone sprint).

---

## Documentation Map (`docs/`)

| File | Contents |
|------|----------|
| `architecture.md` | System boundaries, data flow, failure rules, deployment shape |
| `data-model.md` | Full object/field/relation spec and status enums |
| `workflows.md` | Acceptance criteria for Telegram intake, review, outreach, content, reporting |
| `view-and-messaging-mini-plans.md` | Build plans M5–M8: views, contact workflows, messaging engine |
| `self-hosted-twenty.md` | Local + VPS setup, env vars, operational requirements |
| `twenty-developer-guide.md` | Twenty SDK patterns, APIs, webhooks, concrete repo next steps |

`milestone.md` is the execution tracker (M0–M15).

---

## Milestone Progress (as of 2026-05-29)

| Done | Milestone |
|------|-----------|
| M0 | Foundation — docs, backend scaffold, planning |
| M1 | Official Twenty app scaffold |
| M2 | 16 objects synced (`yarn twenty dev --once`) |
| M3 | Self-hosted Twenty local (`localhost:2020`) |
| M4 | Backend core — health, routes, pytest |
| M5 | Creator Database table view |
| M6 | Creator Status Kanban view |

| Next | Milestone |
|------|-----------|
| M7 | Contact Workflows view (workflows, scheduled tasks, draft queues) |
| M8 | Messaging engine (draft generation, manual send tracking) |
| M9 | Telegram intake end-to-end |
| M10 | Apify enrichment |
| M12 | Outreach handoff, follow-up calendar, 3-day no-reply rule, reminders |
| M13 | Briefs/deliverables |
| M15 | Pilot launch |

### Current blockers

- Twenty API key not configured in backend
- Telegram bot token not configured
- Apify actor IDs not selected per platform
- Instagram/TikTok auto-send deferred; MVP is draft + manual send

### Key product decisions

- Self-hosted Twenty for MVP (avoid paid cloud)
- Official `create-twenty-app` scaffold as implementation base
- `CampaignCreatorCandidate` naming (not “proposal from creator”)
- External backend for messy provider logic
- Three first-class sidebar workflows: Creator Database, Creator Status Kanban, Contact Workflows
- Compact fields only; Apify enrichment is best-effort

---

## MVP Scope vs Later

**In MVP (PRD §13):** Campaign creation, creator proposal/candidate flow, Telegram submission, review board, voting/commenting, status pipeline, owner assignment, follow-up dates, basic AI tagging/summary, campaign goals, basic weekly report.

**Explicitly out of scope for v1:** Marketplace features, scraping platform, auto DM send on Instagram/TikTok, full ads manager, generic PM/CRM.

**Later:** Browser extension, deeper enrichment, ads import, payments/contracts, cross-campaign learning.

---

## Repo Layout

```
UGC_ops/
├── PRD.md                 # Product requirements
├── milestone.md           # Execution tracker
├── CONTEXT.md             # This file
├── docs/                  # Architecture, data model, workflows, guides
├── backend/               # FastAPI integration service
├── twenty-app/            # Legacy draft scaffold (superseded)
└── twenty-app-official/   # Active Twenty app (objects, views, sync)
```

---

## Mental Model for New Work

When implementing a feature, ask:

1. **Does it belong in Twenty or the backend?** UI, records, views, and simple CRM automations → Twenty app. Telegram state, external APIs, retries, secrets → backend.
2. **Which object does it touch?** Most user-facing work flows through `CampaignCreatorCandidate` (review) and `OutreachRecord` (operations after approval).
3. **Does it support one of the three sidebar views?** If not, prefer notes/AI summary over new structured fields until proven needed.
4. **Can intake succeed without Apify/AI?** Yes — always.

The near-term critical path is: **Contact Workflows views (M7) → Messaging (M8) → wire backend to Twenty API with correct object names (M9+) → Telegram bot in production with HTTPS webhook.**
