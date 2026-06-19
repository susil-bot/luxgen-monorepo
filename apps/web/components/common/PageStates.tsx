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

/** iOS empty / error placeholder for pages with no data */
export function PageEmptyState({ icon = '📭', title, subtitle, action }: PageEmptyStateProps) {
  return (
    <div className="ios-empty-state">
      <span className="empty-icon" aria-hidden="true">
        {icon}
      </span>
      <p className="empty-title">{title}</p>
      {subtitle && <p className="empty-subtitle">{subtitle}</p>}
      {action}
    </div>
  );
}
