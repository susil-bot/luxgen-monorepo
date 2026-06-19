import type { CustomerDetail } from '../../fetcher';
import { CustomerDetailSection } from '../../CustomerDetailSection';

export function CustomerContactSection({ customer }: { customer: CustomerDetail }) {
  return (
    <CustomerDetailSection title="Customer">
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-tertiary mb-1">Contact information</p>
          <a href={`mailto:${customer.email}`} style={{ color: 'var(--color-blue)' }}>
            {customer.email}
          </a>
        </div>
        <div>
          <p className="text-xs text-tertiary mb-1">Default address</p>
          <p className="text-secondary">Digital delivery — no physical address</p>
          {customer.phone !== '—' && <p className="text-secondary">{customer.phone}</p>}
        </div>
      </div>
    </CustomerDetailSection>
  );
}
