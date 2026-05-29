import {
  ViewKey,
  ViewOpenRecordIn,
  ViewSortDirection,
  ViewType,
  ViewVisibility,
  defineView,
} from 'twenty-sdk/define';

import {
  UGC_FIELD_IDS,
  UGC_OBJECT_IDS,
  UGC_VIEW_FIELD_IDS,
  UGC_VIEW_IDS,
  UGC_VIEW_SORT_IDS,
} from 'src/constants/ugc-universal-identifiers';

export default defineView({
  universalIdentifier: UGC_VIEW_IDS.campaigns,
  name: 'Campaigns',
  objectUniversalIdentifier: UGC_OBJECT_IDS.campaign,
  type: ViewType.TABLE,
  key: ViewKey.INDEX,
  icon: 'IconTargetArrow',
  position: 3,
  visibility: ViewVisibility.WORKSPACE,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  fields: [
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.name, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.name, position: 0, size: 200 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.productRef, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.productRef, position: 1, size: 140 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.budget, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.budget, position: 2, size: 120 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.budgetUsed, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.budgetUsed, position: 3, size: 120 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.budgetUsePercent, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.budgetUsePercent, position: 4, size: 110 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.briefDocumentLink, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.briefDocumentLink, position: 5, size: 160 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.format, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.format, position: 6, size: 120 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.deadline, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.deadline, position: 7, size: 150 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.productDescription, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.productDescription, position: 8, size: 200 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.targetAudience, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.targetAudience, position: 9, size: 180 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.submissionInstruction, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.submissionInstruction, position: 10, size: 200 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.objective, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.objective, position: 11, size: 180 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.campaigns.status, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.status, position: 12, size: 120 },
  ],
  sorts: [
    {
      universalIdentifier: UGC_VIEW_SORT_IDS.campaignsName,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.campaign.name,
      direction: ViewSortDirection.ASC,
    },
  ],
});
