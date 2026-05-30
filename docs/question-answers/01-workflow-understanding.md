# 1. Workflow Understanding

UGC Creator Ops is the internal workflow that turns creator discoveries into managed campaign execution. A growth teammate may find a creator while scrolling Instagram, TikTok, or another short-form platform. Instead of dropping the link into a chat and hoping someone remembers it, the teammate submits the creator into a shared CRM workflow with a product, campaign, and short reason. From there, the system keeps the creator visible through review, outreach, follow-up, content submission, and final approval.

## Users

The main users are:

- **Growth team members**, who find creators, propose them, contact approved creators, follow up, and move deals forward.
- **Growth lead**, who reviews creator quality, approves or rejects creators, checks campaign progress, and spots blockers.
- **Reviewers, founders, or advisors**, who may not operate the workflow every day but need visibility into creator quality, campaign status, and risks.

## Problems They Face

The core problem is not creator discovery. Team members can already find creators by scrolling social platforms. The problem is that good leads are easy to lose once they are found. Creator links can end up in group chats, DMs, notes, spreadsheets, or someone's memory. That makes review inconsistent and makes it hard for the growth lead to know which creators have been contacted, who owns the next step, and which content is ready.

Common problems include:

- Good creator links get buried in chats.
- The reason for recommending a creator is forgotten.
- The same creator may be proposed twice for the same campaign.
- Metrics and profile details have to be collected manually.
- Outreach status is unclear.
- Follow-ups are missed after the first message.
- Submitted content and revision notes are scattered.
- Reporting requires manual reconstruction from multiple sources.

## Repetitive Parts

The repetitive work is mostly operational tracking:

- Copying creator links into a central place.
- Selecting campaign and product context.
- Normalizing profile URLs.
- Checking whether the creator was already proposed.
- Pulling follower count, views, engagement, and recent posting data.
- Creating review cards.
- Updating contact dates and reply status.
- Scheduling follow-up reminders.
- Creating draft outreach messages.
- Logging conversation history.
- Moving cards between standard pipeline stages.
- Checking which creators are overdue or blocked.

These tasks are important, but they do not require much judgment. They should be handled by the system wherever possible.

## Easy Things To Forget Or Mess Up

The easiest mistakes are the small workflow details that happen after the exciting part of finding a creator:

- Forgetting to add the creator to the CRM.
- Forgetting which campaign the creator was for.
- Forgetting the reason the creator looked promising.
- Forgetting to follow up after no reply.
- Forgetting who owns the creator.
- Forgetting to update `lastContactedAt` or `replyStatus`.
- Losing a submitted content link.
- Mixing up review status, outreach status, and content status.
- Assuming AI or scraped metrics are final instead of advisory.

This is why the tool should reduce mental load. The team should not need to remember every operational step manually.

## Parts That Should Be Automated

The system should automate low-judgment, repeatable work:

- Creator intake from Telegram or the Twenty UGC Ops page.
- Platform detection and URL normalization.
- Duplicate detection for the same creator and campaign.
- CRM record creation.
- Best-effort Instagram profile enrichment through Apify.
- Advisory AI tagging and fit ratings when Gemini quota is available.
- Integration logs for provider success, skip, or failure.
- Follow-up date calculation after contact with no reply.
- Telegram reminder messages for overdue follow-ups.
- Gmail thread sync and message logging.
- Draft email generation, while keeping human send approval.
- Pipeline updates from clear conversation rules, such as first outbound contact and first inbound reply.

## Parts That Need Human Judgment

The product should not replace human judgment. Humans still need to:

- Decide whether the creator fits the brand.
- Judge authenticity, tone, and creative quality.
- Approve or reject the creator.
- Decide whether to contact the creator.
- Negotiate price, scope, and terms.
- Send messages manually.
- Review submitted content.
- Request revisions.
- Decide when content is ready for ad testing.

Automation should prepare the context. The team still makes the decision.

## What The Internal Tool Should Improve

A useful internal UGC Creator Ops tool should help the team:

- Save promising creators in under 30 seconds.
- Keep every creator tied to a campaign and reason.
- Make review consistent across the team.
- Reduce duplicate proposals.
- Keep outreach ownership clear.
- Make follow-ups hard to forget.
- Keep submitted content and revision notes findable.
- Give the growth lead a real-time view of campaign progress.
- Preserve an audit trail of automation, errors, and provider limits.
- Minimize mental space spent managing records so team members can focus on finding and working with strong creators.
