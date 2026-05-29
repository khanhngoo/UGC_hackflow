import {
  ViewKey,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
  defineView,
} from 'twenty-sdk/define';

import {
  UGC_FIELD_IDS,
  UGC_OBJECT_IDS,
  UGC_VIEW_FIELD_IDS,
  UGC_VIEW_IDS,
} from 'src/constants/ugc-universal-identifiers';

export default defineView({
  universalIdentifier: UGC_VIEW_IDS.products,
  name: 'Products',
  objectUniversalIdentifier: UGC_OBJECT_IDS.product,
  type: ViewType.TABLE,
  key: ViewKey.INDEX,
  icon: 'IconPackage',
  position: 6,
  visibility: ViewVisibility.UNLISTED,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  fields: [
    { universalIdentifier: UGC_VIEW_FIELD_IDS.products.name, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.product.name, position: 0, size: 180 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.products.category, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.product.category, position: 1, size: 140 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.products.productPageLink, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.product.productPageLink, position: 2, size: 160 },
    { universalIdentifier: UGC_VIEW_FIELD_IDS.products.status, fieldMetadataUniversalIdentifier: UGC_FIELD_IDS.product.status, position: 3, size: 120 },
  ],
});
