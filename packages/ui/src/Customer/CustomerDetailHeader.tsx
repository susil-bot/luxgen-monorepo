import type { CustomerDetail } from './fetcher';
import { CustomerTranslations } from './translations';

export interface CustomerDetailHeaderProps {
  customer: CustomerDetail;
  backHref?: string;
}

export function CustomerDetailHeader({ customer, backHref = '/admin/customers' }: CustomerDetailHeaderProps) {
  const t = CustomerTranslations.en;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <a href={backHref} className="ios-btn-plain text-sm flex-shrink-0">
          {t.backToCustomers}
        </a>
        <div className="min-w-0 flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            👤
          </span>
          <h1 className="text-lg sm:text-xl font-semibold text-primary truncate">{customer.name}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button type="button" className="ios-btn-secondary text-sm" disabled>
          {t.moreActions}
        </button>
      </div>
    </div>
  );
}
