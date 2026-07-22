import React, { useEffect, useRef, useState } from 'react';
import type { FilterBarProps } from './types';
import { FilterChip, AddFilterChip } from './FilterChip';
import { SortModal } from './SortModal';

const SearchIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const SortIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
    />
  </svg>
);

export interface FilterBarWithSortProps extends FilterBarProps {
  sortOptions?: Array<{ id: string; label: string }>;
  selectedSortOption?: string;
  sortDirection?: 'asc' | 'desc';
  onSortOptionChange?: (optionId: string) => void;
  onSortDirectionChange?: (direction: 'asc' | 'desc') => void;
  /** Label shown in SortModal heading, e.g. "Orders", "Users" */
  moduleLabel?: string;
}

export const FilterBar: React.FC<FilterBarWithSortProps> = ({
  searchQuery,
  onSearchChange,
  onSearchCancel,
  activeFilters = [],
  onRemoveFilter,
  onAddFilter,
  onClearAll,
  placeholder = 'Search',
  sortOptions = [],
  selectedSortOption,
  sortDirection = 'asc',
  onSortOptionChange,
  onSortDirectionChange,
  moduleLabel,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasFilters = activeFilters.length > 0;

  return (
    <div className={className}>
      {/* ── Search row ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: 'var(--color-separator)' }}>
        <span className="text-secondary flex-shrink-0">
          <SearchIcon />
        </span>

        <input
          ref={inputRef}
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm bg-transparent outline-none min-w-0"
          style={{ color: 'var(--color-label-primary)' }}
          aria-label="Search"
        />

        <button
          type="button"
          onClick={onSearchCancel}
          className="flex-shrink-0 text-sm font-medium"
          style={{ color: 'var(--color-blue)', padding: '0 4px' }}
        >
          Cancel
        </button>

        {sortOptions.length > 0 && (
          <button
            ref={sortBtnRef}
            type="button"
            onClick={() => setShowSort((v) => !v)}
            aria-label="Sort"
            aria-expanded={showSort}
            aria-haspopup="dialog"
            className="flex-shrink-0 p-2 rounded-xl border transition-colors"
            style={{
              borderColor: showSort ? 'var(--color-blue)' : 'var(--color-separator-opaque)',
              background: showSort ? 'rgba(0,122,255,0.08)' : 'var(--color-bg-secondary)',
              color: showSort ? 'var(--color-blue)' : 'var(--color-label-secondary)',
            }}
          >
            <SortIcon />
          </button>
        )}
      </div>

      {/* ── Active filter chips row ──────────────────────────────────────── */}
      {(hasFilters || onAddFilter) && (
        <div
          className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b"
          style={{ borderColor: 'var(--color-separator)' }}
          role="group"
          aria-label="Active filters"
        >
          {activeFilters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              value={filter.value}
              onRemove={() => onRemoveFilter?.(filter.id)}
            />
          ))}
          {onAddFilter && <AddFilterChip onClick={onAddFilter} />}
          {hasFilters && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-sm font-medium"
              style={{ color: 'var(--color-label-secondary)', padding: '0 4px' }}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* ── Sort modal (portal) ──────────────────────────────────────────── */}
      <SortModal
        isOpen={showSort}
        onClose={() => setShowSort(false)}
        anchorRef={sortBtnRef}
        options={sortOptions}
        selectedOption={selectedSortOption ?? sortOptions[0]?.id ?? ''}
        direction={sortDirection}
        onOptionChange={(id) => onSortOptionChange?.(id)}
        onDirectionChange={(dir) => onSortDirectionChange?.(dir)}
        moduleLabel={moduleLabel}
      />
    </div>
  );
};
