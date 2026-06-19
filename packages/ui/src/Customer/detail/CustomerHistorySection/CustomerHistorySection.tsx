import type { CustomerDetail } from '../../fetcher';
import { CustomerDetailSection } from '../../CustomerDetailSection';
import { formatCustomerListDate } from '../../fetcher';

export function CustomerHistorySection({ customer }: { customer: CustomerDetail }) {
  return (
    <CustomerDetailSection title="Customer history" hint="Shopify timeline · LuxGen activity log">
      <ul className="space-y-4">
        {customer.timeline.map((event) => (
          <li key={event.id} className="text-sm">
            <p className="text-primary">{event.message}</p>
            {event.field && event.newValue && (
              <p className="text-xs mt-1">
                <span className="badge badge-gray mr-1">{event.oldValue ?? '—'}</span>
                →
                <span className="badge badge-green ml-1">{event.newValue}</span>
              </p>
            )}
            <p className="text-xs text-tertiary mt-1">{formatCustomerListDate(event.at)}</p>
          </li>
        ))}
      </ul>
    </CustomerDetailSection>
  );
}
