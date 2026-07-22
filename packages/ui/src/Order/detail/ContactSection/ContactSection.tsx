import type { OrderDetail } from '../../fetcher';
import { OrderDetailSection } from '../../OrderDetailSection';

export interface ContactSectionProps {
  order: OrderDetail;
}

export function ContactSection({ order }: ContactSectionProps) {
  return (
    <OrderDetailSection title="Contact information">
      <p className="text-sm text-primary break-all">{order.contactEmail}</p>
      <button type="button" className="ios-btn-plain text-sm mt-1" disabled>
        View customer
      </button>
    </OrderDetailSection>
  );
}
