import type { CustomerDetail } from './fetcher';
import { CustomerTranslations } from './translations';

export interface CustomerDetailHeaderProps {
  customer: CustomerDetail;
  backHref?: string;
  editHref?: string;
}

function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function CustomerDetailHeader({ customer, backHref = '/admin/customers', editHref }: CustomerDetailHeaderProps) {
  const t = CustomerTranslations.en;
  const initials = customerInitials(customer.name);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <a
          href={backHref}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg text-secondary hover:text-primary"
          style={{ background: 'var(--color-fill-quaternary)' }}
          aria-label={t.backToCustomers}
        >
          ‹
        </a>
        <div
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white"
          style={{ background: 'var(--color-purple, #7c3aed)' }}
          aria-hidden
        >
          {initials}
        </div>
        <h1 className="text-lg sm:text-xl font-semibold text-primary truncate">{customer.name}</h1>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {editHref && (
          <a href={editHref} className="ios-btn-secondary text-sm">
            Edit
          </a>
        )}
        <button type="button" className="ios-btn-secondary text-sm" disabled>
          {t.moreActions}
        </button>
      </div>
    </div>
  );
}
