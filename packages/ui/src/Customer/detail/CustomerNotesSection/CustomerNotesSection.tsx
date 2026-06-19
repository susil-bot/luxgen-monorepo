import type { CustomerDetail } from '../../fetcher';
import { CustomerDetailSection } from '../../CustomerDetailSection';

export function CustomerNotesSection({ customer }: { customer: CustomerDetail }) {
  return (
    <CustomerDetailSection title="Notes">
      <p className="text-sm text-secondary">{customer.notes || 'No notes'}</p>
    </CustomerDetailSection>
  );
}
