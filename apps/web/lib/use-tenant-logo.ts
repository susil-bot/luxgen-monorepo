import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { getDefaultLogo } from '@luxgen/ui';
import { GET_TENANT } from '../graphql/queries/tenants';
import { useAppTenant } from './app-layout-user';

export interface TenantLogoConfig {
  text: string;
  href: string;
  src?: string;
}

/** Tenant name + branding logo from GET_TENANT (UI-16). */
export function useTenantLogo(): TenantLogoConfig {
  const subdomain = useAppTenant();
  const { data } = useQuery(GET_TENANT, {
    variables: { subdomain },
    skip: !subdomain,
    fetchPolicy: 'cache-first',
  });

  return useMemo(() => {
    const fallback = getDefaultLogo();
    const tenant = data?.tenantBySubdomain;
    if (!tenant) return fallback;

    const settings = tenant.settings as Record<string, unknown> | null | undefined;
    const branding = settings?.branding as Record<string, unknown> | undefined;
    const logoUrl = typeof branding?.logo === 'string' ? branding.logo : undefined;
    const name = (tenant.name as string | undefined) || fallback.text;

    return {
      text: name,
      href: fallback.href,
      ...(logoUrl ? { src: logoUrl } : {}),
    };
  }, [data, subdomain]);
}
