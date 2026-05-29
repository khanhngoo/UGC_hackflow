import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import {
  UGC_NAVIGATION_IDS,
  UGC_VIEW_IDS,
} from 'src/constants/ugc-universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: UGC_NAVIGATION_IDS.campaigns,
  name: 'Campaigns',
  icon: 'IconTargetArrow',
  position: 3,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: UGC_VIEW_IDS.campaigns,
});
