import type { OrderFilterTab, OrderRow } from './fetcher';
import { OrderListHeader } from './list/OrderListHeader';
import { OrderListTabs } from './list/OrderListTabs';
import { OrderListTable } from './list/OrderListTable';
import { OrderTranslations } from './translations';

export interface OrderListViewProps {
  orders: OrderRow[];
  activeTab: OrderFilterTab;
  onTabChange: (tab: OrderFilterTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
  tabCounts?: Partial<Record<OrderFilterTab, number>>;
  onCreateOrder?: () => void;
}

export function OrderListView({
  orders,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  tabCounts,
  onCreateOrder,
}: OrderListViewProps) {
  const t = OrderTranslations.en;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto space-y-4">
      <OrderListHeader onCreateOrder={onCreateOrder} />
      <div className="ios-form-group max-w-md">
        <input
          className="ios-input"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
        />
      </div>
      <OrderListTabs activeTab={activeTab} onTabChange={onTabChange} counts={tabCounts} />
      <OrderListTable orders={orders} />
    </div>
  );
}
