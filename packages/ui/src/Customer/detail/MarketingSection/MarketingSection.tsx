import type { CustomerDetail } from '../../fetcher';
import { CustomerDetailSection } from '../../CustomerDetailSection';

export function MarketingSection({ customer }: { customer: CustomerDetail }) {
  return (
    <CustomerDetailSection title="Marketing">
      <ul className="space-y-2 text-sm">
        <li className="flex justify-between">
          <span className="text-secondary">Email</span>
          <span className={customer.marketingEmail ? 'badge badge-green' : 'badge badge-gray'}>
            {customer.marketingEmail ? 'Subscribed' : 'Not subscribed'}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-secondary">SMS</span>
          <span className={customer.marketingSms ? 'badge badge-green' : 'badge badge-gray'}>
            {customer.marketingSms ? 'Subscribed' : 'Not subscribed'}
          </span>
        </li>
      </ul>
    </CustomerDetailSection>
  );
}
