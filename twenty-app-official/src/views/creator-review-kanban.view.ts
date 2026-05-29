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
  UGC_VIEW_GROUP_IDS,
  UGC_VIEW_IDS,
  UGC_VIEW_SORT_IDS,
} from 'src/constants/ugc-universal-identifiers';

export default defineView({
  universalIdentifier: UGC_VIEW_IDS.creatorReviewKanban,
  name: 'Creator Review',
  objectUniversalIdentifier: UGC_OBJECT_IDS.candidate,
  type: ViewType.KANBAN,
  key: ViewKey.INDEX,
  icon: 'IconClipboardCheck',
  position: 1,
  visibility: ViewVisibility.WORKSPACE,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  mainGroupByFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.status,
  fields: [
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.creatorHandleLink, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.creatorHandleLink, position: 0, size: 140 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.productRef, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.productRef, position: 1, size: 120 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.campaign, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.campaign, position: 2, size: 160 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.creator, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.creator, position: 3, size: 160 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.reason, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.reason, position: 4, size: 200 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.creatorNiche, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.creatorNiche, position: 5, size: 120 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.creatorTags, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.candidateTagList, position: 6, size: 160 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.creatorCountry, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.creatorCountry, position: 7, size: 100 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.creatorFollowerCount, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.creatorFollowerCount, position: 8, size: 120 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.creatorMedianViewsRecent, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.creatorMedianViewsRecent, position: 9, size: 130 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.creatorEngagementRate, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.creatorEngagementRate, position: 10, size: 120 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.creatorBrandFitRating, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.creatorBrandFitRating, position: 11, size: 120 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.creatorAudienceFitRating, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.creatorAudienceFitRating, position: 12, size: 120 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.creatorReviewKanban.proposedBy, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.proposedBy, position: 13, size: 100 },
  ],
  groups: [
    { universalIdentifier: UGC_VIEW_GROUP_IDS.creatorReviewKanban.proposed, fieldValue: 'PROPOSED', position: 0, isVisible: true },
    { universalIdentifier: UGC_VIEW_GROUP_IDS.creatorReviewKanban.underReview, fieldValue: 'UNDER_REVIEW', position: 1, isVisible: true },
    { universalIdentifier: UGC_VIEW_GROUP_IDS.creatorReviewKanban.approvedToContact, fieldValue: 'APPROVED_TO_CONTACT', position: 2, isVisible: true },
    { universalIdentifier: UGC_VIEW_GROUP_IDS.creatorReviewKanban.needsMoreInfo, fieldValue: 'NEEDS_MORE_INFO', position: 3, isVisible: true },
    { universalIdentifier: UGC_VIEW_GROUP_IDS.creatorReviewKanban.rejected, fieldValue: 'REJECTED', position: 4, isVisible: true },
    { universalIdentifier: UGC_VIEW_GROUP_IDS.creatorReviewKanban.duplicate, fieldValue: 'DUPLICATE', position: 5, isVisible: true },
  ],
  sorts: [
    {
      universalIdentifier: UGC_VIEW_SORT_IDS.creatorReviewKanbanFollowerCount,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.candidate.creatorFollowerCount,
      direction: ViewSortDirection.DESC,
    },
  ],
});
