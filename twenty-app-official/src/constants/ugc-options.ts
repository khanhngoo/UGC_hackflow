/** Star scale for brand/audience fit (Twenty RATING fields require option ids). */
export const FIT_RATING_OPTIONS = [
  { id: 'f1a10001-0001-4001-8001-000000000001', value: 'RATING_1', label: '1', position: 0, color: 'red' },
  { id: 'f1a10001-0001-4001-8001-000000000002', value: 'RATING_2', label: '2', position: 1, color: 'orange' },
  { id: 'f1a10001-0001-4001-8001-000000000003', value: 'RATING_3', label: '3', position: 2, color: 'yellow' },
  { id: 'f1a10001-0001-4001-8001-000000000004', value: 'RATING_4', label: '4', position: 3, color: 'green' },
  { id: 'f1a10001-0001-4001-8001-000000000005', value: 'RATING_5', label: '5', position: 4, color: 'green' },
] as const;

export const CREATOR_TAG_OPTIONS = [
  { value: 'ROUTINE', label: 'Routine', position: 0, color: 'blue' },
  { value: 'PRODUCT_DEMO', label: 'Product Demo', position: 1, color: 'green' },
  { value: 'CLEAN_BEAUTY', label: 'Clean Beauty', position: 2, color: 'turquoise' },
  { value: 'UNBOXING', label: 'Unboxing', position: 3, color: 'purple' },
  { value: 'GIFT_GUIDE', label: 'Gift Guide', position: 4, color: 'pink' },
  { value: 'LIFESTYLE', label: 'Lifestyle', position: 5, color: 'yellow' },
  { value: 'WELLNESS', label: 'Wellness', position: 6, color: 'green' },
  { value: 'MORNING_ROUTINE', label: 'Morning Routine', position: 7, color: 'orange' },
  { value: 'HYDRATION', label: 'Hydration', position: 8, color: 'sky' },
  { value: 'SKINCARE', label: 'Skincare', position: 9, color: 'pink' },
  { value: 'FITNESS', label: 'Fitness', position: 10, color: 'red' },
  { value: 'DESK_SETUP', label: 'Desk Setup', position: 11, color: 'gray' },
  { value: 'REVIEWS', label: 'Reviews', position: 12, color: 'gray' },
] as const;

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', position: 0, color: 'green' },
  { value: 'ARCHIVED', label: 'Archived', position: 1, color: 'gray' },
] as const;

export const PLATFORM_OPTIONS = [
  { value: 'TIKTOK', label: 'TikTok', position: 0, color: 'pink' },
  { value: 'INSTAGRAM', label: 'Instagram', position: 1, color: 'purple' },
  { value: 'YOUTUBE', label: 'YouTube', position: 2, color: 'red' },
  { value: 'X', label: 'X', position: 3, color: 'gray' },
  { value: 'OTHER', label: 'Other', position: 4, color: 'gray' },
] as const;

export const CANDIDATE_STATUS_OPTIONS = [
  { value: 'PROPOSED', label: 'Proposed', position: 0, color: 'gray' },
  { value: 'UNDER_REVIEW', label: 'Under Review', position: 1, color: 'yellow' },
  { value: 'APPROVED_TO_CONTACT', label: 'Approved to Contact', position: 2, color: 'green' },
  { value: 'NEEDS_MORE_INFO', label: 'Needs More Info', position: 3, color: 'orange' },
  { value: 'REJECTED', label: 'Rejected', position: 4, color: 'red' },
  { value: 'DUPLICATE', label: 'Duplicate', position: 5, color: 'gray' },
] as const;

export const PIPELINE_STATUS_OPTIONS = [
  { value: 'APPROVED_TO_CONTACT', label: 'Approved to Contact', position: 0, color: 'green' },
  { value: 'CONTACTED', label: 'Contacted', position: 1, color: 'blue' },
  { value: 'REPLIED', label: 'Replied', position: 2, color: 'turquoise' },
  { value: 'NEEDS_FOLLOW_UP', label: 'Needs Follow-Up', position: 3, color: 'yellow' },
  { value: 'DEAL_CONFIRMED', label: 'Deal Confirmed', position: 4, color: 'purple' },
  { value: 'BRIEF_SENT', label: 'Brief Sent', position: 5, color: 'purple' },
  { value: 'CONTENT_SUBMITTED', label: 'Content Submitted', position: 6, color: 'pink' },
  { value: 'NEEDS_REVISION', label: 'Needs Revision', position: 7, color: 'orange' },
  { value: 'APPROVED', label: 'Approved', position: 8, color: 'green' },
  { value: 'READY_FOR_AD_TEST', label: 'Ready for Ad Test', position: 9, color: 'sky' },
  { value: 'PAID', label: 'Paid', position: 10, color: 'blue' },
  { value: 'CLOSED', label: 'Closed', position: 11, color: 'gray' },
] as const;

export const ENGAGEMENT_QUALITY_OPTIONS = [
  { value: 'HIGH', label: 'High', position: 0, color: 'green' },
  { value: 'MEDIUM', label: 'Medium', position: 1, color: 'yellow' },
  { value: 'LOW', label: 'Low', position: 2, color: 'orange' },
  { value: 'UNKNOWN', label: 'Unknown', position: 3, color: 'gray' },
] as const;

export const REPLY_STATUS_OPTIONS = [
  { value: 'NO_REPLY', label: 'No Reply', position: 0, color: 'gray' },
  { value: 'REPLIED', label: 'Replied', position: 1, color: 'green' },
  { value: 'INTERESTED', label: 'Interested', position: 2, color: 'blue' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', position: 3, color: 'red' },
] as const;

export const DELIVERABLE_REVIEW_STATUS_OPTIONS = [
  { value: 'SUBMITTED', label: 'Submitted', position: 0, color: 'gray' },
  { value: 'NEEDS_REVISION', label: 'Needs Revision', position: 1, color: 'orange' },
  { value: 'APPROVED', label: 'Approved', position: 2, color: 'green' },
  { value: 'REJECTED', label: 'Rejected', position: 3, color: 'red' },
  { value: 'READY_FOR_AD_TEST', label: 'Ready for Ad Test', position: 4, color: 'blue' },
] as const;

export const CHANNEL_OPTIONS = [
  { value: 'EMAIL', label: 'Email', position: 0, color: 'blue' },
  { value: 'INSTAGRAM_DM', label: 'Instagram DM', position: 1, color: 'purple' },
  { value: 'TIKTOK_DM', label: 'TikTok DM', position: 2, color: 'pink' },
  { value: 'MANUAL', label: 'Manual', position: 3, color: 'gray' },
] as const;

export const DRAFT_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft', position: 0, color: 'gray' },
  { value: 'APPROVED', label: 'Approved', position: 1, color: 'green' },
  { value: 'SENT_MANUALLY', label: 'Sent Manually', position: 2, color: 'blue' },
  { value: 'SKIPPED', label: 'Skipped', position: 3, color: 'orange' },
  { value: 'CANCELLED', label: 'Cancelled', position: 4, color: 'red' },
] as const;

export const TASK_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', position: 0, color: 'gray' },
  { value: 'DRAFT_GENERATED', label: 'Draft Generated', position: 1, color: 'yellow' },
  { value: 'SENT_MANUALLY', label: 'Sent Manually', position: 2, color: 'blue' },
  { value: 'SKIPPED', label: 'Skipped', position: 3, color: 'orange' },
  { value: 'CANCELLED', label: 'Cancelled', position: 4, color: 'red' },
] as const;
