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
  universalIdentifier: UGC_VIEW_IDS.contentReviewKanban,
  name: 'Content Review',
  objectUniversalIdentifier: UGC_OBJECT_IDS.deliverable,
  type: ViewType.KANBAN,
  key: ViewKey.INDEX,
  icon: 'IconVideo',
  position: 4,
  visibility: ViewVisibility.WORKSPACE,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  mainGroupByFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.reviewStatus,
  fields: [
    { universalIdentifier: UGC_VIEW_FIELD_IDS.contentReviewKanban.creatorHandleLink, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.creatorHandleLink, position: 0, size: 140 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.contentReviewKanban.productRef, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.productRef, position: 1, size: 120 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.contentReviewKanban.campaign, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.campaign, position: 2, size: 160 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.contentReviewKanban.submissionLink, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.submissionLink, position: 3, size: 180 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.contentReviewKanban.submittedAt, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.submittedAt, position: 4, size: 150 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.contentReviewKanban.reviewer, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.reviewer, position: 5, size: 120 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.contentReviewKanban.revisionNotes, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.revisionNotes, position: 6, size: 180 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.contentReviewKanban.approvedAssetLink, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.approvedAssetLink, position: 7, size: 180 },
  ],
  groups: [
    { universalIdentifier: UGC_VIEW_GROUP_IDS.contentReviewKanban.submitted, fieldValue: 'SUBMITTED', position: 0, isVisible: true },
    { universalIdentifier: UGC_VIEW_GROUP_IDS.contentReviewKanban.needsRevision, fieldValue: 'NEEDS_REVISION', position: 1, isVisible: true },
    { universalIdentifier: UGC_VIEW_GROUP_IDS.contentReviewKanban.approved, fieldValue: 'APPROVED', position: 2, isVisible: true },
    { universalIdentifier: UGC_VIEW_GROUP_IDS.contentReviewKanban.rejected, fieldValue: 'REJECTED', position: 3, isVisible: true },
    { universalIdentifier: UGC_VIEW_GROUP_IDS.contentReviewKanban.readyForAdTest, fieldValue: 'READY_FOR_AD_TEST', position: 4, isVisible: true },
  ],
  sorts: [
    {
      universalIdentifier: UGC_VIEW_SORT_IDS.contentReviewKanbanSubmittedAt,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.deliverable.submittedAt,
      direction: ViewSortDirection.DESC,
    },
  ],
});
