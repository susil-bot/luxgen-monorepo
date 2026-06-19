import type { OrderDetail } from '../../fetcher';
import { OrderDetailSection } from '../../OrderDetailSection';

export interface PaymentSummarySectionProps {
  order: OrderDetail;
}

export function PaymentSummarySection({ order }: PaymentSummarySectionProps) {
  const rows = [
    { label: 'Subtotal', value: order.subtotal },
    { label: 'Discount', value: order.discount },
    { label: 'Tax', value: order.tax },
  ];

  return (
    <OrderDetailSection title="Payment" hint="Shopify: payment summary · LuxGen: enrollment billing">
      <ul className="space-y-2 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex justify-between">
            <span className="text-secondary">{row.label}</span>
            <span className="text-primary">{row.value === '0.00' ? '—' : row.value}</span>
          </li>
        ))}
        <li
          className="flex justify-between pt-2 font-semibold"
          style={{ borderTop: '1px solid var(--color-separator)' }}
        >
          <span className="text-primary">Total</span>
          <span className="text-primary">{order.total === '—' ? '—' : order.total}</span>
        </li>
      </ul>
      <p className="text-xs text-tertiary">Paid via LuxGen billing · Stripe integration — Phase 3</p>
    </OrderDetailSection>
  );
}
