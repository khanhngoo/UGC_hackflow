# UGC Ops Milestones

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Done
- [!] Blocked

## Milestones

Detailed build notes for M5-M8 live in [docs/view-and-messaging-mini-plans.md](docs/view-and-messaging-mini-plans.md).

| Status | Milestone | Goal | Acceptance Criteria | Notes |
|---|---|---|---|---|
| [x] | M0 Foundation | Repo structure, planning docs, execution tracker | `docs/`, `backend/`, `twenty-app/`, and this tracker exist | Initial scaffold created from `PRD.md` |
| [x] | M1 Official Twenty App Scaffold | Generate official app scaffold and migrate UGC definitions | App has `application-config.ts`, `default-role.ts`, tests, stable universal IDs, and migrated UGC objects | Completed in `twenty-app-official/` |
| [x] | M2 Compact Data Model Sync | Compact CRM objects and bidirectional relations sync into Twenty | Synced objects match `docs/data-model.md`: campaigns, creators, candidates, evaluations, outreach, briefs, deliverables, metrics, messaging, workflows, and integration events | `yarn twenty dev --once --verbose` succeeded |
| [x] | M3 Self-Hosted Twenty | Local/self-hosted Twenty runs and accepts app sync | Twenty app can sync to a local or VPS Twenty instance | Local app-dev server running on `http://localhost:2020` |
| [x] | M4 Backend Core | Integration backend skeleton | Backend can boot, validate config, and expose webhook/job endpoints | FastAPI scaffold added and health endpoint verified |
| [x] | M5 Creator Database View | Full creator database table across all campaigns | Table shows identity, IG/TikTok links, engagement metrics, review + pipeline status, and ops timing fields (no priority/AI summary) | Redesigned `creator-database.view.ts` |
| [x] | M6 Creator Review Kanban | Candidate review board | Six review columns; cards show social metrics, platform links, and fit fields for approve/reject decisions | `creator-review-kanban.view.ts` on `CampaignCreatorCandidate` |
| [x] | M6b Creator Operations Kanban | Accepted-creator pipeline board | Twelve pipeline columns on `OutreachRecord`; card title = creator handle; member, brief/contract/submitted links | `creator-operations-kanban.view.ts` |
| [ ] | M7 Contact Workflows View | Workflow, scheduled task, and draft queues | Accepted/selected creators can be scheduled into contact workflows and draft tasks are visible | Draft/manual send for email, Instagram DM, TikTok DM |
| [ ] | M8 Messaging Engine | Draft generation and message history connected to CRM | Drafts link to creator/campaign/outreach; manual send/reply updates status | No auto-send for Instagram/TikTok in v1 |
| [x] | M9 Telegram Intake | Mobile creator submission | Telegram link submission creates candidate in under 30 seconds | Product-first flow; backend `telegram_intake.py` |
| [x] | M10 Apify Enrichment | Optional creator enrichment | Enrichment updates creator fields or fails gracefully | Post-intake `enrichment_runner`; `IntegrationEvent` logging |
| [x] | M11 Creator Intake AI | Advisory niche, tags, and fit ratings | AI fills `niche`, `tagList`, star ratings on Creator + candidate snapshots; intake succeeds if OpenAI unset | No risk notes or summary text; `POST /jobs/summarize-creator` |
| [x] | M12 Review And Outreach Workflow | Approvals, outreach handoff, follow-up calendar, and reminders | Approved candidate creates outreach record; 3-day no-reply follow-up; calendar view; overdue member notified | Logic functions + `creator-operations-calendar.view.ts` synced |
| [x] | M13 Briefs And Deliverables | Content review workflow | Approved assets are findable and linked to campaign | Campaigns table (brief fields on Campaign), Product model, Content Review kanban, `sync-deliverable-review` logic function |
| [ ] | M15 Pilot Launch | End-to-end validation | One campaign runs from candidate to approved content and draft outreach | Needs self-hosted Twenty and Telegram bot |

## Current Sprint

- Sprint: Foundation and system skeleton
- Goal: turn the PRD into executable project structure and implementation-ready specs
- Active tasks:
  - [x] Create milestone tracker
  - [x] Add architecture and data model docs
  - [x] Scaffold backend integration service
  - [x] Verify backend health endpoint and route table locally
  - [x] Scaffold draft Twenty app object definitions
  - [x] Generate official Twenty app scaffold with `npx create-twenty-app@latest`
  - [x] Rename `CreatorProposal` to `CampaignCreatorCandidate`
  - [x] Add stable `universalIdentifier` values
  - [x] Replace loose relation placeholders with official bidirectional relation fields
  - [x] Add compact messaging/workflow objects from `docs/data-model.md`
  - [x] Convert creator database, review kanban, and operations kanban into Twenty views
  - [ ] Convert contact workflow specs into Twenty views
  - [x] Run self-hosted Twenty locally
  - [x] Sync Twenty app to self-hosted Twenty
  - [ ] Connect backend to self-hosted Twenty API
  - [ ] Create Telegram bot and configure webhook

## Blockers

| Date | Blocker | Owner | Resolution |
|---|---|---|---|
| 2026-05-29 | Twenty API key not configured | Project owner | Generate API key in self-hosted Twenty and set `TWENTY_API_URL` / `TWENTY_API_KEY` |
| 2026-05-29 | Telegram bot token not configured | Project owner | Create bot with BotFather and set `TELEGRAM_BOT_TOKEN` |
| 2026-05-29 | Apify actor IDs not selected per platform | Project owner/engineer | Pick supported actors after platform coverage decision |
| 2026-05-29 | Instagram/TikTok DM sending API access not confirmed | Project owner/engineer | MVP uses draft/manual send; revisit auto-send only after official access is confirmed |

## Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-05-29 | Use self-hosted Twenty for MVP | Avoid paid Twenty Cloud while keeping the same CRM-centered architecture |
| 2026-05-29 | Ground Twenty app implementation in official `create-twenty-app` scaffold | Official scaffold provides required config, role, tests, CLI setup, and app metadata |
| 2026-05-29 | Rename `CreatorProposal` to `CampaignCreatorCandidate` | Avoids confusion that the external creator is applying or submitting a proposal |
| 2026-05-29 | Use external backend for integrations | Telegram conversation state, Apify retries, AI calls, secrets, and idempotency are cleaner outside CRM workflows |
| 2026-05-29 | Keep outreach draft-and-track for MVP | Avoids social DM policy, deliverability, and account-risk complexity |
| 2026-05-29 | Build three first-class sidebar workflows | Creator Database, Creator Review, and Creator Operations are the first workspace views; Contact Workflows follows in M7 |
| 2026-05-29 | Split review and operations into two kanbans | Review uses `CampaignCreatorCandidate.status`; operations uses `OutreachRecord.pipelineStatus` for accepted creators only |
| 2026-05-29 | Remove priority and AI summary fields | Not needed for Growth Team review workflow in v1 |
| 2026-05-29 | Use compact MVP fields | Fields must directly support table, kanban, messaging workflow, or basic reporting |
| 2026-05-29 | Treat Apify enrichment as best-effort | Creator intake must remain fast even when enrichment fails |

## Completed Evidence

| Milestone | Evidence |
|---|---|
| M0 Foundation | `milestone.md`, `docs/architecture.md`, `docs/data-model.md`, `backend/`, and `twenty-app/` created |
| M1 Official Twenty App Scaffold | `twenty-app-official/` generated with official `create-twenty-app@2.8.0` scaffold |
| M2 Compact Data Model Sync | 16 compact UGC objects synced successfully with `yarn twenty dev --once --verbose` |
| M3 Self-Hosted Twenty | Docker container `twenty-app-dev` is running and `http://localhost:2020` returns HTTP 200 |
| M4 Backend Core | `pytest -q` passes and `GET /health` returns local service status |
| M5 Creator Database View | `Creator Database` TABLE view with engagement, review, and operations columns |
| M6 Creator Review Kanban | `Creator Review` KANBAN on candidates grouped by review status (6 columns) |
| M6b Creator Operations Kanban | `Creator Operations` KANBAN on outreach grouped by pipeline status (12 columns) |
| M12 Review And Outreach Workflow | Follow-up Calendar view, logic functions for handoff + 3-day rule, backend reminders job |
| M13 Briefs And Deliverables | Campaigns + Products views, brief fields on Campaign, Content Review kanban, `sync-deliverable-review`, seed product/campaign/deliverable |
