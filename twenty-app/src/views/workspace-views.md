# Twenty Workspace Views

Implement these after the object definitions sync successfully.

## Campaign Views

- Active Campaigns: campaigns where status is `Active`.
- Campaign Goals: campaigns with goal columns visible.
- Proposal Review Board: creator proposals grouped by `decisionStatus`.
- Creator Pipeline: creators or outreach records grouped by `pipelineStatus`.
- Overdue Follow-Ups: outreach records where `nextFollowUpAt` is before today and pipeline is not `Closed`.
- Blocked Creators: outreach records with non-empty `blocker`.
- Content Review Queue: deliverables grouped by `reviewStatus`.
- Ready For Ad Test: deliverables where `readyForAdTest` is true.

## Creator Views

- Creator Directory: all creators with platform, handle, niche, priority, and current status.
- High Priority Creators: creators where priority is `High`.
- Needs More Info: proposals where decision status is `Needs More Info`.
- Duplicates: proposals where decision status is `Duplicate`.

## Growth Lead Dashboard Sections

- Goal vs actual metrics.
- Creator funnel counts.
- Delayed creators.
- Blocked creators.
- Top proposed creators.
- Approved creators.
- Content approved.
- Ready-for-ad-test assets.
- Weekly summary.

