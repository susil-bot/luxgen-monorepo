import Head from 'next/head';
import { useRouter } from 'next/router';

export interface PageHeadProps {
  title: string;
  description?: string;
  /** noindex for admin/authenticated pages */
  robots?: 'index' | 'noindex';
  ogImage?: string;
  canonical?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = 'LuxGen';
const DEFAULT_DESCRIPTION = 'LuxGen — multi-tenant learning, commerce, and automation platform.';

function buildCanonical(pathname: string, host?: string): string | undefined {
  if (!host || typeof window === 'undefined') return undefined;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}${pathname}`;
}

/** Shared page metadata — title, description, Open Graph, Twitter, robots (UI-126–131, 135). */
export function PageHead({
  title,
  description = DEFAULT_DESCRIPTION,
  robots = 'index',
  ogImage,
  canonical,
  jsonLd,
}: PageHeadProps) {
  const router = useRouter();
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  const canonicalUrl =
    canonical ??
    (typeof window !== 'undefined' ? buildCanonical(router.asPath.split('?')[0], window.location.host) : undefined);

  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {robots === 'noindex' ? <meta name="robots" content="noindex,nofollow" /> : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
    </Head>
  );
}

const ROUTE_TITLES: Record<string, { title: string; robots?: 'noindex' }> = {
  '/dashboard': { title: 'Dashboard' },
  '/courses': { title: 'Courses' },
  '/products': { title: 'Products' },
  '/orders': { title: 'Orders' },
  '/customers': { title: 'Customers' },
  '/analytics': { title: 'Analytics', robots: 'noindex' },
  '/automations': { title: 'Automations', robots: 'noindex' },
  '/agent': { title: 'AI Studio', robots: 'noindex' },
  '/developer': { title: 'Developer', robots: 'noindex' },
  '/listings': { title: 'Business Listings' },
  '/marketplace': { title: 'Marketplace' },
  '/settings': { title: 'Settings', robots: 'noindex' },
  '/profile': { title: 'Profile', robots: 'noindex' },
  '/login': { title: 'Sign In' },
  '/register': { title: 'Create Account' },
};

/** Fallback Head when a page omits its own — derives title from route (UI-135). */
export function DefaultPageHead() {
  const router = useRouter();
  const base = router.pathname.replace(/\[.*?\]/g, '').replace(/\/$/, '') || '/';
  const config = ROUTE_TITLES[base] ??
    ROUTE_TITLES[router.pathname] ?? {
      title: base.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'LuxGen',
      robots: router.pathname.startsWith('/admin') ? ('noindex' as const) : undefined,
    };

  const robots =
    config.robots ??
    (router.pathname.startsWith('/admin') ||
    router.pathname.startsWith('/organization') ||
    ['/agent', '/developer', '/automations'].some((p) => router.pathname.startsWith(p))
      ? 'noindex'
      : 'index');

  return <PageHead title={config.title.charAt(0).toUpperCase() + config.title.slice(1)} robots={robots} />;
}
