import { describe, expect, it } from 'vitest';

import {
  linksWithSecondary,
  pickSubmittedLinkForOutreach,
  resolveReviewSyncTargets,
} from 'src/constants/deliverable-review';

describe('resolveReviewSyncTargets', () => {
  it('maps review status to pipeline and creator fields', () => {
    expect(resolveReviewSyncTargets('SUBMITTED')).toEqual({
      pipelineStatus: 'CONTENT_SUBMITTED',
      contentReviewStatus: 'SUBMITTED',
    });
    expect(resolveReviewSyncTargets('REJECTED')).toEqual({
      pipelineStatus: 'CLOSED',
      contentReviewStatus: 'REJECTED',
    });
    expect(resolveReviewSyncTargets('READY_FOR_AD_TEST')).toEqual({
      pipelineStatus: 'READY_FOR_AD_TEST',
      contentReviewStatus: 'READY_FOR_AD_TEST',
    });
  });
});

describe('pickSubmittedLinkForOutreach', () => {
  const submission = {
    primaryLinkLabel: 'Draft',
    primaryLinkUrl: 'https://example.com/draft',
    secondaryLinks: null,
  };
  const approved = {
    primaryLinkLabel: 'Final',
    primaryLinkUrl: 'https://example.com/final',
    secondaryLinks: null,
  };

  it('uses approved asset when status is approved', () => {
    expect(
      pickSubmittedLinkForOutreach(submission, approved, 'APPROVED'),
    ).toEqual(approved);
  });

  it('falls back to submission link', () => {
    expect(
      pickSubmittedLinkForOutreach(submission, null, 'SUBMITTED'),
    ).toEqual(submission);
  });

  it('preserves secondary links on submission', () => {
    const withSecondary = linksWithSecondary(
      { label: 'Draft v1', url: 'https://example.com/v1' },
      [{ label: 'Draft v2', url: 'https://example.com/v2' }],
    );
    expect(
      pickSubmittedLinkForOutreach(withSecondary, null, 'SUBMITTED'),
    ).toEqual(withSecondary);
  });
});
