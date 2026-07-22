import { randomUUID } from 'crypto';
import type { Express, Request, Response } from 'express';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { resolveMcpScopes } from '../config';
import { LuxgenGraphqlClient } from '../graphql/client';
import { McpRateLimiter, rateLimitKey } from '../rate-limit';
import { createLuxgenMcpServer } from '../server';
import { authRateLimitKey, extractHttpAuth, isInitializeBody } from './http-auth';

export interface HttpMcpServerOptions {
  graphqlUrl: string;
  production: boolean;
  host: string;
  port: number;
  path: string;
  allowedHosts?: string[];
  rateLimitMax: number;
  rateLimitWindowMs: number;
}

interface McpSession {
  transport: StreamableHTTPServerTransport;
  server: McpServer;
}

const sessions = new Map<string, McpSession>();

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function applyRateLimitHeaders(res: Response, max: number, remaining: number, resetAt: number): void {
  res.set('X-Rate-Limit-Limit', String(max));
  res.set('X-Rate-Limit-Remaining', String(remaining));
  res.set('X-Rate-Limit-Reset', new Date(resetAt).toISOString());
}

async function createSession(
  options: HttpMcpServerOptions,
  auth: NonNullable<ReturnType<typeof extractHttpAuth>>,
): Promise<McpSession> {
  const client = new LuxgenGraphqlClient({
    graphqlUrl: options.graphqlUrl,
    tenant: auth.tenant,
    jwt: auth.jwt,
    mcpApiKey: auth.mcpApiKey,
  });

  const config = await resolveMcpScopes(
    {
      graphqlUrl: options.graphqlUrl,
      tenant: auth.tenant,
      transport: 'http',
      production: options.production,
      jwt: auth.jwt,
      mcpApiKey: auth.mcpApiKey,
    },
    client,
  );

  let sessionRef: McpSession | undefined;

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      if (sessionRef) {
        sessions.set(sessionId, sessionRef);
      }
    },
    onsessionclosed: (sessionId) => {
      sessions.delete(sessionId);
    },
  });

  const server = createLuxgenMcpServer(client, {
    tenant: config.tenant,
    production: config.production,
    scopes: config.scopes,
    keyId: config.keyId,
  });

  sessionRef = { transport, server };
  await server.connect(transport);
  return sessionRef;
}

async function resolveTransport(
  req: Request,
  res: Response,
  options: HttpMcpServerOptions,
): Promise<StreamableHTTPServerTransport | null> {
  const sessionHeader = req.get('mcp-session-id')?.trim();
  if (sessionHeader) {
    const existing = sessions.get(sessionHeader);
    if (!existing) {
      res.status(404).json({ error: 'Unknown MCP session' });
      return null;
    }
    return existing.transport;
  }

  if (!isInitializeBody(req.body)) {
    res.status(400).json({ error: 'Missing mcp-session-id or initialize request' });
    return null;
  }

  const auth = extractHttpAuth(req);
  if (!auth) {
    res.status(401).json({ error: 'Authentication required: set x-tenant and x-mcp-api-key (or Bearer JWT)' });
    return null;
  }

  try {
    const session = await createSession(options, auth);
    return session.transport;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(403).json({ error: message });
    return null;
  }
}

export function createHttpMcpApp(options: HttpMcpServerOptions): Express {
  const limiter = new McpRateLimiter(options.rateLimitMax, options.rateLimitWindowMs);
  const app = createMcpExpressApp({
    host: options.host,
    allowedHosts: options.allowedHosts,
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'luxgen-mcp', transport: 'http' });
  });

  const handleMcp = async (req: Request, res: Response): Promise<void> => {
    const auth = extractHttpAuth(req);
    const ip = clientIp(req);
    const { limited, remaining, resetAt } = limiter.check(rateLimitKey(authRateLimitKey(auth, ip), ip));
    applyRateLimitHeaders(res, options.rateLimitMax, remaining, resetAt);

    if (limited) {
      res.status(429).json({ error: 'Too many MCP requests. Please try again later.' });
      return;
    }

    const transport = await resolveTransport(req, res, options);
    if (!transport) return;

    await transport.handleRequest(req, res, req.body);
  };

  app.get(options.path, handleMcp);
  app.post(options.path, handleMcp);
  app.delete(options.path, handleMcp);

  return app;
}

export async function runHttpServer(options: HttpMcpServerOptions): Promise<void> {
  const app = createHttpMcpApp(options);

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(options.port, options.host, () => {
      console.error(
        `[luxgen-mcp] HTTP listening on http://${options.host}:${options.port}${options.path} (health: /health)`,
      );
      resolve();
    });
    server.on('error', reject);
  });
}
