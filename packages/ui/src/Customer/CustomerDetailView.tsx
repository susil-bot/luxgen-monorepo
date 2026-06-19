import type { CustomerDetail } from './fetcher';
import type { TimelineActivityProps } from '../Timeline';
import { SplitPageLayout } from '../SplitPageLayout';
import { CustomerDetailHeader } from './CustomerDetailHeader';
import { CustomerStatsBar } from './CustomerStatsBar';
import { LastOrderSection } from './detail/LastOrderSection';
import { MetafieldsSection } from './detail/MetafieldsSection';
import { CustomerHistorySection } from './detail/CustomerHistorySection';
import { CustomerContactSection } from './detail/CustomerContactSection';
import { MarketingSection } from './detail/MarketingSection';
import { TaxDetailsSection } from './detail/TaxDetailsSection/TaxDetailsSection';
import { StoreCreditSection } from './detail/StoreCreditSection';
import { CustomerTagsSection } from './detail/CustomerTagsSection';
import { CustomerNotesSection } from './detail/CustomerNotesSection';

export interface CustomerDetailViewProps {
  customer: CustomerDetail;
  onCreateOrder?: () => void;
  timeline?: TimelineActivityProps;
  customerNotes?: string;
  onCustomerNotesChange?: (value: string) => void;
  savingCustomerNotes?: boolean;
}

/**
 * Shopify admin customer profile — main + aside via SplitPageLayout.
 * Main: last order, metafields, blocks (customer history).
 * Aside: contact, marketing, tax, store credit, tags, notes.
 */
export function CustomerDetailView({
  customer,
  onCreateOrder,
  timeline,
  customerNotes,
  onCustomerNotesChange,
  savingCustomerNotes,
}: CustomerDetailViewProps) {
  return (
    <SplitPageLayout
      variant="main-aside"
      className="w-full min-h-0"
      header={
        <>
          <CustomerDetailHeader customer={customer} />
          <CustomerStatsBar customer={customer} />
        </>
      }
      main={
        <>
          <LastOrderSection customer={customer} onCreateOrder={onCreateOrder} />
          <MetafieldsSection customer={customer} />
          <CustomerHistorySection customer={customer} {...timeline} />
        </>
      }
      aside={
        <>
          <CustomerContactSection customer={customer} />
          <MarketingSection customer={customer} />
          <TaxDetailsSection />
          <StoreCreditSection customer={customer} />
          <CustomerTagsSection customer={customer} />
          <CustomerNotesSection
            notes={customerNotes ?? customer.notes}
            onNotesChange={onCustomerNotesChange}
            saving={savingCustomerNotes}
          />
        </>
      }
    />
  );
}
