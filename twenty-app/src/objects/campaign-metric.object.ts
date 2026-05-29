import { FieldType, defineObject } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'campaignMetric',
  namePlural: 'campaignMetrics',
  labelSingular: 'Campaign Metric',
  labelPlural: 'Campaign Metrics',
  description: 'Goal and actual metric values for campaign reporting.',
  fields: [
    { name: 'campaign', label: 'Campaign', type: FieldType.RELATION, targetObject: 'campaign' },
    { name: 'metricName', label: 'Metric Name', type: FieldType.TEXT },
    { name: 'targetValue', label: 'Target Value', type: FieldType.NUMBER },
    { name: 'actualValue', label: 'Actual Value', type: FieldType.NUMBER },
    { name: 'dateRangeStart', label: 'Date Range Start', type: FieldType.DATE },
    { name: 'dateRangeEnd', label: 'Date Range End', type: FieldType.DATE },
    { name: 'owner', label: 'Owner', type: FieldType.TEXT },
    { name: 'source', label: 'Source', type: FieldType.SELECT, options: ['Manual', 'Twenty', 'Ad Platform', 'Social API', 'Other'] },
    { name: 'notes', label: 'Notes', type: FieldType.TEXT },
  ],
});

