import type { SplitPageVariant } from './fetcher';
import { splitPageDefaults } from './fetcher';
import { SplitPageLayoutTranslations } from './translations';

export interface SplitPageLayoutProps {
  /** `main-aside` = Shopify detail (products, orders). `nav-main` = settings. `triple` = dev studio. */
  variant?: SplitPageVariant;
  header?: React.ReactNode;
  /** Primary column — forms, tables, detail sections */
  main: React.ReactNode;
  /** Right column — metadata sidebar (main-aside) or right inspector (triple) */
  aside?: React.ReactNode;
  /** Left column — settings nav (nav-main) or left panel (triple) */
  leading?: React.ReactNode;
  maxWidth?: string;
  stickyAside?: boolean;
  stickyLeading?: boolean;
  className?: string;
}

/**
 * Global two- (or three-) column page layout for admin surfaces.
 * Use inside AppLayout children — not a replacement for AppLayout.
 */
export function SplitPageLayout({
  variant = 'main-aside',
  header,
  main,
  aside,
  leading,
  maxWidth = splitPageDefaults.maxWidth,
  stickyAside = true,
  stickyLeading = false,
  className = '',
}: SplitPageLayoutProps) {
  const t = SplitPageLayoutTranslations.en;

  const gridClass = `split-page-grid split-page-grid--${variant}`;

  return (
    <div
      className={`split-page admin-split-page space-y-4 ${splitPageDefaults.pagePadding} ${className}`}
      style={{ maxWidth, marginLeft: 'auto', marginRight: 'auto' }}
    >
      {header}

      <div className={gridClass}>
        {variant === 'nav-main' && leading && (
          <nav
            className={`split-page-leading space-y-4 ${stickyLeading ? 'split-page-sticky' : ''}`}
            aria-label={t.navRegion}
          >
            {leading}
          </nav>
        )}

        {variant === 'triple' && leading && (
          <div className={`split-page-leading space-y-4 ${stickyLeading ? 'split-page-sticky' : ''}`}>
            {leading}
          </div>
        )}

        <div className="split-page-main space-y-4" role="region" aria-label={t.mainRegion}>
          {main}
        </div>

        {variant === 'main-aside' && aside && (
          <aside
            className={`split-page-aside space-y-4 ${stickyAside ? 'split-page-sticky' : ''}`}
            aria-label={t.asideRegion}
          >
            {aside}
          </aside>
        )}

        {variant === 'triple' && aside && (
          <aside
            className={`split-page-aside space-y-4 ${stickyAside ? 'split-page-sticky' : ''}`}
            aria-label={t.asideRegion}
          >
            {aside}
          </aside>
        )}
      </div>
    </div>
  );
}
