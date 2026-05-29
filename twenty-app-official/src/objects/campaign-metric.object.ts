import { defineObject, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import { UGC_FIELD_IDS, UGC_OBJECT_IDS } from 'src/constants/ugc-universal-identifiers';

export default defineObject({
  universalIdentifier: UGC_OBJECT_IDS.campaignMetric,
  nameSingular: 'campaignMetric',
  namePlural: 'campaignMetrics',
  labelSingular: 'Campaign Metric',
  labelPlural: 'Campaign Metrics',
  description: 'Campaign goal and actual metric tracking.',
  icon: 'IconChartBar',
  labelIdentifierFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaignMetric.metricName,
  fields: [
    {
      universalIdentifier: UGC_FIELD_IDS.campaignMetric.campaign,
      name: 'campaign',
      label: 'Campaign',
      type: FieldType.RELATION,
      icon: 'IconTargetArrow',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.campaign,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.campaignMetrics,
      universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.SET_NULL, joinColumnName: 'campaignId' },
      isNullable: true,
    },
    { universalIdentifier: UGC_FIELD_IDS.campaignMetric.metricName, name: 'metricName', label: 'Metric Name', type: FieldType.TEXT, icon: 'IconAbc' },
    { universalIdentifier: UGC_FIELD_IDS.campaignMetric.targetValue, name: 'targetValue', label: 'Target Value', type: FieldType.NUMBER, icon: 'IconTarget' },
    { universalIdentifier: UGC_FIELD_IDS.campaignMetric.actualValue, name: 'actualValue', label: 'Actual Value', type: FieldType.NUMBER, icon: 'IconChartBar' },
    { universalIdentifier: UGC_FIELD_IDS.campaignMetric.dateRangeStart, name: 'dateRangeStart', label: 'Date Range Start', type: FieldType.DATE, icon: 'IconCalendar' },
    { universalIdentifier: UGC_FIELD_IDS.campaignMetric.dateRangeEnd, name: 'dateRangeEnd', label: 'Date Range End', type: FieldType.DATE, icon: 'IconCalendarDue' },
    { universalIdentifier: UGC_FIELD_IDS.campaignMetric.owner, name: 'owner', label: 'Owner', type: FieldType.TEXT, icon: 'IconUser' },
    { universalIdentifier: UGC_FIELD_IDS.campaignMetric.source, name: 'source', label: 'Source', type: FieldType.TEXT, icon: 'IconDatabase' },
    { universalIdentifier: UGC_FIELD_IDS.campaignMetric.notes, name: 'notes', label: 'Notes', type: FieldType.TEXT, icon: 'IconNotes' },
  ],
});

