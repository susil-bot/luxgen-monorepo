import type { OrderDetail } from '../../fetcher';
import { OrderDetailSection } from '../../OrderDetailSection';

export interface CustomerSectionProps {
  order: OrderDetail;
}

export function CustomerSection({ order }: CustomerSectionProps) {
  return (
    <OrderDetailSection title="Customer">
      <a
        href={`/admin/customers/${order.customerId}`}
        className="text-sm font-medium"
        style={{ color: 'var(--color-blue)' }}
      >
        {order.customerName}
      </a>
      <p className="text-xs text-tertiary mt-1">
        {order.itemCount} order{order.itemCount !== 1 ? 's' : ''}
      </p>
    </OrderDetailSection>
  );
}
