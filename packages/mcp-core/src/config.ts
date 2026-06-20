export interface LuxgenMcpConfig {
  graphqlUrl: string;
  jwt: string;
  tenant: string;
  transport: 'stdio' | 'http';
  production: boolean;
}

export function loadLuxgenMcpConfig(env: NodeJS.ProcessEnv = process.env): LuxgenMcpConfig {
  const graphqlUrl = env.LUXGEN_GRAPHQL_URL?.trim();
  const jwt = env.LUXGEN_JWT?.trim();
  const tenant = env.LUXGEN_TENANT?.trim();

  if (!graphqlUrl) {
    throw new Error('LUXGEN_GRAPHQL_URL is required (e.g. http://localhost:4000/graphql)');
  }
  if (!jwt) {
    throw new Error('LUXGEN_JWT is required — login to the web app and copy the Bearer token');
  }
  if (!tenant) {
    throw new Error('LUXGEN_TENANT is required (tenant subdomain, e.g. demo)');
  }

  const transport = env.MCP_TRANSPORT === 'http' ? 'http' : 'stdio';
  const production = env.NODE_ENV === 'production';

  return { graphqlUrl, jwt, tenant, transport, production };
}
