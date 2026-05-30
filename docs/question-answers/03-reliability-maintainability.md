# 3. Reliability, Edge Cases, And Maintainability

If this tool were used by a real team every day, reliability would matter as much as features. The system should keep intake fast even when enrichment or AI fails, make failures visible, avoid duplicate work, and preserve a clean path for future platform support.

## Reliability Principles

The most important reliability principle is graceful degradation. Creator intake should succeed even if Apify, Gemini, Gmail, or Telegram has a temporary issue. A missing scrape result is acceptable; losing a creator lead is not.

The system should:

- Save the creator record first.
- Run enrichment and AI as best-effort background work.
- Log provider failures in Integration Events.
- Make skipped automation visible to admins.
- Keep human workflow usable when automation is off.
- Avoid auto-sending messages or making irreversible AI decisions.

## Edge Cases To Handle

Important edge cases include:

- Same creator submitted twice for the same campaign.
- Same creator submitted for a different campaign.
- Instagram reel links that need to resolve to the real profile username.
- Unsupported platform links.
- TikTok links before TikTok scraping is fully implemented.
- Empty or vague proposal reasons.
- No active products or campaigns during Telegram intake.
- Telegram update retries creating duplicate submissions.
- Backend restart during multi-step Telegram intake.
- Apify credit exhausted.
- Gemini quota exhausted.
- Gmail OAuth token expired or missing.
- Creator has no `contactEmail`, so Gmail sync cannot match threads.
- Gmail rejects a draft recipient.
- A member contacts a creator but forgets to set `replyStatus`.
- AI suggests a backward or unsafe pipeline move.
- A record is moved to a terminal status but later receives a reply.

## Intake Reliability

Creator intake should be idempotent and validated:

- Normalize profile links before storing them.
- Use campaign plus normalized profile link as the duplicate key.
- Store Telegram `update_id` values to avoid duplicate webhook retries.
- Require product, campaign, and reason before creating a row.
- Return clear user messages when no product or campaign exists.
- Keep unsupported platforms visible as a limitation rather than silently failing.

For production, Telegram conversation state should move from in-memory storage to Redis or another persistent store. That would prevent an in-progress intake from disappearing during backend restarts or deploys.

## Provider Reliability

Apify and Gemini should remain optional providers, not hard dependencies.

For Apify:

- Treat no credit, missing actor ID, and scraper failure as recoverable.
- Log platform, actor ID, HTTP status, and error message.
- Track scraping budget because the first version has limited free credit.
- Make Instagram support explicit until TikTok scraping is complete.

For Gemini:

- Keep all AI output advisory unless explicitly guarded.
- Disable or skip AI features when quota is exhausted.
- Log skipped or failed AI runs.
- Use structural guards so AI cannot move review-phase or terminal statuses incorrectly.
- Keep the human able to override tags, ratings, and statuses.

For Gmail:

- Store OAuth refresh tokens securely.
- Expose a Gmail connection status endpoint.
- Handle invalid recipient and expired-token errors cleanly.
- Keep Gmail drafts as drafts only; humans send from Gmail.

## Data Reliability

The CRM should have one clear source of truth. In the current model, the Creator row is campaign-specific and carries review, outreach, follow-up, and content pipeline fields. This avoids scattering one creator workflow across too many active objects.

To keep data reliable:

- Avoid duplicate active status fields.
- Use standard pipeline status options.
- Keep relation fields consistent between Creator, Campaign, Product, MessageThread, MessageDraft, and metrics.
- Keep legacy objects clearly marked as legacy or inactive.
- Prefer structured fields only when they support filtering, kanban, calendar, reporting, or automation.
- Store provider attempts in Integration Events for auditability.

## Operational Reliability

For production operation:

- Run the backend behind HTTPS.
- Keep only one backend worker while Telegram intake state is in memory.
- Protect production intake/job endpoints with `INTAKE_API_SECRET`.
- Do not embed secrets into the frontend bundle.
- Monitor `GET /health`.
- Add uptime monitoring for the CRM and backend.
- Back up Twenty Postgres and uploaded files.
- Test restore from backup before storing important campaign data.
- Separate local, staging, and production API keys.
- Rotate keys that were shared in chats or logs.

## Maintainability

The code should stay maintainable by keeping a clean boundary between Twenty and the backend.

Twenty should own:

- CRM records.
- Views and kanbans.
- Sidebar navigation.
- Simple logic functions.
- Team-facing workflow state.

The backend should own:

- Telegram state.
- Provider API calls.
- Secrets.
- Scraper normalization.
- AI calls.
- Gmail OAuth and sync.
- Scheduled jobs.
- Error logging.

This split keeps messy provider logic out of the CRM app and keeps workspace UI close to the data model.

## Testing Strategy

The project should keep tests around:

- URL normalization.
- Storage-normalized profile links.
- Telegram intake state transitions.
- Creator intake duplicate handling.
- Apify actor input and output parsing.
- Enrichment success, skip, and failure paths.
- Gemini response parsing and tag allowlists.
- AI pipeline guard rules.
- Follow-up date calculation.
- Gmail token storage and draft lifecycle.
- Twenty GraphQL queries and mutations.

For real production confidence, add end-to-end smoke tests:

1. Submit Instagram creator through Telegram.
2. Confirm Creator Review row appears.
3. Run enrichment and AI summary.
4. Move to Approved to Contact.
5. Generate Gmail draft.
6. Log or sync a reply.
7. Move to Content Submitted.
8. Approve content.

## What I Would Do Next For Reliability

The next reliability improvements should be:

- Add Redis-backed Telegram intake state.
- Add a provider quota/status page for Apify and Gemini.
- Finish TikTok scraper support or block TikTok enrichment clearly at intake.
- Add better error responses for Gmail draft failures.
- Add production smoke tests after deploy.
- Add scheduled backups and restore documentation.
- Add admin-only job authorization beyond shared intake secret.
- Add rate limiting around public webhook and intake endpoints.
- Add dashboard cards for stale creators, overdue follow-ups, failed enrichment, and missing contact owner.
