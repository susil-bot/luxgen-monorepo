import type { OrderDetail } from '../../fetcher';
import { OrderDetailSection } from '../../OrderDetailSection';

export interface AccessSectionProps {
  order: OrderDetail;
}

/** Shopify "Shipping address" → LuxGen digital access */
export function AccessSection({ order }: AccessSectionProps) {
  return (
    <OrderDetailSection title="Access" hint="Shopify: Shipping · LuxGen: digital delivery">
      <p className="text-sm text-primary">{order.accessMethod}</p>
      <p className="text-xs text-secondary mt-2">Course: {order.courseTitle}</p>
    </OrderDetailSection>
  );
}
