import type { ReactNode } from 'react';
import { SplitPageLayout } from './SplitPageLayout';
import type { SplitPageVariant } from './fetcher';
import { splitPageDefaults } from './fetcher';

export interface EntityFormPageLayoutProps {
  /** Shopify detail layout — main form + sticky metadata sidebar */
  variant?: SplitPageVariant;
  header: ReactNode;
  main: ReactNode;
  aside?: ReactNode;
  maxWidth?: string;
  stickyAside?: boolean;
  className?: string;
}

/**
 * Standard create/edit/detail shell for commerce entities (product, order, customer).
 * Wraps SplitPageLayout with shared max-width and responsive defaults.
 */
export function EntityFormPageLayout({
  variant = 'main-aside',
  header,
  main,
  aside,
  maxWidth = splitPageDefaults.maxWidth,
  stickyAside = true,
  className = '',
}: EntityFormPageLayoutProps) {
  return (
    <SplitPageLayout
      variant={variant}
      header={header}
      main={main}
      aside={aside}
      maxWidth={maxWidth}
      stickyAside={stickyAside}
      className={`entity-form-page ${className}`}
    />
  );
}
