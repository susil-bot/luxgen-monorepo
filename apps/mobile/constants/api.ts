export const AUTH_KEYS = {
  token: 'auth_token',
  tenantId: 'tenant_id',
  tenantSubdomain: 'tenant_subdomain',
} as const;

export const API = {
  graphqlUrl: process.env.EXPO_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4000/graphql',
  defaultTenant: process.env.EXPO_PUBLIC_DEFAULT_TENANT ?? 'demo',
} as const;
