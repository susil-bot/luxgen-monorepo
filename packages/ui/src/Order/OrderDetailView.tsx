import { EntityFormPageLayout } from '../SplitPageLayout/EntityFormPageLayout';
import type { OrderDetail } from './fetcher';
import type { TimelineActivityProps } from '../Timeline';
import { SplitPageHeader } from '../SplitPageLayout/SplitPageHeader';
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
  timeline?: TimelineActivityProps;
  notes?: string;
  onNotesChange?: (value: string) => void;
  savingNotes?: boolean;
}

export function OrderDetailView({ order, backHref, timeline, notes, onNotesChange, savingNotes }: OrderDetailViewProps) {
  const t = OrderTranslations.en;

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
              <button type="button" className="ios-btn-secondary text-sm" disabled>
                {t.refund}
              </button>
              <button type="button" className="ios-btn-secondary text-sm" disabled>
                {t.edit}
              </button>
              <button type="button" className="ios-btn-secondary text-sm" disabled>
                {t.moreActions}
              </button>
            </>
          }
        />
      }
      main={
        <>
          <FulfillmentSection order={order} />
          <PaymentSummarySection order={order} />
          <TimelineSection order={order} {...timeline} />
          <NotesSection
            notes={notes ?? order.notes}
            onNotesChange={onNotesChange}
            saving={savingNotes}
          />
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
