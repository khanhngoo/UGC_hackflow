# Product Requirements Document: UGC Campaign Ops Tool

## 1. Product Summary

This product is an internal UGC campaign operations tool for EveryLab’s Growth Team.

The tool helps the team capture creator ideas quickly, evaluate creators collaboratively, move approved creators through campaign stages, track campaign goals, and generate campaign-level visibility for the Growth Lead.

The core problem is not creator discovery. Big platforms already support creator matching. The problem is that growth teams discover creators across TikTok, Instagram, YouTube Shorts, X, DMs, chats, spreadsheets, and personal notes, causing good creator leads to get lost or evaluated inconsistently.

This tool turns scattered creator discoveries into a structured team workflow.

---

## 2. Product Goal

Help the Growth Team run UGC campaigns faster and with less operational chaos.

The tool should help the team:

- Capture creator leads in under 30 seconds
- Standardize creator evaluation
- Let team members comment, vote, and compare creators
- Track creator status across the full campaign lifecycle
- Assign ownership and deadlines
- Track predefined campaign goals
- Show campaign progress clearly to Growth Lead / Founder
- Reduce repetitive manual reporting

---

## 3. Non-Goals

This product should not try to become:

- A creator marketplace
- A social media scraping platform
- A replacement for TikTok Creator Marketplace, Instagram Creator Marketplace, YouTube BrandConnect, or X Creator Connect
- A full paid ads manager
- A generic project management tool
- A generic CRM

The product should focus on UGC campaign operations.

---

## 4. Target Users

### 4.1 Growth Lead

Owns campaign goals, approves creators, reviews performance, and needs a clear view of progress.

Main needs:

- See campaign status quickly
- Approve/reject proposed creators
- Know blockers
- Track campaign metrics
- Compare creator quality
- Comments on proposed creators

### 4.2 Growth Team Member

Finds creators, proposes them, contacts creators, manages follow-ups, and updates campaign status.

Main needs:

- Quickly save creators while browsing social apps
- Explain why a creator is promising
- See feedback from teammates
- Know which creators they own
- Track outreach and follow-up
- Avoid forgetting deadlines

### 4.3 Reviewer / Founder / Advisor

May not manage creators daily but needs visibility into campaign health.

Main needs:

- Read campaign summary
- See important risks
- Understand which creators/content are promising
- Comment on selected creators or content

---

## 5. Core Use Case

A team member is scrolling TikTok or Instagram on their phone and finds a creator who looks like a strong fit.

Current workflow:

1. Copy creator link
2. Send to group chat
3. Add vague reason manually
4. Message gets buried
5. Other members may not review it
6. Growth Lead loses visibility
7. Creator may never be contacted

Desired workflow:

1. Team member shares creator link to the system
2. Adds short reason: “Good student audience, natural facecam style”
3. System creates creator proposal card
4. AI suggests creator tags, content style, audience fit, and risks
5. Team reviews, comments, and votes
6. Growth Lead approves or rejects
7. Approved creator moves into outreach workflow
8. Campaign dashboard updates automatically

---

## 6. Telegram Bot as Mobile Gateway

### Recommendation

Use a Telegram chatbot as the first mobile gateway.

This is reasonable because the goal is fast mobile capture, not building a polished mobile app. Growth team members already share links through messaging apps. Telegram bot capture is faster to build, easier to use, and fits the “found while scrolling” behavior.

### Why Telegram Bot Makes Sense

- Fastest way to submit creators from phone
- No need to build a full mobile app
- Natural sharing behavior
- Works well for links, short notes, and status updates
- Good for startup-speed prototype
- Reduces friction compared to opening a separate app


### Product Decision

Telegram should be used for quick creator intake and simple updates only.

The main workspace should still handle:

- Campaign dashboard
- Creator review
- Team feedback
- Approval decisions
- Metrics tracking
- Reporting

Telegram should support:

- Submit creator link
- Add quick reason
- Select campaign
- Receive confirmation
- Get assigned follow-up reminders
- Quick status update

Telegram should not replace the full workspace.

---

## 7. Main Product Modules

### 7.1 Campaign Workspace

Each campaign is a container for creators, goals, content, statuses, and performance.

A campaign should include:

- Campaign name
- Campaign objective
- Target product
- Target audience
- Platforms
- Campaign owner
- Start date
- End date
- Creator sourcing goal
- Content submission goal
- View goal
- Click goal
- Conversion goal
- Notes
- Status

Example campaign:

```text
Campaign: Exam Season AI Study App UGC
Objective: Drive student signups before finals
Target audience: University students
Platforms: TikTok, Instagram Reels, YouTube Shorts
Goal: 100 creators sourced, 30 contacted, 10 videos approved, 100k views, 3% click rate
```

### 7.2 Creator Proposal

A creator proposal is the first record created when someone finds a creator.

Required fields:

- Creator name / handle
- Platform
- Profile link
- Proposed by
- Campaign
- Reason for proposing
- Date proposed
- Current status

Optional fields:

- Country / language
- Niche
- Content style
- Follower count
- Average views
- Engagement quality
- Audience fit
- Brand fit
- Risk notes
- Similar creators
- Screenshots / examples
- Notes

Creator proposal status:

- Proposed
- Under Review
- Approved to Contact
- Rejected
- Duplicate
- Needs More Info

### 7.3 Collaborative Creator Evaluation

The system should help the team evaluate creators consistently.

Each creator should have a standard scorecard:

| Evaluation Area | Description |
|---|---|
| Audience Fit | Does the creator reach the campaign’s target audience? |
| Brand Fit | Does the creator’s tone match EveryLab? |
| Content Quality | Are videos clear, watchable, and natural? |
| Authenticity | Does the creator feel real, not spammy or fake? |
| Product Explanation Ability | Can they explain apps or AI tools clearly? |
| Engagement Quality | Do comments/views seem healthy? |

Team members should be able to:

- Add comments
- Add concerns
- Suggest campaign fit
- Compare creator against similar creators
- Mention teammates
- Mark duplicate creators

Growth Lead should be able to:

- Approve creator
- Reject creator
- Request more information
- Assign owner
- Move creator to outreach

### 7.4 Creator Pipeline

Once approved, creators move through the operational workflow.

Recommended workflow:

1. Proposed
2. Under Review
3. Approved to Contact
4. Contacted
5. Replied
6. Negotiating
7. Deal Confirmed
8. Brief Sent
9. Content Submitted
10. Needs Revision
11. Approved
12. Ready for Ad Test
13. Paid
14. Closed

Each stage should show:

- Owner
- Last updated date
- Next action
- Deadline
- Blocking reason, if any

### 7.5 Outreach Tracking

For each creator, the team should track:

- Contact method
- Contact owner
- First contact date
- Last contact date
- Deal status
- Deliverables discussed
- Price / compensation notes
- Payment status

Common follow-up triggers:

- No reply after 2–3 days
- Replied but not confirmed
- Deal discussed but not signed
- Brief sent but no submission
- Revision requested but not received
- Payment pending

### 7.6 Brief and Deliverables

Each campaign should have one or more briefs.

Brief fields:

- Product description
- Target audience
- Key message
- Creator angle
- Example hooks
- Do guidelines
- Don’t guidelines
- Video length
- Format
- Deadline
- Submission instruction
- Usage rights expectations
- Payment terms

Each creator may have deliverables:

- Number of videos
- Number of revisions allowed
- Due date
- Submitted links/files
- Approval status
- Revision notes
- Final approved asset
- Ready for ad testing status

### 7.7 Campaign Metrics

Growth Lead should define campaign goals before launch.

Metric types:

#### Operational Metrics

- Creators sourced
- Creators approved
- Creators contacted
- Creators replied
- Deals confirmed
- Briefs sent
- Content submitted
- Content approved
- Creators paid

#### Performance Metrics

- Views
- Clicks
- Click-through rate
- Signups
- Installs
- Conversion rate
- Cost per click
- Cost per signup
- Cost per approved video
- Cost per usable creator

#### Creative Metrics

- Best creator niche
- Best content style
- Best platform
- Best CTA
- Best audience segment
- Highest-performing approved video

Campaign dashboard should show:

- Goal vs actual
- Funnel conversion
- Creator pipeline count
- Delayed creators
- Blocked creators
- Top creators
- Top content
- Risks

### 7.8 AI Use Cases

AI should assist the team, not make final decisions.

#### Creator Intake AI

When a creator link or profile info is submitted, AI can suggest:

- Creator niche
- Content style
- Audience type
- Product fit
- Brand fit
- Risk notes
- Suggested campaign
- Priority level

#### Outreach AI

AI can draft:

- Personalized DM, email
- Follow-up message
- Brief intro
- Revision request
- Payment confirmation message
- Scan information from DM/email and update database

Human approval is required before sending.

#### Reporting AI

AI can generate:

- Weekly campaign summary
- Blocker summary
- Creator pipeline summary
- Top-performing creator summary
- Suggested next actions

---


## 9. Data Types

### 9.1 Campaign

Fields:

- Campaign ID
- Name
- Objective
- Product
- Target audience
- Platforms
- Owner
- Status
- Start date
- End date
- Goals
- Notes

### 9.2 Creator

Fields:

- Creator ID
- Name
- Handle
- Platform
- Profile link
- Contact method
- Country
- Language
- Niche
- Content style
- Audience type
- Follower count
- Average views
- Engagement quality
- Brand fit
- Audience fit
- Risk notes
- Priority
- Current status
- Owner

### 9.3 Creator Proposal

Fields:

- Proposal ID
- Creator
- Campaign
- Proposed by
- Reason
- Date proposed
- AI summary
- Team comments
- Votes
- Decision status

### 9.4 Outreach Record

Fields:

- Creator
- Campaign
- Owner
- Contact method
- First contacted date
- Last contacted date
- Next follow-up date
- Reply status
- Deal status
- Notes

### 9.5 Content Submission

Fields:

- Creator
- Campaign
- Deliverable type
- Submission link
- Submitted date
- Review status
- Reviewer
- Revision notes
- Approved asset link
- Ready for ad test
- Final decision

### 9.6 Metric

Fields:

- Campaign
- Metric name
- Target value
- Actual value
- Date range
- Owner
- Source
- Notes

### 9.7 Comment / Feedback

Fields:

- Author
- Target object
- Comment text
- Created date
- Mentioned users
- Decision relevance

---

## 10. Key Workflows

### 10.1 Submit Creator From Mobile

1. User finds creator on TikTok/Instagram/YouTube/X
2. User shares creator link to Telegram bot
3. Bot asks which campaign this creator belongs to
4. User adds short reason
5. System creates creator proposal
6. AI suggests tags and summary
7. Team receives notification
8. Creator appears in campaign review board

Success criteria:

- Creator submitted in under 30 seconds
- No spreadsheet entry required
- Team can review later

### 10.2 Team Reviews Creator

1. Creator appears in “Proposed” list
2. Team members inspect creator card
3. Team members vote/comment
4. AI summarizes pros/cons
5. Growth Lead approves, rejects, or asks for more info
6. Approved creator moves to “Approved to Contact”

Success criteria:

- Decision is visible
- Reasoning is recorded
- Duplicate debate is reduced

### 10.3 Outreach and Follow-Up

1. Approved creator is assigned to owner
2. Owner contacts creator
3. Owner updates status
4. System tracks last contact date
5. System highlights overdue follow-ups
6. Creator moves through reply/deal/brief stages

Success criteria:

- No creator is forgotten
- Growth Lead sees blockers
- Each creator has clear owner

### 10.4 Content Review

1. Creator submits content
2. Owner adds submission link
3. Reviewer checks content
4. Reviewer marks approved / needs revision / rejected
5. Revision notes are saved
6. Approved content moves to “Ready for Ad Test”

Success criteria:

- Review decision is clear
- Revision history is preserved
- Approved assets are easy to find

### 10.5 Campaign Reporting

1. Growth Lead opens campaign dashboard
2. System shows funnel metrics
3. System compares actual vs goals
4. AI generates weekly summary
5. Report highlights blockers, risks, and next actions

Success criteria:

- No manual weekly report from scratch
- Founder gets clear campaign status
- Team sees what needs action

---

## 11. Dashboard Requirements

Campaign dashboard should show:

- Campaign goal progress
- Creator funnel
- Creator status breakdown
- Top proposed creators
- Approved creators
- Blocked creators
- Overdue follow-ups
- Content approval status
- Ready-for-ad-test assets
- Performance metrics
- Weekly summary

Creator dashboard should show:

- Creator profile
- Campaign history
- Team feedback
- AI summary
- Outreach status
- Content status
- Performance notes

---

## 12. Success Metrics

Product success should be measured by:

- Time to submit a creator
- Number of creators proposed
- Number of creators reviewed
- Percentage of proposed creators with decision
- Follow-up delay reduction
- Number of forgotten/stale creators
- Time from proposal to contact
- Time from contact to submitted content
- Number of approved content assets
- Campaign reporting time saved
- Team satisfaction

---

## 13. MVP Scope

The MVP should include:

- Campaign creation
- Creator proposal form
- Telegram-based creator submission
- Creator review board
- Voting/commenting
- Creator status pipeline
- Owner assignment
- Follow-up dates
- Basic AI tagging/summary
- Campaign goal tracking
- Basic weekly report

---

## 14. Later Improvements

Future versions may include:

- Better mobile experience
- Browser/social sharing extension
- Deeper creator profile enrichment
- Ads performance import
- Payment tracking
- Contract tracking
- Usage rights tracking
- Creator performance history
- Creative pattern analysis
- Cross-campaign learning system
- More advanced AI recommendation

---

## 15. Product Positioning

This product is not a marketplace.

It is:

> A collaborative UGC campaign operating system for startup growth teams.

Its key value is helping the team move from scattered creator ideas to structured campaign execution and measurable growth learning.