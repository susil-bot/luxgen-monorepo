import type { CustomerRow } from '../../fetcher';

export interface CustomerListTableProps {
  customers: CustomerRow[];
  customerHref?: (id: string) => string;
}

export function CustomerListTable({
  customers,
  customerHref = (id) => `/admin/customers/${id}`,
}: CustomerListTableProps) {
  if (customers.length === 0) return null;

  return (
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
  );
}
