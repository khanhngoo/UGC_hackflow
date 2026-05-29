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

/** Keeps the workspace Brief index view valid (legacy bookmarks); use Campaigns nav for campaigns. */
export default defineView({
  universalIdentifier: UGC_VIEW_IDS.briefLegacyIndex,
  name: 'All Briefs',
  objectUniversalIdentifier: UGC_OBJECT_IDS.brief,
  type: ViewType.TABLE,
  key: ViewKey.INDEX,
  icon: 'IconClipboardText',
  position: 99,
  visibility: ViewVisibility.UNLISTED,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  fields: [
    {
      universalIdentifier: UGC_VIEW_FIELD_IDS.briefLegacyIndex.legacyName,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.brief.legacyName,
      position: 0,
      size: 200,
    },
    {
      universalIdentifier: UGC_VIEW_FIELD_IDS.briefLegacyIndex.campaign,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.brief.campaign,
      position: 1,
      size: 180,
    },
  ],
  sorts: [
    {
      universalIdentifier: UGC_VIEW_SORT_IDS.briefLegacyName,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.brief.legacyName,
      direction: ViewSortDirection.ASC,
    },
  ],
});
