import type { CustomerDetail } from './fetcher';

export interface CustomerStatsBarProps {
  customer: CustomerDetail;
}

export function CustomerStatsBar({ customer }: CustomerStatsBarProps) {
  const stats = [
    { label: 'Amount spent', value: customer.amountSpent },
    { label: 'Orders', value: String(customer.orderCount) },
    { label: 'Customer since', value: customer.customerSince },
    { label: 'RFM group', value: customer.rfmGroup },
  ];

  return (
    <div className="ios-card p-0 overflow-hidden">
      <div
        className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0"
        style={{ borderColor: 'var(--color-separator)' }}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 sm:p-5">
            <p className="text-xs text-secondary mb-1">{stat.label}</p>
            <p className="text-base font-semibold text-primary">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
