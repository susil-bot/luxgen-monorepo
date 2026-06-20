import type { Request } from 'express';

export interface McpHttpAuth {
  tenant: string;
  mcpApiKey?: string;
  jwt?: string;
}

export function extractHttpAuth(req: Request): McpHttpAuth | null {
  const tenant = req.get('x-tenant')?.trim();
  if (!tenant) return null;

  const mcpApiKey = req.get('x-mcp-api-key')?.trim();
  if (mcpApiKey) {
    return { tenant, mcpApiKey };
  }

  const authorization = req.get('authorization')?.trim();
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    const jwt = authorization.slice(7).trim();
    if (jwt) return { tenant, jwt };
  }

  return null;
}

export function authRateLimitKey(auth: McpHttpAuth | null, ip: string): string {
  if (auth?.mcpApiKey) {
    return `key:${auth.mcpApiKey.slice(0, 24)}`;
  }
  if (auth?.jwt) {
    return `jwt:${auth.tenant}`;
  }
  return `anon:${ip}`;
}

function isRpcMessage(value: unknown): value is { method?: string } {
  return typeof value === 'object' && value !== null && 'method' in value;
}

export function isInitializeBody(body: unknown): boolean {
  const messages = Array.isArray(body) ? body : [body];
  return messages.some((m) => isRpcMessage(m) && m.method === 'initialize');
}
