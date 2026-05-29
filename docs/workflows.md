# UGC Ops Workflows

## Submit Creator From Telegram

1. User sends a TikTok, Instagram, YouTube Shorts, or X link to the bot.
2. Backend validates the Telegram update and authorized user.
3. Backend normalizes the URL and detects platform.
4. Bot asks for campaign if campaign is missing.
5. Bot asks for reason if reason is missing.
6. Backend checks for existing creator by `platform + normalizedProfileLink`.
7. Backend creates or reuses creator.
8. Backend creates campaign creator candidate.
9. Backend queues optional enrichment (Apify).
10. Bot sends confirmation with Twenty link.

Acceptance:

- Submission is possible in under 30 seconds.
- Duplicate creator records are avoided.
- Apify/AI failure does not block candidate creation.

## Submit Creator From Twenty UI

1. Open **UGC Ops** in the Twenty sidebar (home page widget).
2. Paste a TikTok, Instagram, YouTube Shorts, or X profile URL.
3. Select **product** and **campaign** from the dropdowns.
4. Enter a **reason** (and optional **proposed by**).
5. Click **Submit for review**.
6. Backend normalizes the URL, creates or reuses `Creator`, creates `CampaignCreatorCandidate`, and queues Apify enrichment + AI summary (same as Telegram).
7. Confirm the card on **Creator Review**.

### Local setup

- Backend: `uvicorn app.main:app --reload` on port 8000.
- Twenty: `http://localhost:2020` with the app synced (`yarn twenty dev --once` in `twenty-app-official/`).
- Optional: `INTAKE_CORS_ORIGINS=http://localhost:2020` (default). Leave `INTAKE_API_SECRET` empty for local dev.

Acceptance:

- Same duplicate-candidate rules as Telegram (open proposal for same creator + campaign returns an error).
- Enrichment/AI failure does not block candidate creation.

**Security:** Do not embed `INTAKE_API_SECRET` in the front-end bundle for production; use a server-side proxy or trusted network until auth is hardened.

## Team Reviews Creator

1. Candidate appears in Twenty review board.
2. Reviewers add scorecards, comments, concerns, and votes.
3. Growth Lead chooses final decision using engagement metrics and fit fields on the review card.
4. Approved candidates move into outreach via the M12 handoff rule.

Acceptance:

- Decision and rationale are visible.
- Multiple reviewers can evaluate the same candidate.
- Approved creator has an owner or is clearly unassigned.

## Approve Candidate To Operations (M12 handoff)

When a candidate moves to `APPROVED_TO_CONTACT` on the **Creator Review** kanban:

1. Create an `OutreachRecord` linked to `creator`, `campaign`, and `candidate`.
2. Set `pipelineStatus = APPROVED_TO_CONTACT`.
3. The card appears on the **Creator Operations** kanban (accepted creators only).
4. Copy `creator.handle` to `OutreachRecord.creatorHandle` and set `member` (growth teammate).
5. Update denormalized fields on `Creator` (`reviewStatus`, `pipelineStatus`, `outreachOwner`, follow-up dates).
6. Do **not** set `nextFollowUpAt` until first contact; the 3-day rule runs after `lastContactedAt` is logged.

**Automation (primary):** deploy logic functions from `twenty-app-official/` (`yarn twenty dev --once`):

- `approve-candidate-handoff` on `campaignCreatorCandidate.updated` when `status` → `APPROVED_TO_CONTACT`
- `apply-outreach-follow-up` on `outreachRecord.updated` when `lastContactedAt` changes and `replyStatus` is `NO_REPLY`

The backend `POST /webhooks/twenty` handler mirrors these rules as an optional fallback; it is not required for handoff in production.

If a card is already in **Approved to Contact** but missing on **Creator Operations**, run `yarn handoff:backfill` in `twenty-app-official/` (creates missing `OutreachRecord` rows). After deploying an updated `approve-candidate-handoff`, new approvals should hand off automatically.

## Outreach And Follow-Up

1. Approved creator creates or updates outreach record.
2. Member contacts creator manually and sets `lastContactedAt`.
3. If `replyStatus` is still `NO_REPLY`, system sets `nextFollowUpAt = lastContactedAt + 3 days`.
4. Member can override `nextFollowUpAt` on the **Follow-up calendar** view (view switcher on Creator Operations).
5. Reminder job finds overdue follow-ups (`nextFollowUpAt` in the past, still `NO_REPLY`, not `CLOSED`).
6. Bot notifies the assigned **member**.

Acceptance:

- No approved creator has an unclear next action after first contact.
- Growth Lead can see upcoming and overdue follow-ups on the calendar.

## Content Review

1. Growth edits campaign instructions in **Campaigns** (brief fields on the `Campaign` row, including `briefDocumentLink` and guidelines).
2. When a creator submits content, create a **Deliverable** (creator + campaign); set `submissionLink` and `reviewStatus = Submitted`.
3. Review on **Content Review** kanban (grouped by `reviewStatus`): Submitted → Needs Revision → Approved → Rejected → Ready for Ad Test.
4. Add `revisionNotes` and `reviewer` on the deliverable; set `approvedAssetLink` when approved.
5. Toggle `readyForAdTest` when the asset is cleared for paid testing.

Automation (`sync-deliverable-review` logic function on `deliverable.updated`):

- Maps deliverable `reviewStatus` to matching `OutreachRecord.pipelineStatus` (same creator + campaign).
- Copies `submissionLink` or `approvedAssetLink` to `outreach.submitted` (including `secondaryLinks` when multiple draft URLs exist).
- Updates denormalized `Creator.contentReviewStatus` and `Creator.pipelineStatus`.
- Sets `submittedAt` on first submission link if empty.

Acceptance:

- Approved assets are findable on Content Review (Approved / Ready for Ad Test columns) with `approvedAssetLink`.
- Revision notes remain on the deliverable record.
- Creator Operations pipeline column stays in sync when review status changes on Content Review.

