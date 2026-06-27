export const AUTH_KEYS = {
  token: 'auth_token',
  tenantId: 'tenant_id',
  tenantSubdomain: 'tenant_subdomain',
  activeTenant: 'active_tenant_subdomain',
} as const;

const graphqlUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4000/graphql';
const restUrl = process.env.EXPO_PUBLIC_API_URL ?? graphqlUrl.replace(/\/graphql\/?$/, '');

export const API = {
  graphqlUrl,
  restUrl,
  defaultTenant: process.env.EXPO_PUBLIC_DEFAULT_TENANT ?? 'demo',
} as const;
