import { DEFAULT_PRODUCT_EDIT_META } from '../../fetcher';
import type { InventorySectionProps } from './InventorySection';

export const inventorySectionFixtures = {
  tracked: {
    meta: { ...DEFAULT_PRODUCT_EDIT_META, sku: 'CRS-ABC123', maxEnrollments: 100 },
    enrolled: 42,
    onMetaChange: () => {},
  } satisfies InventorySectionProps,
};
