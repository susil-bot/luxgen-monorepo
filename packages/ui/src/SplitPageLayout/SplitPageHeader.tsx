import type { ReactNode } from 'react';

export interface SplitPageHeaderProps {
  backHref: string;
  backLabel: string;
  title: string;
  /** Optional badges/chips beside the title */
  badges?: ReactNode;
  /** Avatar or icon before the title */
  leading?: ReactNode;
  /** Primary/secondary action buttons (Save, More actions, etc.) */
  actions?: ReactNode;
  className?: string;
}

/**
 * Responsive Shopify-style page header for SplitPageLayout create/edit/detail pages.
 * Stacks vertically on small screens; actions wrap on tablet.
 */
export function SplitPageHeader({
  backHref,
  backLabel,
  title,
  badges,
  leading,
  actions,
  className = '',
}: SplitPageHeaderProps) {
  return (
    <header className={`split-page-header ${className}`}>
      <div className="split-page-header__primary">
        <a href={backHref} className="ios-btn-plain text-sm flex-shrink-0 split-page-header__back">
          {backLabel}
        </a>
        <div className="split-page-header__title-row">
          {leading}
          <h1 className="split-page-header__title">{title}</h1>
          {badges && <div className="split-page-header__badges">{badges}</div>}
        </div>
      </div>
      {actions && <div className="split-page-header__actions">{actions}</div>}
    </header>
  );
}
