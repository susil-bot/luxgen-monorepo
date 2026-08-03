import type { OrderDetail } from '../../fetcher';
import { OrderDetailSection } from '../../OrderDetailSection';
import { paymentDisplayLabel } from '../../fetcher';

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
    <OrderDetailSection
      title="Payment"
      hint={`Status: ${paymentDisplayLabel(order.paymentStatus)} · LuxGen enrollment billing`}
    >
      <p className="text-sm mb-3">
        <span className="text-secondary">Payment status: </span>
        <span className="font-medium text-primary">{paymentDisplayLabel(order.paymentStatus)}</span>
      </p>
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
    </OrderDetailSection>
  );
}
