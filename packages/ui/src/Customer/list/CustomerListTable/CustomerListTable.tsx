import type { CustomerRow } from '../../fetcher';
import { CustomerTranslations } from '../../translations';

export interface CustomerListTableProps {
  customers: CustomerRow[];
  customerHref?: (id: string) => string;
}

export function CustomerListTable({
  customers,
  customerHref = (id) => `/admin/customers/${id}`,
}: CustomerListTableProps) {
  const t = CustomerTranslations.en;

  if (customers.length === 0) {
    return (
      <div className="ios-card p-8 text-center">
        <p className="text-primary font-medium">{t.noCustomers}</p>
        <p className="text-sm text-secondary mt-1">{t.noCustomersHint}</p>
      </div>
    );
  }

  return (
    <div className="ios-card overflow-hidden">
      <div className="ios-table-wrap">
        <table className="ios-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Amount spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <a href={customerHref(c.id)} className="font-medium" style={{ color: 'var(--color-blue)' }}>
                    {c.name}
                  </a>
                </td>
                <td className="text-secondary">{c.email}</td>
                <td className="text-secondary">{c.location}</td>
                <td>{c.orderCount}</td>
                <td>{c.amountSpent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
