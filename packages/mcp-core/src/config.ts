import type { LuxgenGraphqlClient } from './graphql/client';
import { MCP_KEY_CONTEXT, type McpKeyContextResult } from './graphql/mcp-queries';

export type McpScope = 'read' | 'write';

export interface LuxgenMcpConfig {
  graphqlUrl: string;
  tenant: string;
  transport: 'stdio' | 'http';
  production: boolean;
  jwt?: string;
  mcpApiKey?: string;
  keyId?: string;
  scopes: McpScope[];
}

export interface HttpMcpRuntimeConfig {
  graphqlUrl: string;
  transport: 'http';
  production: boolean;
  host: string;
  port: number;
  path: string;
  allowedHosts?: string[];
  rateLimitMax: number;
  rateLimitWindowMs: number;
}

export type LoadedMcpConfig =
  | (Omit<LuxgenMcpConfig, 'scopes'> & { scopes?: McpScope[]; transport: 'stdio' })
  | HttpMcpRuntimeConfig;

function parseScopesFromEnv(raw: string | undefined): McpScope[] | null {
  if (!raw?.trim()) return null;
  const parts = raw.split(',').map((s) => s.trim().toLowerCase());
  const scopes: McpScope[] = [];
  for (const p of parts) {
    if (p === 'read' || p === 'write') scopes.push(p);
  }
  return scopes.length ? scopes : null;
}

function parseAllowedHosts(raw: string | undefined): string[] | undefined {
  if (!raw?.trim()) return undefined;
  const hosts = raw
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
  return hosts.length ? hosts : undefined;
}

export function loadLuxgenMcpConfig(env: NodeJS.ProcessEnv = process.env): LoadedMcpConfig {
  const graphqlUrl = env.LUXGEN_GRAPHQL_URL?.trim();
  if (!graphqlUrl) {
    throw new Error('LUXGEN_GRAPHQL_URL is required (e.g. http://localhost:4000/graphql)');
  }

  const transport = env.MCP_TRANSPORT === 'http' ? 'http' : 'stdio';
  const production = env.NODE_ENV === 'production';

  if (transport === 'http') {
    const host = env.MCP_HTTP_HOST?.trim() || (production ? '0.0.0.0' : '127.0.0.1');
    const port = Number(env.MCP_HTTP_PORT || env.PORT || 3100);
    const path = env.MCP_HTTP_PATH?.trim() || '/mcp';
    const rateLimitMax = Number(env.MCP_RATE_LIMIT_MAX || 120);
    const rateLimitWindowMs = Number(env.MCP_RATE_LIMIT_WINDOW_MS || 60_000);

    return {
      graphqlUrl,
      transport: 'http',
      production,
      host,
      port,
      path,
      allowedHosts: parseAllowedHosts(env.MCP_ALLOWED_HOSTS),
      rateLimitMax,
      rateLimitWindowMs,
    };
  }

  const jwt = env.LUXGEN_JWT?.trim();
  const mcpApiKey = env.LUXGEN_MCP_API_KEY?.trim();
  const tenant = env.LUXGEN_TENANT?.trim();

  if (!jwt && !mcpApiKey) {
    throw new Error('Set LUXGEN_JWT or LUXGEN_MCP_API_KEY for authentication');
  }
  if (jwt && mcpApiKey) {
    throw new Error('Use either LUXGEN_JWT or LUXGEN_MCP_API_KEY, not both');
  }
  if (!tenant) {
    throw new Error('LUXGEN_TENANT is required (tenant subdomain, e.g. demo)');
  }

  const scopes = parseScopesFromEnv(env.LUXGEN_MCP_SCOPES) ?? undefined;

  return { graphqlUrl, jwt, mcpApiKey, tenant, transport: 'stdio', production, scopes };
}

export async function resolveMcpScopes(
  partial: Omit<LuxgenMcpConfig, 'scopes'> & { scopes?: McpScope[] },
  client: LuxgenGraphqlClient,
): Promise<LuxgenMcpConfig> {
  if (partial.jwt) {
    return {
      ...partial,
      scopes: partial.scopes ?? ['read', 'write'],
    };
  }

  if (partial.scopes?.length) {
    return { ...partial, scopes: partial.scopes };
  }

  const data = await client.query<McpKeyContextResult>(MCP_KEY_CONTEXT);
  if (!data.mcpKeyContext) {
    throw new Error('mcpKeyContext unavailable — check LUXGEN_MCP_API_KEY and x-tenant');
  }

  const scopes = data.mcpKeyContext.scopes.map((s) => s.toLowerCase() as McpScope);
  return {
    ...partial,
    keyId: data.mcpKeyContext.keyId,
    scopes,
  };
}
