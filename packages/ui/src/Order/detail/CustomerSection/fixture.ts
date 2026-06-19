import { orderFixtures } from '../../fixture';
import type { CustomerSectionProps } from './CustomerSection';

export const customerSectionFixtures = {
  default: { order: orderFixtures.detail } satisfies CustomerSectionProps,
};
