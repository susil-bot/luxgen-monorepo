import { useMemo } from 'react';
import type { AbandonedCheckoutRow } from './fetcher';
import { formatOrderListDate } from './fetcher';
import { OrderTranslations } from './translations';
import { DataListPage, EmptyState } from '../DataList';

export interface AbandonedCheckoutListViewProps {
  checkouts: AbandonedCheckoutRow[];
  search: string;
  onSearchChange: (value: string) => void;
  onSendRecovery?: (checkoutId: string) => void;
  sendingId?: string | null;
}

const AbandonedIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

export function AbandonedCheckoutListView({ checkouts, search, onSearchChange, onSendRecovery, sendingId }: AbandonedCheckoutListViewProps) {
  const t = OrderTranslations.en;

  const filtered = useMemo(() => {
    if (!search.trim()) return checkouts;
    const q = search.toLowerCase();
    return checkouts.filter(
      (row) =>
        row.customerName.toLowerCase().includes(q) ||
        row.customerEmail.toLowerCase().includes(q) ||
        row.courseTitle.toLowerCase().includes(q),
    );
  }, [checkouts, search]);

  return (
    <div className="admin-list-page max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <DataListPage
        icon={<AbandonedIcon />}
        breadcrumb="Orders"
        title="Abandoned checkouts"
        searchQuery={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={t.searchPlaceholder}
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="No abandoned checkouts"
            description="Checkout sessions abandoned after 1 hour appear here."
          />
        ) : (
          <div className="ios-table-wrap">
            <table className="ios-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="text-secondary">{formatOrderListDate(row.date)}</td>
                    <td>
                      <div className="text-sm text-primary">{row.customerName}</div>
                      <div className="text-xs text-tertiary">{row.customerEmail}</div>
                    </td>
                    <td className="text-secondary max-w-[180px] truncate">{row.courseTitle}</td>
                    <td>
                      <span className="badge badge-warning capitalize">{row.status}</span>
                    </td>
                    <td className="text-right font-medium">{row.amount}</td>
                    <td className="text-right space-x-2">
                      {onSendRecovery && (
                        <button type="button" className="ios-btn-secondary text-xs py-1 px-2" disabled={sendingId === row.id} onClick={() => onSendRecovery(row.id)}>
                          {sendingId === row.id ? 'Sending…' : 'Send recovery email'}
                        </button>
                      )}
                      {row.checkoutUrl ? (
                        <a href={row.checkoutUrl} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: 'var(--color-blue)' }}>Open checkout</a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataListPage>
    </div>
  );
}
