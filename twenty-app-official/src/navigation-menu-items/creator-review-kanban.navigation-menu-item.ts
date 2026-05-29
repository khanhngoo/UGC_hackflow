import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import {
  UGC_NAVIGATION_IDS,
  UGC_VIEW_IDS,
} from 'src/constants/ugc-universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: UGC_NAVIGATION_IDS.creatorReviewKanban,
  name: 'Creator Review',
  icon: 'IconClipboardCheck',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: UGC_VIEW_IDS.creatorReviewKanban,
});
