# Creator Views And Messaging Mini-Plans

These mini-plans condense the larger UGC Ops plan into buildable chunks. They use the compact object/field set in [data-model.md](data-model.md), and they follow the Twenty developer approach in [twenty-developer-guide.md](twenty-developer-guide.md): official `create-twenty-app` scaffold, stable `universalIdentifier`s, bidirectional relations, `defineView()`, Twenty APIs, webhooks, and external backend jobs where provider logic is messy.

## Mini-Plan 1: Official Twenty App Foundation

Goal: make the app sync-ready before building views.

Build:

- Generate the official scaffold with `npx create-twenty-app@latest twenty-app-official`.
- Move the current draft object definitions into the official scaffold.
- Rename `CreatorProposal` to `CampaignCreatorCandidate`.
- Add stable `universalIdentifier`s for every object, field, relation, and view.
- Replace placeholder relation fields with official bidirectional relation fields.

Important Twenty features:

- `create-twenty-app`
- `defineObject()`
- `defineField()`
- `FieldType.RELATION`
- `RelationType.MANY_TO_ONE`
- `RelationType.ONE_TO_MANY`
- `yarn twenty dev --once`

Acceptance:

- Official app scaffold exists.
- UGC objects are migrated into official app structure.
- App sync can be attempted against local self-hosted Twenty.

## Mini-Plan 2: Compact Data Model

Goal: keep only the fields needed for the three requested sidebar workflows.

Build these core objects first:

- `Campaign`
- `Creator`
- `CampaignCreatorCandidate`
- `CreatorEvaluation`
- `OutreachRecord`
- `Brief`
- `Deliverable`
- `CampaignMetric`
- `CreatorPerformanceMetric`
- `MessageThread`
- `Message`
- `MessageDraft`
- `ContactWorkflow`
- `ContactWorkflowStep`
- `ScheduledContactTask`
- `IntegrationEvent`

Most important connections:

- `Campaign` has many `CampaignCreatorCandidate`, `OutreachRecord`, `Brief`, `Deliverable`, `CampaignMetric`, `MessageDraft`, and `ContactWorkflow`.
- `Creator` has many `CampaignCreatorCandidate`, `OutreachRecord`, `Deliverable`, `CreatorPerformanceMetric`, `MessageThread`, and `MessageDraft`.
- `CampaignCreatorCandidate` belongs to one `Creator` and one `Campaign`.
- `OutreachRecord` belongs to one `Creator`, one `Campaign`, and optionally one `CampaignCreatorCandidate`.
- `MessageDraft` belongs to one `Creator` and one `Campaign`, and optionally one `CampaignCreatorCandidate` and `OutreachRecord`.
- `ScheduledContactTask` belongs to one workflow step, one creator, one campaign, and optionally one generated draft.

Fields to avoid in v1:

- Multiple overlapping quality fields that are not filtered often.
- Separate niche/style/audience taxonomies beyond `niche` and `tags`.
- Too many deal/payment fields before payment workflow is real.
- Auto-send provider-specific fields before API access is confirmed.

Acceptance:

- The data model supports creator table, review kanban, operations kanban, and contact workflows.
- There is no duplicate source of truth for creator status.
- Messaging records are linked to creator, campaign, and outreach.

## Mini-Plan 3: Sidebar View - Creator Database

Goal: one table where the Growth Team sees all creators across all campaigns.

Primary object:

- `Creator`

View type:

- Table/index view using `defineView()`.

Essential columns:

- Identity: `name`, `handle`, `instagramLink`, `tiktokLink`, `profileLink`, `platform`, `country`, `language`, `niche`, `tags`
- Review: `reviewStatus`, `proposedReason`, `brandFit`, `audienceFit`, `engagementQuality`, `riskNotes`
- Engagement: `followerCount`, `medianViewsRecent`, `avgViewsRecent`, `engagementRate`, `avgLikesRecent`, `avgCommentsRecent`, `postsLast30Days`, `lastPostAt`
- Operations: `pipelineStatus`, `outreachOwner`, `firstContactedAt`, `lastContactedAt`, `nextFollowUpAt`, `replyStatus`, `blocker`, `contentReviewStatus`, `activeCampaignName`

Implementation detail:

- Denormalize review and operations fields onto `Creator` from `CampaignCreatorCandidate` and `OutreachRecord`.
- Sync via backend jobs or Twenty logic functions when related records change (M12).

Acceptance:

- Growth Team can scan creators by platform, niche, status, fit, and performance.
- Each row links to creator profile and related campaign records.

## Mini-Plan 4: Sidebar View - Creator Review Kanban

Goal: review and approve/reject proposed creators before outreach.

Primary object:

- `CampaignCreatorCandidate`

Group by:

- `status` (6 review columns)

Card fields (approval focus):

- Creator, campaign, reason, proposed by, date proposed, source
- Instagram link, TikTok link, handle, niche, tags, country, language
- Follower count, median/avg views, engagement rate, likes/comments, posting cadence
- Brand fit, audience fit, engagement quality, risk notes

Acceptance:

- Growth Team can decide approve/reject from social metrics on the card.
- No priority or AI summary fields.

## Mini-Plan 4b: Sidebar View - Creator Operations Kanban

Goal: move accepted creators through outreach, brief, and content stages.

Primary object:

- `OutreachRecord` (one row per approved candidate)

Group by:

- `pipelineStatus`

Pipeline columns:

- `Approved to Contact` through `Closed`, including `Deal Confirmed`, `Brief Sent`, `Content Submitted`, `Needs Revision`, `Ready for Ad Test`

Card title:

- `creatorHandle` (e.g. `@annamakeup`) — label identifier for the outreach record

Card fields:

- Campaign, pipeline status, member, contact method
- First/last contacted, next follow-up
- Brief (sent or intended brief link), contract (contract file link), submitted (posted content links)

Not on kanban card:

- Reply status, blocker (remain on record for detail views and automation)

Handoff:

- Creating an outreach record when a candidate is approved adds the card to this board (see `docs/workflows.md`).
- Copy `creator.handle` onto `creatorHandle` when the outreach row is created.

Acceptance:

- Only accepted creators with an outreach record appear on this board.
- Card title is the creator handle; member shows the assigned growth teammate.

### Follow-up calendar (M12)

Second view on `OutreachRecord`, switched from Creator Operations via the view dropdown:

- Name: **Follow-up Calendar**
- Type: `CALENDAR` on `nextFollowUpAt` (week layout)
- Display: handle, campaign, pipeline status, member, contact method

Follow-up rule (fixed, not UI-configurable):

- When `lastContactedAt` is set and `replyStatus` is `NO_REPLY`, set `nextFollowUpAt = lastContactedAt + 3 days`
- Implemented in logic functions `apply-outreach-follow-up` and `approve-candidate-handoff`
- Overdue rows notified via backend `POST /jobs/send-reminders` (optional Telegram chat id)

## Mini-Plan 5: Sidebar View - Contact Workflows

Goal: apply timed contact sequences to accepted or selected creators.

Primary objects:

- `ContactWorkflow`
- `ContactWorkflowStep`
- `ScheduledContactTask`
- `MessageDraft`

View types:

- Workflow table: all reusable workflows.
- Scheduled task queue: pending/generated/skipped contact tasks.
- Draft queue: drafts waiting for human review/manual send.

Essential workflow fields:

- `name`
- `campaign`
- `channel`
- `status`
- `owner`
- `notes`

Essential step fields:

- `stepNumber`
- `delayHours`
- `channel`
- `template`
- `requiresApproval`

Essential task fields:

- `creator`
- `campaign`
- `workflow`
- `workflowStep`
- `scheduledFor`
- `status`
- `messageDraft`

Flow:

1. User filters accepted candidates or selects specific creators.
2. User applies a contact workflow.
3. Backend creates `ScheduledContactTask` records.
4. Scheduler creates `MessageDraft` records at the right time.
5. Owner reviews/copies/sends manually.
6. Owner marks draft as `Sent Manually`.
7. Outreach record updates `lastContactedAt` and `pipelineStatus`.

Acceptance:

- Accepted creators can be scheduled into a contact workflow.
- Drafts are generated at the correct time.
- Sending remains manual for email, Instagram DM, and TikTok DM in v1.

## Mini-Plan 6: Messaging Engine

Goal: prepare drafts and keep messaging history connected to the CRM without taking on risky auto-DM sending.

MVP scope:

- Generate email drafts.
- Generate Instagram DM drafts.
- Generate TikTok DM drafts.
- Store message threads and manually logged messages.
- Update creator/outreach status after user confirms manual send or reply.

Not v1:

- Auto-send Instagram DMs.
- Auto-send TikTok DMs.
- Automatically change important statuses from AI without human confirmation.

Backend responsibilities:

- Generate drafts from campaign, creator, candidate, outreach, and brief context.
- Create scheduled draft tasks.
- Update Twenty records through Twenty API.
- Receive Twenty webhooks for candidate/outreach/deliverable changes.
- Store provider/API attempts in `IntegrationEvent`.

Twenty developer features:

- Twenty API for creating/updating records.
- Webhooks for status changes.
- Logic functions or workflow actions to request draft generation.
- `defineView()` for draft and scheduled task queues.

Acceptance:

- A selected creator can receive a draft for email/Instagram/TikTok.
- Drafts are linked to creator, campaign, and outreach.
- Marking a draft as sent manually updates the outreach record.
- Reply/content updates can be logged and reflected in the pipeline.

## Mini-Plan 8: M13 Briefs and Content Review

Goal: give Growth structured brief editing and a deliverable-first review board without duplicating PRD-only fields.

Build:

- `campaigns.view.ts` — TABLE on `Campaign` (name, `productRef`, brief doc link, format, deadline, guidelines).
- `products.view.ts` — TABLE on `Product` (name, category, product page, status).
- `content-review-kanban.view.ts` — KANBAN on `Deliverable` grouped by `reviewStatus` (5 columns); card title = `creatorHandle`.
- Navigation items: **Campaigns**, **Content Review** (positions 3–4 in UGC Ops sidebar).
- `creatorHandle` on `Deliverable` as label identifier.
- `sync-deliverable-review.logic-function.ts` — sync review status to outreach pipeline + creator denormalized fields (including `secondaryLinks` on submitted).
- Seed: Glow Bottle `Product` + `Campaign` (brief fields) + Sofia `Deliverable` in `scripts/seed-sample-data.mjs`.

Acceptance:

- Campaigns table lists and edits brief creative fields on each campaign row.
- Content Review kanban shows deliverables by review status with submission and revision fields on cards.
- Moving a deliverable to Approved updates the matching outreach record to Approved and sets `contentReviewStatus` on the creator.
- Team creates deliverables manually when content arrives (ops `submitted` link remains an optional shortcut).

## Mini-Plan 7: Validation

Test these scenarios:

- Official Twenty app scaffold syncs to local Twenty.
- Creator database view displays identity, engagement, review status, and pipeline fields.
- Creator review kanban groups candidates by six review statuses with social metrics on cards.
- Creator operations kanban groups outreach records by twelve pipeline statuses; card title is `creatorHandle`.
- Accepted candidate creates or links to an outreach record.
- Contact workflow creates scheduled tasks for selected creators.
- Scheduled task creates a message draft.
- Marking a draft as sent manually updates outreach status.
- Logging a reply updates pipeline status to `Replied`.
- Creating a deliverable and changing `reviewStatus` syncs outreach `pipelineStatus` and creator `contentReviewStatus`.
- Campaigns table displays Glow Bottle campaign with brief fields and `productRef` from seed.
- Performance metric updates are visible from the creator database table.

