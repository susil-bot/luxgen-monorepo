import type { CustomerDetail } from './fetcher';
import { SplitPageLayout } from '../SplitPageLayout';
import { CustomerDetailHeader } from './CustomerDetailHeader';
import { CustomerStatsBar } from './CustomerStatsBar';
import { LastOrderSection } from './detail/LastOrderSection';
import { MetafieldsSection } from './detail/MetafieldsSection';
import { CustomerHistorySection } from './detail/CustomerHistorySection';
import { CustomerContactSection } from './detail/CustomerContactSection';
import { MarketingSection } from './detail/MarketingSection';
import { StoreCreditSection } from './detail/StoreCreditSection';
import { CustomerTagsSection } from './detail/CustomerTagsSection';
import { CustomerNotesSection } from './detail/CustomerNotesSection';

export interface CustomerDetailViewProps {
  customer: CustomerDetail;
  onCreateOrder?: () => void;
}

export function CustomerDetailView({ customer, onCreateOrder }: CustomerDetailViewProps) {
  return (
    <SplitPageLayout
      variant="main-aside"
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
          <CustomerHistorySection customer={customer} />
        </>
      }
      aside={
        <>
          <CustomerContactSection customer={customer} />
          <MarketingSection customer={customer} />
          <StoreCreditSection customer={customer} />
          <CustomerTagsSection customer={customer} />
          <CustomerNotesSection customer={customer} />
        </>
      }
    />
  );
}
