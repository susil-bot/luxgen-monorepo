import { DEFAULT_PRODUCT_EDIT_META } from '../../fetcher';
import type { PricingSectionProps } from './PricingSection';

export const pricingSectionFixtures = {
  default: {
    meta: { ...DEFAULT_PRODUCT_EDIT_META, price: '99.00', compareAtPrice: '149.00' },
    onMetaChange: () => {},
  } satisfies PricingSectionProps,
};
