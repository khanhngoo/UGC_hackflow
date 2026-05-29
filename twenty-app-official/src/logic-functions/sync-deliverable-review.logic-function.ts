import { defineLogicFunction } from 'twenty-sdk/define';
import type {
  DatabaseEventPayload,
  ObjectRecordUpdateEvent,
} from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  type LinksValue,
  pickSubmittedLinkForOutreach,
  resolveReviewSyncTargets,
} from 'src/constants/deliverable-review';

type DeliverableRecord = {
  id: string;
  creatorId?: string | null;
  campaignId?: string | null;
  reviewStatus?: string | null;
  submissionLink?: LinksValue;
  approvedAssetLink?: LinksValue;
  submittedAt?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<DeliverableRecord>>,
) => {
  const { after, before, updatedFields } = event.properties;
  const client = new CoreApiClient();

  const reviewChanged =
    updatedFields?.includes('reviewStatus') ||
    updatedFields?.includes('submissionLink') ||
    updatedFields?.includes('approvedAssetLink');

  if (!reviewChanged && !updatedFields?.includes('submissionLink')) {
    return { status: 'skipped' };
  }

  const deliverablePatch: Record<string, unknown> = {};

  if (
    after.submissionLink?.primaryLinkUrl &&
    !after.submittedAt &&
    (updatedFields?.includes('submissionLink') || !before?.submittedAt)
  ) {
    deliverablePatch.submittedAt = new Date().toISOString();
  }

  if (Object.keys(deliverablePatch).length > 0) {
    await client.mutation({
      updateDeliverable: {
        __args: {
          id: event.recordId,
          data: deliverablePatch,
        },
        id: true,
        submittedAt: true,
      },
    });
  }

  const syncTargets = resolveReviewSyncTargets(after.reviewStatus);

  if (!syncTargets || !after.creatorId || !after.campaignId) {
    return { status: 'deliverable_only', deliverablePatch };
  }

  const outreachResult = await client.query({
    outreachRecords: {
      __args: {
        filter: {
          and: [
            { creatorId: { eq: after.creatorId } },
            { campaignId: { eq: after.campaignId } },
          ],
        },
        first: 1,
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  });

  const outreachId = outreachResult.outreachRecords?.edges?.[0]?.node?.id;

  if (!outreachId) {
    return { status: 'no_outreach', syncTargets };
  }

  const submitted = pickSubmittedLinkForOutreach(
    after.submissionLink,
    after.approvedAssetLink,
    after.reviewStatus,
  );

  const outreachData: Record<string, unknown> = {
    pipelineStatus: syncTargets.pipelineStatus,
  };

  if (submitted) {
    outreachData.submitted = submitted;
  }

  await client.mutation({
    updateOutreachRecord: {
      __args: {
        id: outreachId,
        data: outreachData,
      },
      id: true,
      pipelineStatus: true,
    },
  });

  await client.mutation({
    updateCreator: {
      __args: {
        id: after.creatorId,
        data: {
          contentReviewStatus: syncTargets.contentReviewStatus,
          pipelineStatus: syncTargets.pipelineStatus,
        },
      },
      id: true,
      contentReviewStatus: true,
      pipelineStatus: true,
    },
  });

  return {
    status: 'synced',
    outreachId,
    pipelineStatus: syncTargets.pipelineStatus,
  };
};

export default defineLogicFunction({
  universalIdentifier: '08acd946-1897-46bb-862c-8690dc1d618e',
  name: 'sync-deliverable-review',
  description:
    'Sync deliverable review status to outreach pipeline, submitted link, and creator contentReviewStatus.',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'deliverable.updated',
    updatedFields: ['reviewStatus', 'submissionLink', 'approvedAssetLink'],
  },
});
