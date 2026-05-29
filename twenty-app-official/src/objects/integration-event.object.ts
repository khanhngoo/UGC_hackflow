import { defineObject, FieldType } from 'twenty-sdk/define';

import { UGC_FIELD_IDS, UGC_OBJECT_IDS } from 'src/constants/ugc-universal-identifiers';

export default defineObject({
  universalIdentifier: UGC_OBJECT_IDS.integrationEvent,
  nameSingular: 'integrationEvent',
  namePlural: 'integrationEvents',
  labelSingular: 'Integration Event',
  labelPlural: 'Integration Events',
  description: 'Operational log for Telegram, Twenty, Apify, AI, messaging, and future provider events.',
  icon: 'IconPlugConnected',
  labelIdentifierFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.integrationEvent.eventType,
  fields: [
    { universalIdentifier: UGC_FIELD_IDS.integrationEvent.source, name: 'source', label: 'Source', type: FieldType.TEXT, icon: 'IconPlug' },
    { universalIdentifier: UGC_FIELD_IDS.integrationEvent.externalId, name: 'externalId', label: 'External ID', type: FieldType.TEXT, icon: 'IconHash' },
    { universalIdentifier: UGC_FIELD_IDS.integrationEvent.eventType, name: 'eventType', label: 'Event Type', type: FieldType.TEXT, icon: 'IconBolt' },
    {
      universalIdentifier: UGC_FIELD_IDS.integrationEvent.status,
      name: 'status',
      label: 'Status',
      type: FieldType.SELECT,
      icon: 'IconProgress',
      options: [
        { value: 'RECEIVED', label: 'Received', position: 0, color: 'gray' },
        { value: 'PROCESSING', label: 'Processing', position: 1, color: 'yellow' },
        { value: 'SUCCEEDED', label: 'Succeeded', position: 2, color: 'green' },
        { value: 'FAILED', label: 'Failed', position: 3, color: 'red' },
        { value: 'SKIPPED', label: 'Skipped', position: 4, color: 'orange' },
      ],
    },
    { universalIdentifier: UGC_FIELD_IDS.integrationEvent.linkedObjectType, name: 'linkedObjectType', label: 'Linked Object Type', type: FieldType.TEXT, icon: 'IconBox' },
    { universalIdentifier: UGC_FIELD_IDS.integrationEvent.linkedObjectId, name: 'linkedObjectId', label: 'Linked Object ID', type: FieldType.TEXT, icon: 'IconHash' },
    { universalIdentifier: UGC_FIELD_IDS.integrationEvent.payloadSummary, name: 'payloadSummary', label: 'Payload Summary', type: FieldType.TEXT, icon: 'IconJson' },
    { universalIdentifier: UGC_FIELD_IDS.integrationEvent.errorMessage, name: 'errorMessage', label: 'Error Message', type: FieldType.TEXT, icon: 'IconAlertTriangle' },
    { universalIdentifier: UGC_FIELD_IDS.integrationEvent.processedAt, name: 'processedAt', label: 'Processed At', type: FieldType.DATE_TIME, icon: 'IconCalendarTime', isNullable: true },
  ],
});
