import React from 'react';
import type { TabNavProps } from './types';

export interface TabNavExtendedProps extends TabNavProps {
  sortBtnRef?: React.Ref<HTMLButtonElement>;
}

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const FilterLinesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M10 18h4" />
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

export const TabNav: React.FC<TabNavExtendedProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onSearchToggle,
  onSortToggle,
  sortBtnRef,
  searchActive = false,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-0 ${className}`}
      style={{ borderBottom: '1px solid var(--color-separator)' }}
    >
      {/* Tab list */}
      <div className="flex flex-1 flex-wrap gap-0 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative ${
                isActive ? 'text-primary' : 'text-secondary hover:text-primary'
              }`}
              style={
                isActive
                  ? {
                      borderBottom: '2px solid var(--color-blue)',
                      marginBottom: -1,
                      color: 'var(--color-label-primary)',
                    }
                  : undefined
              }
              aria-selected={isActive}
              role="tab"
            >
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className="ml-1.5 text-xs text-tertiary">({tab.count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action icons */}
      {(onSearchToggle || onSortToggle) && (
        <div className="flex items-center gap-1.5 pl-3 pb-1 flex-shrink-0">
          {onSearchToggle && (
            <button
              type="button"
              onClick={onSearchToggle}
              aria-label="Search and filter"
              className={`p-2 rounded-xl border transition-colors ${
                searchActive ? 'text-accent' : 'text-secondary hover:text-primary'
              }`}
              style={{
                borderColor: 'var(--color-separator-opaque)',
                background: 'var(--color-bg-secondary)',
              }}
            >
              <span className="flex items-center gap-1">
                <SearchIcon />
                <FilterLinesIcon />
              </span>
            </button>
          )}
          {onSortToggle && (
            <button
              ref={sortBtnRef}
              type="button"
              onClick={onSortToggle}
              aria-label="Sort"
              aria-haspopup="dialog"
              className="p-2 rounded-xl border text-secondary hover:text-primary transition-colors"
              style={{
                borderColor: 'var(--color-separator-opaque)',
                background: 'var(--color-bg-secondary)',
              }}
            >
              <SortIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
