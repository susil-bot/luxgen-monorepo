import React from 'react';
import type { EmptyStateProps } from './types';

const DefaultSearchIcon = () => (
  <svg
    className="w-16 h-16"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ color: 'var(--color-label-tertiary)', strokeWidth: 1.2 }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="mb-5" aria-hidden="true">
        {icon ?? <DefaultSearchIcon />}
      </div>
      <p className="text-lg font-bold mb-1.5" style={{ color: 'var(--color-label-primary)' }}>
        {title}
      </p>
      {description && (
        <p className="text-sm" style={{ color: 'var(--color-label-secondary)' }}>
          {description}
        </p>
      )}
      {action && (
        <button type="button" onClick={action.onClick} className="ios-btn-secondary mt-5 text-sm">
          {action.label}
        </button>
      )}
    </div>
  );
};
