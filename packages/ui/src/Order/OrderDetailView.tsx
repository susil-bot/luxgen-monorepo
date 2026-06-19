import type { OrderDetail } from './fetcher';
import type { TimelineActivityProps } from '../Timeline';
import { OrderDetailLayout } from './OrderDetailLayout';
import { OrderDetailHeader } from './OrderDetailHeader';
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
}

export function OrderDetailView({ order, backHref, timeline }: OrderDetailViewProps) {
  return (
    <OrderDetailLayout
      header={<OrderDetailHeader order={order} backHref={backHref} />}
      main={
        <>
          <FulfillmentSection order={order} />
          <PaymentSummarySection order={order} />
          <TimelineSection order={order} {...timeline} />
          <NotesSection notes={order.notes} />
        </>
      }
      sidebar={
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
