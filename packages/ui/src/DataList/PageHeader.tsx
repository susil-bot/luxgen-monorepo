import React from 'react';
import type { PageHeaderProps } from './types';

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  breadcrumb,
  title,
  secondaryAction,
  primaryAction,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        {icon && (
          <span className="text-secondary flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        {breadcrumb && (
          <>
            <span className="text-secondary flex-shrink-0">{breadcrumb}</span>
            <svg
              className="w-3.5 h-3.5 text-tertiary flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
        <h1 className="text-[22px] font-bold tracking-tight text-primary truncate">{title}</h1>
      </div>

      {(secondaryAction || primaryAction) && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-[20px] py-[10px] text-sm font-semibold rounded-xl border transition-colors"
              style={{
                color: 'var(--color-label-primary)',
                borderColor: 'var(--color-separator-opaque)',
                background: 'var(--color-bg-secondary)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-fill-quaternary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-secondary)';
              }}
            >
              {secondaryAction.label}
            </button>
          )}
          {primaryAction && (
            <button type="button" onClick={primaryAction.onClick} className="ios-btn-primary text-sm px-4 py-2">
              {primaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
