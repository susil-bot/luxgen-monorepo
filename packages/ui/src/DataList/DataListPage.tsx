import React, { useRef, useState } from 'react';
import { PageHeader } from './PageHeader';
import { TabNav } from './TabNav';
import { FilterBar } from './FilterBar';
import { SortModal } from './SortModal';
import type { DataListTab, FilterChipData, SortOption, SortDirection } from './types';

export interface DataListPageProps {
  /** Page header */
  icon?: React.ReactNode;
  breadcrumb?: string;
  title: string;
  secondaryAction?: { label: string; onClick: () => void };
  primaryAction?: { label: string; onClick: () => void };

  /** Tabs */
  tabs: DataListTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;

  /** Search & filter */
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeFilters?: FilterChipData[];
  onRemoveFilter?: (filterId: string) => void;
  onAddFilter?: () => void;
  onClearAll?: () => void;
  searchPlaceholder?: string;

  /** Sort */
  sortOptions?: SortOption[];
  selectedSortOption?: string;
  sortDirection?: SortDirection;
  onSortOptionChange?: (optionId: string) => void;
  onSortDirectionChange?: (direction: SortDirection) => void;

  /** Content */
  children: React.ReactNode;
  className?: string;
}

export const DataListPage: React.FC<DataListPageProps> = ({
  icon,
  breadcrumb,
  title,
  secondaryAction,
  primaryAction,
  tabs,
  activeTab,
  onTabChange,
  searchQuery = '',
  onSearchChange,
  activeFilters = [],
  onRemoveFilter,
  onAddFilter,
  onClearAll,
  searchPlaceholder = 'Search',
  sortOptions = [],
  selectedSortOption,
  sortDirection = 'asc',
  onSortOptionChange,
  onSortDirectionChange,
  children,
  className = '',
}) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [showSort, setShowSort] = useState(false);
  // Ref attached to the TabNav sort button (passed through)
  const tabNavSortBtnRef = useRef<HTMLButtonElement>(null);

  const handleSearchCancel = () => {
    setSearchExpanded(false);
    onSearchChange?.('');
  };

  const hasSortOptions = sortOptions.length > 0;

  return (
    <div className={`flex flex-col min-h-full ${className}`}>
      {/* Page header */}
      <PageHeader
        icon={icon}
        breadcrumb={breadcrumb}
        title={title}
        secondaryAction={secondaryAction}
        primaryAction={primaryAction}
      />

      {/* Tab + filter card */}
      <div className="ios-card flex-1 overflow-hidden">
        {!searchExpanded ? (
          <TabNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onSearchToggle={() => setSearchExpanded(true)}
            onSortToggle={hasSortOptions ? () => setShowSort((v) => !v) : undefined}
            sortBtnRef={tabNavSortBtnRef}
            searchActive={searchQuery.length > 0 || activeFilters.length > 0}
          />
        ) : (
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={(q) => onSearchChange?.(q)}
            onSearchCancel={handleSearchCancel}
            activeFilters={activeFilters}
            onRemoveFilter={onRemoveFilter}
            onAddFilter={onAddFilter}
            onClearAll={onClearAll}
            placeholder={searchPlaceholder}
            sortOptions={sortOptions}
            selectedSortOption={selectedSortOption}
            sortDirection={sortDirection}
            onSortOptionChange={onSortOptionChange}
            onSortDirectionChange={onSortDirectionChange}
            moduleLabel={title}
          />
        )}

        {/* Page content (table, empty state, etc.) */}
        {children}
      </div>

      {/* Sort modal for TabNav (non-search-expanded) state */}
      {hasSortOptions && !searchExpanded && (
        <SortModal
          isOpen={showSort}
          onClose={() => setShowSort(false)}
          anchorRef={tabNavSortBtnRef}
          options={sortOptions}
          selectedOption={selectedSortOption ?? sortOptions[0]?.id ?? ''}
          direction={sortDirection ?? 'asc'}
          onOptionChange={(id) => onSortOptionChange?.(id)}
          onDirectionChange={(dir) => onSortDirectionChange?.(dir)}
          moduleLabel={title}
        />
      )}
    </div>
  );
};
