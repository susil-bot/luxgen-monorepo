import React, { useState, useMemo } from 'react';
import type { CustomerFilterTab, CustomerRow } from './fetcher';
import { customerListTabs } from './list/CustomerListTabs/fetcher';
import { CustomerListTable } from './list/CustomerListTable';
import { CustomerTranslations } from './translations';
import { DataListPage, EmptyState } from '../DataList';
import type { DataListTab, FilterChipData, SortOption } from '../DataList';

export interface CustomerListViewProps {
  customers: CustomerRow[];
  activeTab: CustomerFilterTab;
  onTabChange: (tab: CustomerFilterTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onAddCustomer?: () => void;
  onExport?: () => void;
}

const SORT_OPTIONS: SortOption[] = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'orders', label: 'Orders' },
  { id: 'spent', label: 'Amount spent' },
];

const tabs: DataListTab[] = customerListTabs.map((t) => ({ id: t.id, label: t.label }));

export function CustomerListView({
  customers,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  onAddCustomer,
  onExport,
}: CustomerListViewProps) {
  const t = CustomerTranslations.en;
  const [activeFilters, setActiveFilters] = useState<FilterChipData[]>([]);
  const [sortOption, setSortOption] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleRemoveFilter = (id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setActiveFilters([]);
    onSearchChange('');
  };

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [customers, search]);

  const isEmpty = filteredCustomers.length === 0;

  return (
    <div className="admin-list-page max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <DataListPage
        title={t.customers}
        secondaryAction={onExport ? { label: 'Export', onClick: onExport } : undefined}
        primaryAction={onAddCustomer ? { label: 'Add customer', onClick: onAddCustomer } : undefined}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => onTabChange(id as CustomerFilterTab)}
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
        {isEmpty ? (
          <EmptyState title="No customers found" description="Try changing the filters or search term" />
        ) : (
          <CustomerListTable customers={filteredCustomers} />
        )}
      </DataListPage>
    </div>
  );
}
