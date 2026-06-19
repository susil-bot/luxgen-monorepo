import type { CustomerDetail } from '../../fetcher';
import { CustomerDetailSection } from '../../CustomerDetailSection';

export function StoreCreditSection({ customer }: { customer: CustomerDetail }) {
  return (
    <CustomerDetailSection title="Store credit">
      <p className="text-sm text-primary">{customer.storeCredit}</p>
    </CustomerDetailSection>
  );
}
