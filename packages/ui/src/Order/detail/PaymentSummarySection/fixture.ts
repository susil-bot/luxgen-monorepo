import { orderFixtures } from '../../fixture';
import type { PaymentSummarySectionProps } from './PaymentSummarySection';

export const paymentSummaryFixtures = {
  default: { order: orderFixtures.detail } satisfies PaymentSummarySectionProps,
};
