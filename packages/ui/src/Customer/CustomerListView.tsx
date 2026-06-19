import type { CustomerFilterTab, CustomerRow } from './fetcher';
import { CustomerTranslations } from './translations';
import { CustomerListTabs } from './list/CustomerListTabs';
import { CustomerListTable } from './list/CustomerListTable';

export interface CustomerListViewProps {
  customers: CustomerRow[];
  activeTab: CustomerFilterTab;
  onTabChange: (tab: CustomerFilterTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onAddCustomer?: () => void;
}

export function CustomerListView({
  customers,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  onAddCustomer,
}: CustomerListViewProps) {
  const t = CustomerTranslations.en;

  return (
    <div className="split-page admin-list-page max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="ios-large-title">{t.customers}</h1>
        <button type="button" className="ios-btn-primary text-sm" onClick={onAddCustomer} disabled={!onAddCustomer}>
          Add customer
        </button>
      </div>
      <div className="ios-form-group max-w-md">
        <input
          className="ios-input"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
        />
      </div>
      <CustomerListTabs activeTab={activeTab} onTabChange={onTabChange} />
      <CustomerListTable customers={customers} />
    </div>
  );
}
