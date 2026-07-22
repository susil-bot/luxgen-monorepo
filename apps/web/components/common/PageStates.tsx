import React from 'react';
import { NotFound } from '@luxgen/ui';

interface PageLoadingStateProps {
  label?: string;
  fullScreen?: boolean;
}

/** iOS-style loading state for page-level data fetches */
export function PageLoadingState({ label = 'Loading…', fullScreen = true }: PageLoadingStateProps) {
  return (
    <div className={fullScreen ? 'auth-loading-screen' : 'flex flex-col items-center justify-center gap-4 py-16'}>
      <div className="ios-spinner ios-spinner-lg" aria-hidden="true" />
      <p className="auth-loading-screen__label">{label}</p>
    </div>
  );
}

interface PageEmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/** Empty state — wraps @luxgen/ui NotFound for consistency (UI-189). */
export function PageEmptyState({ icon = '📭', title, subtitle, action }: PageEmptyStateProps) {
  return (
    <NotFound
      title={title}
      description={subtitle}
      variant="detailed"
      showIllustration={false}
      showSearch={false}
      showNavigation={false}
      customActions={
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl" aria-hidden>
            {icon}
          </span>
          {action}
        </div>
      }
    />
  );
}
