import { useQuery } from '@apollo/client';

import { GET_TENANT } from '../graphql/queries/tenants';

export function useLearnTenant(tenantSubdomain: string) {
  const { data, loading, error } = useQuery(GET_TENANT, {
    variables: { subdomain: tenantSubdomain },
  });

  const tenant = data?.tenantBySubdomain;

  return {
    tenantId: tenant?.id as string | undefined,
    tenantName: tenant?.name as string | undefined,
    tenantSettings: tenant?.settings,
    loading,
    error,
  };
}
