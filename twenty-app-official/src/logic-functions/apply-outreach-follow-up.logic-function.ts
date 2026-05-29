import { defineLogicFunction } from 'twenty-sdk/define';
import type {
  DatabaseEventPayload,
  ObjectRecordUpdateEvent,
} from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  computeNextFollowUpAt,
  shouldApplyNoReplyFollowUp,
} from 'src/constants/follow-up';

type OutreachRecord = {
  id: string;
  lastContactedAt?: string | null;
  replyStatus?: string | null;
  nextFollowUpAt?: string | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<OutreachRecord>>,
) => {
  const { after, before, updatedFields } = event.properties;

  const contactChanged =
    updatedFields?.includes('lastContactedAt') &&
    after.lastContactedAt &&
    after.lastContactedAt !== before?.lastContactedAt;

  if (!contactChanged || !shouldApplyNoReplyFollowUp(after.replyStatus)) {
    return { status: 'skipped' };
  }

  const client = new CoreApiClient();
  const nextFollowUpAt = computeNextFollowUpAt(after.lastContactedAt!);

  await client.mutation({
    updateOutreachRecord: {
      __args: {
        id: event.recordId,
        data: { nextFollowUpAt },
      },
      id: true,
      nextFollowUpAt: true,
    },
  });

  return { status: 'scheduled', nextFollowUpAt };
};

export default defineLogicFunction({
  universalIdentifier: '9c3f7a82-af78-4181-94c4-53df64bd2485',
  name: 'apply-outreach-follow-up',
  description:
    'Set nextFollowUpAt to 3 days after lastContactedAt when replyStatus is NO_REPLY.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'outreachRecord.updated',
    updatedFields: ['lastContactedAt', 'replyStatus'],
  },
});
