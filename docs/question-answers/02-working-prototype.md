# 2. Small Working Prototype

The prototype is a production-deployed UGC Creator Ops workspace built on self-hosted Twenty CRM with a FastAPI backend. It helps the growth team manage creators from sourcing to content delivery.

## What The Prototype Does

The prototype supports this workflow:

1. A growth teammate finds a creator while scrolling.
2. They submit the creator through Telegram or the UGC Ops page in Twenty.
3. The system asks for product, campaign, and reason.
4. The backend normalizes the profile link and checks for duplicate creator rows.
5. A campaign-specific Creator pipeline row is created in Twenty.
6. The creator appears on the **Creator Review** kanban.
7. Instagram enrichment runs through Apify when credit is available.
8. Gemini can suggest niche, tags, and fit ratings when quota is available.
9. The growth lead reviews the creator and moves the card to the next status.
10. Approved creators appear in **Creator Operations**.
11. The assigned member contacts the creator and logs contact status.
12. The system schedules a follow-up when there is no reply.
13. Conversations and Gmail drafts can be tracked through **Conversations** and **Email Drafts**.
14. Submitted assets move through **Content Review** until approved or ready for ad testing.

## Prototype Surfaces

The workspace has these main views:

- **UGC Ops**: browser form for submitting creators.
- **Creator Review**: kanban for proposed, under review, approved, rejected, duplicate, and needs more info.
- **Creator Operations**: kanban for outreach and deal progress.
- **Follow-up Calendar**: calendar view based on `nextFollowUpAt`.
- **Content Review**: kanban for content submitted, revision, approval, and ad-test readiness.
- **Creator Database**: all creator rows across campaigns.
- **Campaigns**: campaign goals, budget, product, and brief fields.
- **Conversations**: synced or manually logged message threads.
- **Email Drafts**: AI-assisted draft emails for human review and manual send.

## Backend Capabilities

The FastAPI backend provides:

- `GET /health` for deployment health.
- `GET /intake/options` for active products and campaigns.
- `POST /intake/creator` for Twenty UI intake.
- `POST /webhooks/telegram` for mobile creator submission.
- `POST /webhooks/twenty` for CRM-triggered automation.
- `POST /jobs/enrich-creator` for Apify enrichment.
- `POST /jobs/summarize-creator` for Gemini tagging and fit ratings.
- `POST /jobs/send-reminders` for overdue follow-up reminders.
- `POST /conversations/messages` for manual message ingestion.
- `POST /conversations/drafts/generate` for AI email drafts.
- `POST /jobs/sync-gmail` for Gmail inbox/sent sync.
- Google OAuth routes for Gmail connection.

## Important Production Limitations

The prototype is production-level but intentionally constrained for the first version:

- TikTok scraping is not fully implemented yet due to time constraints. The automated enrichment pipeline currently works for Instagram UGC creators only.
- Apify scraping is limited by the remaining free balance, about $4, so fewer than 100 creators should be expected before adding more credit.
- Some Gemini-backed AI features are disabled or selective due to quota limits, including Twenty built-in AI query and the AI status-management engine.
- Gmail drafts are draft-only. The tool does not auto-send emails.
- Instagram and TikTok DMs are manual-log workflows in this version, not automatic inbox sync.

## Assumptions

I assumed:

- The team already uses or can access a deployed Twenty workspace.
- Growth team members are comfortable submitting creator links through Telegram or the UGC Ops browser form.
- Campaigns and products are created before creator intake.
- Instagram is the first supported enrichment platform.
- AI is advisory only and should not approve creators, reject creators, or send messages.
- The system should optimize for low mental load rather than full automation.
- One creator row represents a creator in the context of one campaign.
- The first version should prioritize a complete workflow over broad platform coverage.

## What I Would Improve Next

Given more time, I would improve:

- **TikTok enrichment**: finish TikTok scraper integration and normalize TikTok metrics into the same fields as Instagram.
- **Provider budgeting**: show Apify credit and Gemini quota state inside the admin view so the team knows when automation may skip.
- **AI status engine controls**: add a clear on/off switch and audit view for AI-applied pipeline changes.
- **Better duplicate handling**: show possible cross-campaign duplicates and past creator history.
- **Gmail error handling**: surface invalid recipient and OAuth issues as clear user-facing errors.
- **DM capture**: add easier manual logging from Telegram for Instagram/TikTok conversation snippets.
- **Reporting dashboard**: summarize funnel counts, blockers, follow-ups, approved content, and campaign budget use.
- **Persistent Telegram state**: move intake state from in-memory storage to Redis for safer production restarts.
- **Permission hardening**: add stricter production access control around intake APIs and admin job endpoints.
- **Creator performance learning**: connect final campaign performance back to creator tags, niches, and content style.
