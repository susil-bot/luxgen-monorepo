import { EntityFormPageLayout } from '../SplitPageLayout/EntityFormPageLayout';
import type { OrderDetail } from './fetcher';
import type { TimelineActivityProps } from '../Timeline';
import { SplitPageHeader } from '../SplitPageLayout/SplitPageHeader';
import { ActionMenu } from '../ActionMenu';
import {
  formatOrderDate,
  fulfillmentBadgeClass,
  fulfillmentDisplayLabel,
  paymentBadgeClass,
  paymentDisplayLabel,
} from './fetcher';
import { OrderTranslations } from './translations';
import { FulfillmentSection } from './detail/FulfillmentSection';
import { PaymentSummarySection } from './detail/PaymentSummarySection';
import { TimelineSection } from './detail/TimelineSection';
import { NotesSection } from './detail/NotesSection';
import { CustomerSection } from './detail/CustomerSection';
import { ContactSection } from './detail/ContactSection';
import { AccessSection } from './detail/AccessSection';
import { BillingSection } from './detail/BillingSection';
import { TagsSection } from './detail/TagsSection';
import { ConversionSection } from './detail/ConversionSection';

export interface OrderDetailViewProps {
  order: OrderDetail;
  backHref?: string;
  editHref?: string;
  onRefund?: () => void;
  onCancel?: () => void;
  refunding?: boolean;
  cancelling?: boolean;
  timeline?: TimelineActivityProps;
  notes?: string;
  onNotesChange?: (value: string) => void;
  savingNotes?: boolean;
}

export function OrderDetailView({
  order,
  backHref,
  editHref,
  onRefund,
  onCancel,
  refunding,
  cancelling,
  timeline,
  notes,
  onNotesChange,
  savingNotes,
}: OrderDetailViewProps) {
  const t = OrderTranslations.en;
  const canRefund = order.paymentStatus === 'paid' && Boolean(onRefund);
  const isTerminal = order.paymentStatus === 'voided' || order.paymentStatus === 'refunded';
  const resolvedEditHref = editHref ?? `/orders/${order.id}/edit`;

  const menuItems =
    onCancel && !isTerminal
      ? [
          {
            id: 'cancel',
            label: t.cancelOrder,
            onClick: onCancel,
            disabled: cancelling,
            destructive: true,
          },
        ]
      : [];

  return (
    <EntityFormPageLayout
      header={
        <SplitPageHeader
          backHref={backHref ?? '/orders'}
          backLabel={t.backToOrders}
          title={order.orderNumber}
          badges={
            <>
              <span className="text-sm text-secondary">{formatOrderDate(order.date)}</span>
              <span className={`badge ${paymentBadgeClass(order.paymentStatus)}`}>
                {paymentDisplayLabel(order.paymentStatus)}
              </span>
              <span className={`badge ${fulfillmentBadgeClass(order.fulfillmentStatus)}`}>
                {fulfillmentDisplayLabel(order.fulfillmentStatus)}
              </span>
            </>
          }
          actions={
            <>
              <button
                type="button"
                className="ios-btn-secondary text-sm"
                disabled={!canRefund || refunding}
                onClick={onRefund}
              >
                {refunding ? 'Refunding…' : t.refund}
              </button>
              {isTerminal ? (
                <button type="button" className="ios-btn-secondary text-sm" disabled>
                  {t.edit}
                </button>
              ) : (
                <a href={resolvedEditHref} className="ios-btn-secondary text-sm">
                  {t.edit}
                </a>
              )}
              {menuItems.length > 0 ? (
                <ActionMenu items={menuItems} triggerLabel={t.moreActions} />
              ) : (
                <button type="button" className="ios-btn-secondary text-sm" disabled>
                  {t.moreActions}
                </button>
              )}
            </>
          }
        />
      }
      main={
        <>
          <FulfillmentSection order={order} />
          <PaymentSummarySection order={order} />
          <TimelineSection order={order} {...timeline} />
          <NotesSection notes={notes ?? order.notes} onNotesChange={onNotesChange} saving={savingNotes} />
        </>
      }
      aside={
        <>
          <CustomerSection order={order} />
          <ContactSection order={order} />
          <AccessSection order={order} />
          <BillingSection order={order} />
          <TagsSection tags={order.tags} />
          <ConversionSection order={order} />
        </>
      }
    />
  );
}
