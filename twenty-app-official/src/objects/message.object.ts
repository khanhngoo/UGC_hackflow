import { defineObject, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import { CHANNEL_OPTIONS } from 'src/constants/ugc-options';
import { UGC_FIELD_IDS, UGC_OBJECT_IDS } from 'src/constants/ugc-universal-identifiers';

export default defineObject({
  universalIdentifier: UGC_OBJECT_IDS.message,
  nameSingular: 'creatorMessage',
  namePlural: 'creatorMessages',
  labelSingular: 'Message',
  labelPlural: 'Messages',
  description: 'Sent, received, or manually logged message.',
  icon: 'IconMessage2',
  labelIdentifierFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.message.body,
  fields: [
    {
      universalIdentifier: UGC_FIELD_IDS.message.thread,
      name: 'thread',
      label: 'Thread',
      type: FieldType.RELATION,
      icon: 'IconMessages',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.messageThread,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.messageThread.messages,
      universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.CASCADE, joinColumnName: 'threadId' },
    },
    {
      universalIdentifier: UGC_FIELD_IDS.message.direction,
      name: 'direction',
      label: 'Direction',
      type: FieldType.SELECT,
      icon: 'IconArrowsExchange',
      options: [
        { value: 'OUTBOUND', label: 'Outbound', position: 0, color: 'blue' },
        { value: 'INBOUND', label: 'Inbound', position: 1, color: 'green' },
        { value: 'INTERNAL_NOTE', label: 'Internal Note', position: 2, color: 'gray' },
      ],
    },
    { universalIdentifier: UGC_FIELD_IDS.message.channel, name: 'channel', label: 'Channel', type: FieldType.SELECT, icon: 'IconMessage', options: [...CHANNEL_OPTIONS] },
    { universalIdentifier: UGC_FIELD_IDS.message.body, name: 'body', label: 'Body', type: FieldType.TEXT, icon: 'IconTextCaption' },
    { universalIdentifier: UGC_FIELD_IDS.message.externalMessageId, name: 'externalMessageId', label: 'External Message ID', type: FieldType.TEXT, icon: 'IconHash' },
    { universalIdentifier: UGC_FIELD_IDS.message.sentOrReceivedAt, name: 'sentOrReceivedAt', label: 'Sent Or Received At', type: FieldType.DATE_TIME, icon: 'IconCalendarTime', isNullable: true },
    {
      universalIdentifier: UGC_FIELD_IDS.message.syncStatus,
      name: 'syncStatus',
      label: 'Sync Status',
      type: FieldType.SELECT,
      icon: 'IconRefresh',
      options: [
        { value: 'MANUAL', label: 'Manual', position: 0, color: 'gray' },
        { value: 'SYNCED', label: 'Synced', position: 1, color: 'green' },
        { value: 'FAILED', label: 'Failed', position: 2, color: 'red' },
      ],
    },
  ],
});
