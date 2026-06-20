import React from 'react';
import type { FilterChipProps, AddFilterChipProps } from './types';

export const FilterChip: React.FC<FilterChipProps> = ({ label, value, onRemove, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-[10px] py-1 text-sm font-medium rounded-full border transition-colors ${className}`}
      style={{
        borderColor: 'var(--color-separator-opaque)',
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-label-primary)',
      }}
    >
      <span>
        {label}: {value}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="flex-shrink-0 rounded-full p-0.5 transition-opacity hover:opacity-60 focus:outline-none focus:ring-1"
        style={{ color: 'var(--color-label-secondary)' }}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
};

export const AddFilterChip: React.FC<AddFilterChipProps> = ({ onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-[10px] py-1 text-sm font-medium rounded-full border transition-colors hover:opacity-75 ${className}`}
      style={{
        borderColor: 'var(--color-separator-opaque)',
        borderStyle: 'dashed',
        background: 'transparent',
        color: 'var(--color-label-secondary)',
      }}
    >
      Add filter
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
};
