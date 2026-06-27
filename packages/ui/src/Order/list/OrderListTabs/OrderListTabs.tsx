import type { OrderFilterTab } from '../../fetcher';
import { orderListTabs } from './fetcher';

export interface OrderListTabsProps {
  activeTab: OrderFilterTab;
  onTabChange: (tab: OrderFilterTab) => void;
  counts?: Partial<Record<OrderFilterTab, number>>;
}

export function OrderListTabs({ activeTab, onTabChange, counts }: OrderListTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 border-b pb-0" style={{ borderColor: 'var(--color-separator)' }}>
      {orderListTabs.map((tab) => {
        const count = counts?.[tab.id];
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              isActive ? 'text-primary bg-raised' : 'text-secondary hover:text-primary'
            }`}
            style={isActive ? { borderBottom: '2px solid var(--color-blue)', marginBottom: -1 } : undefined}
          >
            {tab.label}
            {count != null && count > 0 && <span className="ml-1.5 text-xs text-tertiary">({count})</span>}
          </button>
        );
      })}
    </div>
  );
}
