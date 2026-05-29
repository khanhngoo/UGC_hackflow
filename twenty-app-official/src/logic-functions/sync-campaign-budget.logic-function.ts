import { defineLogicFunction } from 'twenty-sdk/define';
import type {
  DatabaseEventPayload,
  ObjectRecordUpdateEvent,
} from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { computeBudgetUsePercent } from 'src/constants/campaign-budget';

type CampaignRecord = {
  id: string;
  budget?: number | null;
  budgetUsed?: number | null;
  budgetUsePercent?: number | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<CampaignRecord>>,
) => {
  const { after } = event.properties;
  const nextPercent = computeBudgetUsePercent(after.budget, after.budgetUsed);

  if (nextPercent === after.budgetUsePercent) {
    return { status: 'skipped' };
  }

  const client = new CoreApiClient();

  await client.mutation({
    updateCampaign: {
      __args: {
        id: event.recordId,
        data: { budgetUsePercent: nextPercent },
      },
      id: true,
      budgetUsePercent: true,
    },
  });

  return { status: 'updated', budgetUsePercent: nextPercent };
};

export default defineLogicFunction({
  universalIdentifier: '7d8e9f0a-1b2c-4d3e-af4b-5c6d7e8f9a0c',
  name: 'sync-campaign-budget',
  description:
    'Recompute campaign budgetUsePercent when budget or budgetUsed changes.',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'campaign.updated',
    updatedFields: ['budget', 'budgetUsed'],
  },
});
