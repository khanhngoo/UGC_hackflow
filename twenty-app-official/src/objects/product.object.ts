import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';

import { PRODUCT_STATUS_OPTIONS } from 'src/constants/ugc-options';
import { UGC_FIELD_IDS, UGC_OBJECT_IDS } from 'src/constants/ugc-universal-identifiers';

export default defineObject({
  universalIdentifier: UGC_OBJECT_IDS.product,
  nameSingular: 'product',
  namePlural: 'products',
  labelSingular: 'Product',
  labelPlural: 'Products',
  description: 'Product promoted across one or more UGC campaigns.',
  icon: 'IconPackage',
  labelIdentifierFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.product.name,
  fields: [
    { universalIdentifier: UGC_FIELD_IDS.product.name, name: 'name', label: 'Name', type: FieldType.TEXT, icon: 'IconAbc' },
    { universalIdentifier: UGC_FIELD_IDS.product.description, name: 'description', label: 'Description', type: FieldType.TEXT, icon: 'IconNotes' },
    { universalIdentifier: UGC_FIELD_IDS.product.productPageLink, name: 'productPageLink', label: 'Product Page', type: FieldType.LINKS, icon: 'IconLink' },
    { universalIdentifier: UGC_FIELD_IDS.product.category, name: 'category', label: 'Category', type: FieldType.TEXT, icon: 'IconCategory' },
    {
      universalIdentifier: UGC_FIELD_IDS.product.status,
      name: 'status',
      label: 'Status',
      type: FieldType.SELECT,
      icon: 'IconProgress',
      options: [...PRODUCT_STATUS_OPTIONS],
    },
    {
      universalIdentifier: UGC_FIELD_IDS.product.campaigns,
      name: 'campaigns',
      label: 'Campaigns',
      type: FieldType.RELATION,
      icon: 'IconTargetArrow',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.campaign,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.productRef,
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
    },
    {
      universalIdentifier: UGC_FIELD_IDS.product.candidateRefs,
      name: 'candidateRefs',
      label: 'Review Candidates',
      type: FieldType.RELATION,
      icon: 'IconUserPlus',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.candidate,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.productRef,
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
    },
    {
      universalIdentifier: UGC_FIELD_IDS.product.outreachRefs,
      name: 'outreachRefs',
      label: 'Outreach Records',
      type: FieldType.RELATION,
      icon: 'IconSend',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.outreach,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.outreach.productRef,
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
    },
    {
      universalIdentifier: UGC_FIELD_IDS.product.deliverableRefs,
      name: 'deliverableRefs',
      label: 'Deliverables',
      type: FieldType.RELATION,
      icon: 'IconVideo',
      relationTargetObjectMetadataUniversalIdentifier: UGC_OBJECT_IDS.deliverable,
      relationTargetFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.productRef,
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
    },
  ],
});
