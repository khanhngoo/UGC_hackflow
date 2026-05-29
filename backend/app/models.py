from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field, HttpUrl


class Platform(StrEnum):
    TIKTOK = "TikTok"
    INSTAGRAM = "Instagram"
    YOUTUBE = "YouTube"
    X = "X"
    UNKNOWN = "Unknown"


class ProposalStatus(StrEnum):
    PROPOSED = "Proposed"
    UNDER_REVIEW = "Under Review"
    APPROVED_TO_CONTACT = "Approved to Contact"
    REJECTED = "Rejected"
    DUPLICATE = "Duplicate"
    NEEDS_MORE_INFO = "Needs More Info"


class PipelineStatus(StrEnum):
    PROPOSED = "Proposed"
    UNDER_REVIEW = "Under Review"
    APPROVED_TO_CONTACT = "Approved to Contact"
    CONTACTED = "Contacted"
    REPLIED = "Replied"
    NEEDS_FOLLOW_UP = "Needs Follow-Up"
    DEAL_CONFIRMED = "Deal Confirmed"
    BRIEF_SENT = "Brief Sent"
    CONTENT_SUBMITTED = "Content Submitted"
    NEEDS_REVISION = "Needs Revision"
    APPROVED = "Approved"
    READY_FOR_AD_TEST = "Ready for Ad Test"
    PAID = "Paid"
    CLOSED = "Closed"


class CreatorLink(BaseModel):
    raw_url: str
    platform: Platform
    normalized_url: str
    handle: str | None = None


class IntakeStep(StrEnum):
    AWAITING_PRODUCT = "awaiting_product"
    AWAITING_CAMPAIGN = "awaiting_campaign"
    AWAITING_REASON = "awaiting_reason"


class ProductChoice(BaseModel):
    id: str
    name: str


class CampaignChoice(BaseModel):
    id: str
    name: str


class TelegramIntakeState(BaseModel):
    chat_id: int
    user_id: int
    creator_link: CreatorLink
    step: IntakeStep = IntakeStep.AWAITING_PRODUCT
    product_choices: list[ProductChoice] = Field(default_factory=list)
    product_id: str | None = None
    product_name: str | None = None
    campaign_choices: list[CampaignChoice] = Field(default_factory=list)
    campaign_id: str | None = None
    campaign_name: str | None = None
    reason: str | None = None
    draft_reason: str | None = None


class CreatorProposalCreate(BaseModel):
    creator_id: str
    campaign_id: str
    proposed_by: str
    reason: str
    source: str = "Telegram"
    decision_status: ProposalStatus = ProposalStatus.PROPOSED


class EnrichmentRequest(BaseModel):
    creator_id: str
    platform: Platform
    profile_url: HttpUrl | str


class EnrichmentResult(BaseModel):
    handle: str | None = None
    display_name: str | None = None
    bio: str | None = None
    follower_count: int | None = None
    average_views: int | None = None
    recent_content_links: list[str] = Field(default_factory=list)
    raw: dict[str, Any] = Field(default_factory=dict)


class AISummaryRequest(BaseModel):
    campaign: dict[str, Any]
    creator: dict[str, Any]
    proposal_reason: str
    enrichment: dict[str, Any] | None = None


class AISummaryResult(BaseModel):
    niche: str | None = None
    suggested_tags: list[str] = Field(default_factory=list)
    brand_fit_score: int | None = None
    audience_fit_score: int | None = None
    raw: dict[str, Any] = Field(default_factory=dict)


class AISummaryJobRequest(BaseModel):
    creator_id: str
    campaign_id: str
    proposal_reason: str
    platform: Platform
    profile_url: str
    candidate_id: str | None = None
    enrichment: dict[str, Any] | None = None


class IntakeProductOption(BaseModel):
    id: str
    name: str
    status: str | None = None


class IntakeCampaignOption(BaseModel):
    id: str
    name: str
    product_id: str
    status: str | None = None


class IntakeOptionsResponse(BaseModel):
    products: list[IntakeProductOption]
    campaigns: list[IntakeCampaignOption]


class CreatorIntakeRequest(BaseModel):
    profile_url: str
    product_id: str
    campaign_id: str
    reason: str
    proposed_by: str | None = None


class CreatorIntakeResponse(BaseModel):
    status: str
    creator_id: str | None = None
    candidate_id: str | None = None
    creator_was_new: bool | None = None
    duplicate_candidate: dict[str, Any] | None = None
    message: str | None = None

