import {
  ViewCalendarLayout,
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
  universalIdentifier: UGC_VIEW_IDS.creatorOperationsCalendar,
  name: 'Follow-up Calendar',
  objectUniversalIdentifier: UGC_OBJECT_IDS.outreach,
  type: ViewType.CALENDAR,
  icon: 'IconCalendar',
  position: 1,
  visibility: ViewVisibility.UNLISTED,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  calendarLayout: ViewCalendarLayout.WEEK,
  calendarFieldMetadataUniversalIdentifier: UGC_FIELD_IDS.outreach.nextFollowUpAt,
  fields: [
    {
      universalIdentifier: UGC_VIEW_FIELD_IDS.creatorOperationsCalendar.creatorHandle,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.outreach.creatorHandleLink,
      position: 0,
      size: 140,
    },
    {
      universalIdentifier: UGC_VIEW_FIELD_IDS.creatorOperationsCalendar.campaign,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.outreach.campaign,
      position: 1,
      size: 160,
    },
    {
      universalIdentifier: UGC_VIEW_FIELD_IDS.creatorOperationsCalendar.pipelineStatus,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.outreach.pipelineStatus,
      position: 2,
      size: 150,
    },
    {
      universalIdentifier: UGC_VIEW_FIELD_IDS.creatorOperationsCalendar.member,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.outreach.member,
      position: 3,
      size: 120,
    },
    {
      universalIdentifier: UGC_VIEW_FIELD_IDS.creatorOperationsCalendar.contactMethod,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.outreach.contactMethod,
      position: 4,
      size: 130,
    },
    {
      universalIdentifier: UGC_VIEW_FIELD_IDS.creatorOperationsCalendar.nextFollowUpAt,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.outreach.nextFollowUpAt,
      position: 5,
      size: 150,
    },
  ],
  sorts: [
    {
      universalIdentifier: UGC_VIEW_SORT_IDS.creatorOperationsCalendarNextFollowUp,
      fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.outreach.nextFollowUpAt,
      direction: ViewSortDirection.ASC,
    },
  ],
});
