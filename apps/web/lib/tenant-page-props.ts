import type { GetServerSidePropsContext } from 'next';

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

export async function getTenantPageProps(context: GetServerSidePropsContext) {
  return { props: { tenant: resolvePageTenant(context) } };
}
