import type { OrderDetail } from '../../fetcher';
import { OrderDetailSection } from '../../OrderDetailSection';

export interface BillingSectionProps {
  order: OrderDetail;
}

export function BillingSection({ order }: BillingSectionProps) {
  return (
    <OrderDetailSection title="Billing address">
      <p className="text-sm text-primary">{order.billingName}</p>
      <p className="text-sm text-secondary">{order.contactEmail}</p>
    </OrderDetailSection>
  );
}
