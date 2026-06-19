import { orderFixtures } from '../../fixture';
import type { BillingSectionProps } from './BillingSection';

export const billingSectionFixtures = {
  default: { order: orderFixtures.detail } satisfies BillingSectionProps,
};
