# UGC Ops Data Model

## MVP Principle

Keep the first model small. Add fields only when they support one of these views/workflows:

- Full creator database table
- Creator review kanban
- Creator operations kanban
- Contact workflow and draft messaging
- Basic campaign reporting

Fields not needed for those workflows should stay in notes or future enrichment until the team proves they need structured filtering/reporting.

## Objects

### Campaign

Purpose: container for creator sourcing, outreach, content, goals, and reporting.

Fields:

- `name`
- `objective`
- `product`
- `targetAudience`
- `platforms`
- `owner`
- `status`
- `startDate`
- `endDate`
- `creatorSourcingGoal`
- `contentSubmissionGoal`
- `performanceGoal`
- `notes`
- `weeklySummary`
- `budget` (total campaign budget, currency units)
- `budgetUsed` (amount committed or spent)
- `budgetUsePercent` (0–100; auto-updated when budget or budgetUsed changes)
- `productRef` (relation to `Product`)
- `briefDocumentLink` (Google Doc / Notion URL)
- `productDescription`
- `format`
- `deadline`
- `submissionInstruction`
- `exampleHooks` (rich text)
- `doGuidelines` (rich text)
- `dontGuidelines` (rich text)

Relations:

- belongs to `Product` (`productRef`)
- has many `CampaignCreatorCandidate`
- has many `OutreachRecord`
- has many `Brief` (legacy deliverable link only)
- has many `Deliverable`
- has many `CampaignMetric`
- has many `CreatorPerformanceMetric`
- has many `MessageThread`
- has many `MessageDraft`
- has many `ContactWorkflow`

### Creator

Purpose: canonical creator profile across campaigns.

Fields:

- `name`
- `handle`
- `price` (quoted or agreed creator compensation per deliverable/campaign)
- `platform`
- `profileLink`
- `instagramLink`
- `tiktokLink`
- `normalizedProfileLink`
- `country`
- `language`
- `niche`
- `tagList` (multi-select tags; legacy `tags` text retained on object but not in views/seed)
- `followerCount`
- `medianViewsRecent`
- `avgViewsRecent`
- `engagementRate`
- `avgLikesRecent`
- `avgCommentsRecent`
- `postsLast30Days`
- `lastPostAt`
- `brandFitRating` / `audienceFitRating` (star ratings; legacy text fits not in views/seed)
- `engagementQuality`
- `riskNotes`
- `owner`
- `pipelineStatus` (denormalized from outreach; primary funnel column in Creator Database)
- `activeCampaignName`
- `proposedReason`
- `nextFollowUpAt`
- `lastContactedAt`
- `firstContactedAt`
- `outreachOwner`
- `blocker`
- `replyStatus`
- `contentReviewStatus`

Relations:

- has many `CampaignCreatorCandidate`
- has many `OutreachRecord`
- has many `Deliverable`
- has many `CreatorPerformanceMetric`
- has many `MessageThread`
- has many `MessageDraft`

### CampaignCreatorCandidate

Purpose: campaign-specific internal candidate record created when a teammate recommends a creator for review.

Important naming decision: this is not a proposal sent by the creator. It is an internal campaign candidate/recommendation created by the Growth Team.

Fields:

- `creator`
- `campaign`
- `proposedBy`
- `reason`
- `source`
- `dateProposed`
- `status`
- `decisionReason`
- `creatorInstagramLink` (snapshot for review kanban cards)
- `creatorTiktokLink`
- `creatorHandle`
- `creatorNiche`
- `creatorTags`
- `creatorCountry`
- `creatorLanguage`
- `creatorFollowerCount`
- `creatorMedianViewsRecent`
- `creatorAvgViewsRecent`
- `creatorEngagementRate`
- `creatorAvgLikesRecent`
- `creatorAvgCommentsRecent`
- `creatorPostsLast30Days`
- `creatorLastPostAt`
- `creatorBrandFit`
- `creatorAudienceFit`
- `creatorEngagementQuality`
- `creatorRiskNotes`

Relations:

- belongs to `Creator`
- belongs to `Campaign`
- has many `CreatorEvaluation`
- has many `OutreachRecord`
- has many `MessageDraft`

### CreatorEvaluation

Purpose: standardized scorecard and vote.

Fields:

- `candidate`
- `reviewer`
- `audienceFitScore`
- `brandFitScore`
- `contentQualityScore`
- `vote`
- `concerns`
- `notes`

### OutreachRecord

Purpose: track contact, deal progress, and follow-ups.

Fields:

- `creator`
- `campaign`
- `candidate`
- `creatorHandle` (denormalized account handle, e.g. `@annamakeup`; card title on operations kanban)
- `creatorHandleLink` (clickable profile link)
- `creatorPrice` (denormalized from `Creator.price`; shown on operations kanban)
- `productRef` (relation to `Product`)
- `member` (growth team member owning this outreach)
- `contactMethod`
- `firstContactedAt`
- `lastContactedAt`
- `nextFollowUpAt`
- `brief` (link to brief sent or planned for this creator)
- `contract` (link to contract file for this creator)
- `submitted` (links to posted UGC content)
- `replyStatus` (record detail; not on operations kanban)
- `pipelineStatus`
- `blocker` (record detail; not on operations kanban)
- `notes`

Relations:

- belongs to `Creator`
- belongs to `Campaign`
- belongs to `CampaignCreatorCandidate`
- has many `MessageThread`
- has many `MessageDraft`

### Product

Purpose: product promoted across campaigns (one product, many campaigns).

Fields:

- `name`
- `description`
- `productPageLink`
- `category`
- `status` (`ACTIVE` / `ARCHIVED`)

Relations:

- has many `Campaign` via `productRef`

### Brief (legacy)

Purpose: optional legacy link from `Deliverable`; creative brief content lives on **Campaign**.

Fields:

- `campaign`
- `deliverables`

### Deliverable

Purpose: submitted creator content and review history.

Fields:

- `creator`
- `campaign`
- `brief`
- `submissionLink`
- `submittedAt`
- `reviewStatus`
- `reviewer`
- `revisionNotes`
- `approvedAssetLink`
- `readyForAdTest`
- `performanceSummary`

### CampaignMetric

Purpose: goal and actual metric tracking.

Fields:

- `campaign`
- `metricName`
- `targetValue`
- `actualValue`
- `dateRangeStart`
- `dateRangeEnd`
- `owner`
- `source`
- `notes`

### CreatorPerformanceMetric

Purpose: creator/content performance used by the full creator database table.

Fields:

- `creator`
- `campaign`
- `deliverable`
- `views`
- `clicks`
- `conversions`
- `spend`
- `source`
- `dateRangeStart`
- `dateRangeEnd`
- `notes`

Relations:

- belongs to `Creator`
- belongs to `Campaign`
- optionally belongs to `Deliverable`

### MessageThread

Purpose: one conversation thread with a creator on one channel.

Fields:

- `creator`
- `campaign`
- `outreachRecord`
- `channel`
- `externalThreadId`
- `status`
- `lastMessageAt`
- `lastSnippet`

Relations:

- belongs to `Creator`
- belongs to `Campaign`
- belongs to `OutreachRecord`
- has many `Message`

### Message

Purpose: a sent, received, or manually logged message.

Fields:

- `thread`
- `direction`
- `channel`
- `body`
- `externalMessageId`
- `sentOrReceivedAt`
- `syncStatus`

Relations:

- belongs to `MessageThread`

### MessageDraft

Purpose: draft email, Instagram DM, or TikTok DM prepared by the system for human review/manual send.

Fields:

- `creator`
- `campaign`
- `candidate`
- `outreachRecord`
- `channel`
- `subject`
- `body`
- `status`
- `scheduledFor`
- `approvedBy`
- `sentManuallyAt`

Relations:

- belongs to `Creator`
- belongs to `Campaign`
- optionally belongs to `CampaignCreatorCandidate`
- optionally belongs to `OutreachRecord`

### ContactWorkflow

Purpose: reusable outreach sequence for accepted or selected creators.

Fields:

- `name`
- `campaign`
- `channel`
- `status`
- `owner`
- `notes`

Relations:

- belongs to `Campaign`
- has many `ContactWorkflowStep`
- has many `ScheduledContactTask`

### ContactWorkflowStep

Purpose: one timed step in a contact workflow.

Fields:

- `workflow`
- `stepNumber`
- `delayHours`
- `channel`
- `template`
- `requiresApproval`

Relations:

- belongs to `ContactWorkflow`

### ScheduledContactTask

Purpose: scheduled draft-generation task for one creator.

Fields:

- `workflow`
- `workflowStep`
- `creator`
- `campaign`
- `outreachRecord`
- `scheduledFor`
- `status`
- `messageDraft`

Relations:

- belongs to `ContactWorkflow`
- belongs to `ContactWorkflowStep`
- belongs to `Creator`
- belongs to `Campaign`
- optionally belongs to `OutreachRecord`
- optionally belongs to `MessageDraft`

### IntegrationEvent

Purpose: observable log for Telegram, Twenty, Apify, AI, and future provider events.

Fields:

- `source`
- `externalId`
- `eventType`
- `status`
- `linkedObjectType`
- `linkedObjectId`
- `payloadSummary`
- `errorMessage`
- `processedAt`

## Status Values

Candidate status:

- `Proposed`
- `Under Review`
- `Approved to Contact`
- `Rejected`
- `Duplicate`
- `Needs More Info`

Pipeline status:

- `Approved to Contact`
- `Contacted`
- `Replied`
- `Needs Follow-Up`
- `Deal Confirmed`
- `Brief Sent`
- `Content Submitted`
- `Needs Revision`
- `Approved`
- `Ready for Ad Test`
- `Paid`
- `Closed`

Deliverable review status:

- `Submitted`
- `Needs Revision`
- `Approved`
- `Rejected`
- `Ready for Ad Test`

Message draft status:

- `Draft`
- `Approved`
- `Sent Manually`
- `Skipped`
- `Cancelled`

Contact task status:

- `Pending`
- `Draft Generated`
- `Sent Manually`
- `Skipped`
- `Cancelled`
