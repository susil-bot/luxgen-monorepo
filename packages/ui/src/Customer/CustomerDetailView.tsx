import type { CustomerDetail } from './fetcher';
import type { TimelineActivityProps } from '../Timeline';
import type { ActionMenuItem } from '../ActionMenu';
import { EntityFormPageLayout } from '../SplitPageLayout/EntityFormPageLayout';
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
  editHref?: string;
  onDeleteCustomer?: () => void;
  deletingCustomer?: boolean;
  onMarketingChange?: (channel: 'email' | 'sms' | 'whatsapp', subscribed: boolean) => void;
  savingMarketing?: boolean;
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
  editHref,
  onDeleteCustomer,
  deletingCustomer,
  onMarketingChange,
  savingMarketing,
  timeline,
  customerNotes,
  onCustomerNotesChange,
  savingCustomerNotes,
}: CustomerDetailViewProps) {
  const menuItems: ActionMenuItem[] =
    onDeleteCustomer != null
      ? [
          {
            id: 'delete',
            label: 'Delete customer',
            onClick: onDeleteCustomer,
            disabled: deletingCustomer,
            destructive: true,
          },
        ]
      : [];

  return (
    <EntityFormPageLayout
      variant="main-aside"
      className="w-full min-h-0"
      header={
        <>
          <CustomerDetailHeader customer={customer} editHref={editHref} menuItems={menuItems} />
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
          <MarketingSection customer={customer} onMarketingChange={onMarketingChange} saving={savingMarketing} />
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
