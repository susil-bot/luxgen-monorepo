import { orderFixtures } from '../../fixture';
import type { FulfillmentSectionProps } from './FulfillmentSection';

export const fulfillmentSectionFixtures = {
  default: { order: orderFixtures.detail } satisfies FulfillmentSectionProps,
};
