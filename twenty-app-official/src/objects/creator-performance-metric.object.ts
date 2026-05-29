import { defineObject, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import { UGC_FIELD_IDS, UGC_OBJECT_IDS } from 'src/constants/ugc-universal-identifiers';

export default defineObject({
  universalIdentifier: UGC_OBJECT_IDS.creatorPerformanceMetric,
  nameSingular: 'creatorPerformanceMetric',
  namePlural: 'creatorPerformanceMetrics',
  labelSingular: 'Creator Performance Metric',
  labelPlural: 'Creator Performance Metrics',
  description: 'Creator and deliverable performance values used by the creator database table.',
  icon: 'IconChartLine',
  labelIdentifierFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.source,
  fields: [
    {
      universalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.creator,
      name: 'creator',
      label: 'Creator',
      type: FieldType.RELATION,
      icon: 'IconUserStar',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.creator,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.creator.creatorPerformanceMetrics,
      universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.SET_NULL, joinColumnName: 'creatorId' },
      isNullable: true,
    },
    {
      universalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.campaign,
      name: 'campaign',
      label: 'Campaign',
      type: FieldType.RELATION,
      icon: 'IconTargetArrow',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.campaign,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.creatorPerformanceMetrics,
      universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.SET_NULL, joinColumnName: 'campaignId' },
      isNullable: true,
    },
    {
      universalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.deliverable,
      name: 'deliverable',
      label: 'Deliverable',
      type: FieldType.RELATION,
      icon: 'IconVideo',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.deliverable,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.performanceMetrics,
      universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.SET_NULL, joinColumnName: 'deliverableId' },
      isNullable: true,
    },
    { universalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.views, name: 'views', label: 'Views', type: FieldType.NUMBER, icon: 'IconEye' },
    { universalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.clicks, name: 'clicks', label: 'Clicks', type: FieldType.NUMBER, icon: 'IconClick' },
    { universalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.conversions, name: 'conversions', label: 'Conversions', type: FieldType.NUMBER, icon: 'IconUserCheck' },
    { universalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.spend, name: 'spend', label: 'Spend', type: FieldType.NUMBER, icon: 'IconCurrencyDollar' },
    { universalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.source, name: 'source', label: 'Source', type: FieldType.TEXT, icon: 'IconDatabase' },
    { universalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.dateRangeStart, name: 'dateRangeStart', label: 'Date Range Start', type: FieldType.DATE, icon: 'IconCalendar' },
    { universalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.dateRangeEnd, name: 'dateRangeEnd', label: 'Date Range End', type: FieldType.DATE, icon: 'IconCalendarDue' },
    { universalIdentifier: UGC_FIELD_IDS.creatorPerformanceMetric.notes, name: 'notes', label: 'Notes', type: FieldType.TEXT, icon: 'IconNotes' },
  ],
});

