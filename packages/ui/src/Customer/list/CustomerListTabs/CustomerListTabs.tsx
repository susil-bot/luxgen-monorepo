import type { CustomerFilterTab } from '../../fetcher';
import { customerListTabs } from './fetcher';

export interface CustomerListTabsProps {
  activeTab: CustomerFilterTab;
  onTabChange: (tab: CustomerFilterTab) => void;
}

export function CustomerListTabs({ activeTab, onTabChange }: CustomerListTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 border-b pb-0" style={{ borderColor: 'var(--color-separator)' }}>
      {customerListTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg ${isActive ? 'text-primary' : 'text-secondary hover:text-primary'}`}
            style={isActive ? { borderBottom: '2px solid var(--color-blue)', marginBottom: -1 } : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
