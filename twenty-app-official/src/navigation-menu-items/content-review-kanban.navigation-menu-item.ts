import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import {
  UGC_NAVIGATION_IDS,
  UGC_VIEW_IDS,
} from 'src/constants/ugc-universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: UGC_NAVIGATION_IDS.contentReviewKanban,
  name: 'Content Review',
  icon: 'IconVideo',
  position: 4,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: UGC_VIEW_IDS.contentReviewKanban,
});
