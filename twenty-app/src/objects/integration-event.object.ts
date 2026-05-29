import { FieldType, defineObject } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'integrationEvent',
  namePlural: 'integrationEvents',
  labelSingular: 'Integration Event',
  labelPlural: 'Integration Events',
  description: 'Operational log for Telegram, Twenty, Apify, AI, and future provider events.',
  fields: [
    { name: 'source', label: 'Source', type: FieldType.SELECT, options: ['Telegram', 'Twenty', 'Apify', 'AI', 'Email', 'Social API', 'Other'] },
    { name: 'externalId', label: 'External ID', type: FieldType.TEXT },
    { name: 'eventType', label: 'Event Type', type: FieldType.TEXT },
    { name: 'status', label: 'Status', type: FieldType.SELECT, options: ['Received', 'Processing', 'Succeeded', 'Failed', 'Skipped'] },
    { name: 'linkedObjectType', label: 'Linked Object Type', type: FieldType.TEXT },
    { name: 'linkedObjectId', label: 'Linked Object ID', type: FieldType.TEXT },
    { name: 'payloadSummary', label: 'Payload Summary', type: FieldType.TEXT },
    { name: 'errorMessage', label: 'Error Message', type: FieldType.TEXT },
    { name: 'processedAt', label: 'Processed At', type: FieldType.DATE_TIME },
  ],
});

