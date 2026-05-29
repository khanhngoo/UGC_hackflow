# Twenty Workflow Specs

## Proposal Approved

Trigger: `CreatorProposal` updated where `decisionStatus` becomes `Approved to Contact`.

Actions:

- Update linked creator `currentStatus` to `Approved to Contact`.
- Create or update outreach record for creator/campaign.
- Notify backend if owner assignment or Telegram reminder is needed.

## Proposal Rejected

Trigger: `CreatorProposal` updated where `decisionStatus` becomes `Rejected`.

Actions:

- Save decision reason.
- Update linked creator status only if creator has no active outreach in another campaign.

## Outreach Follow-Up Due

Trigger: scheduled workflow or backend reminder job.

Actions:

- Find outreach records where `nextFollowUpAt` is overdue.
- Notify owner through backend/Telegram.

## Content Approved

Trigger: `Deliverable` updated where `reviewStatus` becomes `Approved`.

Actions:

- Set linked outreach/creator pipeline status to `Approved`.
- If `readyForAdTest` is true, include asset in dashboard/reporting.

## Weekly Campaign Report

Trigger: weekly schedule.

Actions:

- Backend aggregates campaign state.
- AI generates concise report.
- Backend writes report to `Campaign.weeklySummary`.

