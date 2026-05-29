import { defineObject, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import { UGC_FIELD_IDS, UGC_OBJECT_IDS } from 'src/constants/ugc-universal-identifiers';

/** Legacy object kept for deliverable relations; creative brief content lives on Campaign. */
export default defineObject({
  universalIdentifier: UGC_OBJECT_IDS.brief,
  nameSingular: 'brief',
  namePlural: 'briefs',
  labelSingular: 'Brief',
  labelPlural: 'Briefs',
  description: 'Legacy brief record linked from deliverables; use Campaign for brief content.',
  icon: 'IconClipboardText',
  labelIdentifierFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.brief.legacyName,
  fields: [
    {
      universalIdentifier: UGC_FIELD_IDS.brief.legacyName,
      name: 'legacyName',
      label: 'Name',
      type: FieldType.TEXT,
      icon: 'IconAbc',
    },
    {
      universalIdentifier: UGC_FIELD_IDS.brief.campaign,
      name: 'campaign',
      label: 'Campaign',
      type: FieldType.RELATION,
      icon: 'IconTargetArrow',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.campaign,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.briefs,
      universalSettings: { relationType: RelationType.MANY_TO_ONE, onDelete: OnDeleteAction.SET_NULL, joinColumnName: 'campaignId' },
      isNullable: true,
    },
    {
      universalIdentifier: UGC_FIELD_IDS.brief.deliverables,
      name: 'deliverables',
      label: 'Deliverables',
      type: FieldType.RELATION,
      icon: 'IconVideo',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.deliverable,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.brief,
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
    },
  ],
});
