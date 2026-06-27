import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import type { LayoutUser } from './app-layout-user';
import { getLayoutUserFromRequest } from './server-layout-user';

export interface TenantPageProps {
  tenant: string;
  layoutUser?: LayoutUser | null;
}

/** Resolve tenant subdomain from host + query (matches users.tsx pattern) */
export function resolvePageTenant(context: GetServerSidePropsContext): string {
  const host = context.req.headers.host;
  let tenant = 'demo';

  if (host?.includes('.')) {
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
