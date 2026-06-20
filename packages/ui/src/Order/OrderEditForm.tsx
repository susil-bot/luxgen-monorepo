import { EntityFormPageLayout } from '../SplitPageLayout/EntityFormPageLayout';
import { SplitPageHeader } from '../SplitPageLayout/SplitPageHeader';
import { SplitPageSection } from '../SplitPageLayout/SplitPageSection';
import { SplitPageFormField } from '../SplitPageLayout/SplitPageFormField';
import type { OrderDetail, OrderPaymentStatus } from './fetcher';
import { formatOrderDate, paymentBadgeClass, paymentDisplayLabel } from './fetcher';
import { OrderTranslations } from './translations';

export interface OrderEditFormProps {
  order: OrderDetail;
  notes: string;
  paymentStatus: OrderPaymentStatus;
  saving?: boolean;
  backHref?: string;
  onNotesChange: (value: string) => void;
  onPaymentStatusChange: (status: OrderPaymentStatus) => void;
  onSave: () => void;
}

const PAYMENT_OPTIONS: { value: OrderPaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'voided', label: 'Voided' },
];

export function OrderEditForm({
  order,
  notes,
  paymentStatus,
  saving,
  backHref,
  onNotesChange,
  onPaymentStatusChange,
  onSave,
}: OrderEditFormProps) {
  const t = OrderTranslations.en;
  const detailHref = backHref ?? `/orders/${order.id}`;

  return (
    <EntityFormPageLayout
      header={
        <SplitPageHeader
          backHref={detailHref}
          backLabel={t.backToOrderDetail}
          title={`Edit ${order.orderNumber}`}
          badges={
            <>
              <span className="text-sm text-secondary">{formatOrderDate(order.date)}</span>
              <span className={`badge ${paymentBadgeClass(paymentStatus)}`}>{paymentDisplayLabel(paymentStatus)}</span>
            </>
          }
          actions={
            <button type="button" className="ios-btn-primary text-sm" disabled={saving} onClick={onSave}>
              {saving ? t.saving : t.saveOrder}
            </button>
          }
        />
      }
      main={
        <SplitPageSection title="Order details">
          <p className="text-sm text-secondary mb-4">
            Update staff notes and payment status for this enrollment order.
          </p>
          <SplitPageFormField id="order-notes" label="Staff notes">
            <textarea
              id="order-notes"
              className="ios-input w-full min-h-[120px] resize-y"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Internal notes about this order…"
            />
          </SplitPageFormField>
          <SplitPageFormField id="order-payment" label="Payment status">
            <select
              id="order-payment"
              className="ios-input w-full"
              value={paymentStatus}
              onChange={(e) => onPaymentStatusChange(e.target.value as OrderPaymentStatus)}
            >
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </SplitPageFormField>
        </SplitPageSection>
      }
      aside={
        <SplitPageSection title="Summary">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-tertiary mb-0.5">Customer</dt>
              <dd className="text-primary">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-tertiary mb-0.5">Product</dt>
              <dd className="text-primary">{order.courseTitle}</dd>
            </div>
            <div>
              <dt className="text-xs text-tertiary mb-0.5">Order</dt>
              <dd className="text-primary">{order.orderNumber}</dd>
            </div>
          </dl>
        </SplitPageSection>
      }
    />
  );
}
