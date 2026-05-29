/** Maps deliverable review status to outreach pipeline and creator denormalized fields. */

export type DeliverableReviewStatus =
  | 'SUBMITTED'
  | 'NEEDS_REVISION'
  | 'APPROVED'
  | 'REJECTED'
  | 'READY_FOR_AD_TEST';

export type ReviewSyncTargets = {
  pipelineStatus: string;
  contentReviewStatus: DeliverableReviewStatus;
};

const REVIEW_TO_PIPELINE: Record<DeliverableReviewStatus, ReviewSyncTargets> = {
  SUBMITTED: {
    pipelineStatus: 'CONTENT_SUBMITTED',
    contentReviewStatus: 'SUBMITTED',
  },
  NEEDS_REVISION: {
    pipelineStatus: 'NEEDS_REVISION',
    contentReviewStatus: 'NEEDS_REVISION',
  },
  APPROVED: {
    pipelineStatus: 'APPROVED',
    contentReviewStatus: 'APPROVED',
  },
  REJECTED: {
    pipelineStatus: 'CLOSED',
    contentReviewStatus: 'REJECTED',
  },
  READY_FOR_AD_TEST: {
    pipelineStatus: 'READY_FOR_AD_TEST',
    contentReviewStatus: 'READY_FOR_AD_TEST',
  },
};

export function resolveReviewSyncTargets(
  reviewStatus: string | null | undefined,
): ReviewSyncTargets | null {
  if (!reviewStatus || !(reviewStatus in REVIEW_TO_PIPELINE)) {
    return null;
  }

  return REVIEW_TO_PIPELINE[reviewStatus as DeliverableReviewStatus];
}

export type SecondaryLinkItem = {
  url: string;
  label?: string | null;
};

export type LinksValue = {
  primaryLinkLabel?: string | null;
  primaryLinkUrl?: string | null;
  secondaryLinks?: SecondaryLinkItem[] | null;
} | null;

export function pickSubmittedLinkForOutreach(
  submissionLink: LinksValue,
  approvedAssetLink: LinksValue,
  reviewStatus: string | null | undefined,
): LinksValue {
  if (
    approvedAssetLink?.primaryLinkUrl &&
    (reviewStatus === 'APPROVED' || reviewStatus === 'READY_FOR_AD_TEST')
  ) {
    return {
      primaryLinkLabel: approvedAssetLink.primaryLinkLabel,
      primaryLinkUrl: approvedAssetLink.primaryLinkUrl,
      secondaryLinks: approvedAssetLink.secondaryLinks ?? null,
    };
  }

  if (submissionLink?.primaryLinkUrl) {
    return {
      primaryLinkLabel: submissionLink.primaryLinkLabel,
      primaryLinkUrl: submissionLink.primaryLinkUrl,
      secondaryLinks: submissionLink.secondaryLinks ?? null,
    };
  }

  return null;
}

/** Build a LINKS value with one primary URL and optional secondary draft versions. */
export function linksWithSecondary(
  primary: { label: string; url: string },
  secondaries: Array<{ label: string; url: string }> = [],
): LinksValue {
  return {
    primaryLinkLabel: primary.label,
    primaryLinkUrl: primary.url,
    secondaryLinks:
      secondaries.length > 0
        ? secondaries.map((item) => ({
            label: item.label,
            url: item.url,
          }))
        : null,
  };
}
