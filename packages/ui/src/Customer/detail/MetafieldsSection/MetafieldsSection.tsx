import type { CustomerDetail } from '../../fetcher';
import { CustomerDetailSection } from '../../CustomerDetailSection';

export function MetafieldsSection({ customer }: { customer: CustomerDetail }) {
  return (
    <CustomerDetailSection title="Metafields" hint="Shopify custom fields · LuxGen learner attributes">
      <ul className="space-y-3">
        {customer.metafields.map((field) => (
          <li key={field.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
            <label className="text-sm text-secondary">{field.label}</label>
            <input className="ios-input" value={field.value} readOnly />
          </li>
        ))}
      </ul>
      <button type="button" className="ios-btn-plain text-sm" disabled>
        View all
      </button>
    </CustomerDetailSection>
  );
}
