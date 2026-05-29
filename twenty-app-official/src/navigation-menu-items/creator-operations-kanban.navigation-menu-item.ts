import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import {
  UGC_NAVIGATION_IDS,
  UGC_VIEW_IDS,
} from 'src/constants/ugc-universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: UGC_NAVIGATION_IDS.creatorOperationsKanban,
  name: 'Creator Operations',
  icon: 'IconLayoutKanban',
  position: 2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: UGC_VIEW_IDS.creatorOperationsKanban,
});
