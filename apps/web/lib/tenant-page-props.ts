import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import type { LayoutUser } from './app-layout-user';
import { getLayoutUserFromRequest } from './server-layout-user';

export interface TenantPageProps {
  tenant: string;
  layoutUser?: LayoutUser | null;
}

// Same flat-hostname problem as apps/web/lib/tenant.ts's getTenantFromHost —
// kept in sync manually since this file resolves tenant server-side for
// getServerSideProps rather than from window.location.
const FLAT_HOST_SUFFIXES = ['.vercel.app', '.onrender.com', '.netlify.app'];

/** Resolve tenant subdomain from host + query (matches users.tsx pattern) */
export function resolvePageTenant(context: GetServerSidePropsContext): string {
  const host = context.req.headers.host;
  let tenant = 'demo';

  const isFlatHost = !!host && FLAT_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
  if (host?.includes('.') && !isFlatHost) {
    const subdomain = host.split('.')[0];
    if (subdomain && !['www', 'localhost', '127', '0'].includes(subdomain)) {
      tenant = subdomain;
    }
  }

  if (typeof context.query.tenant === 'string') {
    tenant = context.query.tenant;
  }

  return tenant;
}

export const getTenantPageProps: GetServerSideProps<TenantPageProps> = async (context) => {
  const layoutUser = getLayoutUserFromRequest(context.req);
  return {
    props: {
      tenant: resolvePageTenant(context),
      ...(layoutUser ? { layoutUser } : {}),
    },
  };
};
