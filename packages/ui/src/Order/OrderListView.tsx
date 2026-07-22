import React, { useState, useMemo } from 'react';
import type { OrderFilterTab, OrderRow } from './fetcher';
import { orderListTabs } from './list/OrderListTabs/fetcher';
import { OrderListTable } from './list/OrderListTable';
import { OrderTranslations } from './translations';
import { DataListPage, EmptyState } from '../DataList';
import type { DataListTab, FilterChipData, SortOption } from '../DataList';

export interface OrderListViewProps {
  orders: OrderRow[];
  activeTab: OrderFilterTab;
  onTabChange: (tab: OrderFilterTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
  tabCounts?: Partial<Record<OrderFilterTab, number>>;
  onCreateOrder?: () => void;
  onExport?: () => void;
}

const SORT_OPTIONS: SortOption[] = [
  { id: 'date', label: 'Date' },
  { id: 'order_number', label: 'Order number' },
  { id: 'customer', label: 'Customer' },
  { id: 'total', label: 'Total' },
];

const OrdersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
);

export function OrderListView({
  orders,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  tabCounts,
  onCreateOrder,
  onExport,
}: OrderListViewProps) {
  const t = OrderTranslations.en;
  const [activeFilters, setActiveFilters] = useState<FilterChipData[]>([]);
  const [sortOption, setSortOption] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const tabs: DataListTab[] = orderListTabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    count: tabCounts?.[tab.id as OrderFilterTab],
  }));

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId as OrderFilterTab);
    if (tabId !== 'all') {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab) setActiveFilters([{ id: `tab_${tabId}`, label: 'Status', value: tab.label }]);
    } else {
      setActiveFilters([]);
    }
  };

  const handleRemoveFilter = (id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setActiveFilters([]);
    onSearchChange('');
    onTabChange('all');
  };

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.courseTitle.toLowerCase().includes(q),
    );
  }, [orders, search]);

  return (
    <div className="admin-list-page max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <DataListPage
        icon={<OrdersIcon />}
        breadcrumb="Orders"
        title={t.orders}
        secondaryAction={onExport ? { label: t.export, onClick: onExport } : undefined}
        primaryAction={onCreateOrder ? { label: t.createOrder, onClick: onCreateOrder } : undefined}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={search}
        onSearchChange={onSearchChange}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onAddFilter={() => {}}
        onClearAll={handleClearAll}
        searchPlaceholder={t.searchPlaceholder}
        sortOptions={SORT_OPTIONS}
        selectedSortOption={sortOption}
        sortDirection={sortDirection}
        onSortOptionChange={setSortOption}
        onSortDirectionChange={setSortDirection}
      >
        {filteredOrders.length === 0 ? (
          <EmptyState title={t.noOrders} description={t.noOrdersHint} />
        ) : (
          <OrderListTable orders={filteredOrders} />
        )}
      </DataListPage>
    </div>
  );
}
