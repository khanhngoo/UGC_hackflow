import { defineLogicFunction } from 'twenty-sdk/define';
import type {
  DatabaseEventPayload,
  ObjectRecordUpdateEvent,
} from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import type { LinksValue } from 'src/constants/deliverable-review';

type RelationRef = { id?: string | null } | null;

type CampaignCreatorCandidate = {
  id: string;
  status?: string | null;
  creatorId?: string | null;
  campaignId?: string | null;
  productId?: string | null;
  creator?: RelationRef;
  campaign?: RelationRef;
  productRef?: RelationRef;
  creatorHandle?: string | null;
  creatorHandleLink?: LinksValue;
  proposedBy?: string | null;
};

const handleLabel = (link?: LinksValue, fallback?: string | null) =>
  link?.primaryLinkLabel ?? fallback ?? undefined;

const resolveId = (
  directId?: string | null,
  relation?: RelationRef,
): string | undefined => directId ?? relation?.id ?? undefined;

const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<CampaignCreatorCandidate>>,
) => {
  const { after, before } = event.properties;

  if (after.status !== 'APPROVED_TO_CONTACT' || before?.status === 'APPROVED_TO_CONTACT') {
    return { status: 'skipped' };
  }

  const client = new CoreApiClient();

  const loaded = await client.query({
    campaignCreatorCandidate: {
      __args: { filter: { id: { eq: event.recordId } } },
      id: true,
      status: true,
      creatorId: true,
      campaignId: true,
      productId: true,
      creatorHandle: true,
      creatorHandleLink: {
        primaryLinkLabel: true,
        primaryLinkUrl: true,
        secondaryLinks: true,
      },
      proposedBy: true,
      creator: { id: true, price: true },
      campaign: { id: true, name: true },
      productRef: { id: true },
    },
  });

  const candidate = loaded.campaignCreatorCandidate;
  if (!candidate) {
    return { status: 'error', reason: 'candidate not found' };
  }

  const creatorId = resolveId(candidate.creatorId, candidate.creator);
  const campaignId = resolveId(candidate.campaignId, candidate.campaign);
  const productRefId = resolveId(candidate.productId, candidate.productRef);

  if (!creatorId || !campaignId) {
    return { status: 'error', reason: 'missing creator or campaign' };
  }

  const existing = await client.query({
    outreachRecords: {
      __args: {
        filter: {
          candidateId: { eq: event.recordId },
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

  if (existing.outreachRecords?.edges?.length) {
    return {
      status: 'exists',
      outreachId: existing.outreachRecords.edges[0].node.id,
    };
  }

  const creatorPrice = candidate.creator?.price ?? undefined;
  const activeCampaignName = candidate.campaign?.name ?? undefined;

  const outreach = await client.mutation({
    createOutreachRecord: {
      __args: {
        data: {
          candidateId: event.recordId,
          creatorId,
          campaignId,
          productRefId: productRefId ?? undefined,
          creatorHandle: handleLabel(candidate.creatorHandleLink, candidate.creatorHandle),
          creatorHandleLink: candidate.creatorHandleLink ?? undefined,
          creatorPrice,
          member: candidate.proposedBy ?? undefined,
          pipelineStatus: 'APPROVED_TO_CONTACT',
          replyStatus: 'NO_REPLY',
        },
      },
      id: true,
      creatorHandleLink: true,
    },
  });

  await client.mutation({
    updateCreator: {
      __args: {
        id: creatorId,
        data: {
          reviewStatus: 'APPROVED_TO_CONTACT',
          pipelineStatus: 'APPROVED_TO_CONTACT',
          outreachOwner: candidate.proposedBy ?? undefined,
          activeCampaignName,
        },
      },
      id: true,
    },
  });

  return { status: 'created', outreachId: outreach.createOutreachRecord.id };
};

export default defineLogicFunction({
  universalIdentifier: '6c19e5e3-e8a1-4981-a638-48d8c834a130',
  name: 'approve-candidate-handoff',
  description:
    'Create an OutreachRecord when a candidate is approved to contact.',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'campaignCreatorCandidate.updated',
    updatedFields: ['status'],
  },
});
