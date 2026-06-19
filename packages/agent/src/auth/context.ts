import type { NextApiRequest } from 'next';
import { verifyToken } from '@luxgen/auth';
import { loadSession, saveSession } from '../changeset/session-store';
import { getAgentConfig } from '../config/agent-mode';
import type { AgentAuthContext } from '../types/task';

const DEV_CONTEXT: AgentAuthContext = {
  userId: 'dev-user',
  tenantId: 'demo',
  email: 'dev@luxgen.local',
  role: 'ADMIN',
};

export function isAuthRequired(): boolean {
  const mode = getAgentConfig().mode;
  return mode === 'staging' || mode === 'production';
}

export function extractBearerToken(req: NextApiRequest): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice(7);
}

export function resolveAgentAuth(req: NextApiRequest): AgentAuthContext | null {
  const token = extractBearerToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      return {
        userId: payload.id,
        tenantId: payload.tenant || 'demo',
        email: payload.email,
        role: payload.role,
      };
    }
  }

  const tenantHeader = req.headers['x-tenant-id'];
  const userHeader = req.headers['x-user-id'];
  if (typeof tenantHeader === 'string' && typeof userHeader === 'string') {
    return { userId: userHeader, tenantId: tenantHeader };
  }

  if (!isAuthRequired()) {
    return DEV_CONTEXT;
  }

  return null;
}

export function bindSessionAuth(
  sessionId: string,
  auth: AgentAuthContext,
  extras?: { mode?: 'interactive' | 'headless'; prompt?: string },
): void {
  const session = loadSession(sessionId);
  session.tenantId = auth.tenantId;
  session.userId = auth.userId;
  session.mode = extras?.mode || session.mode || 'interactive';
  if (extras?.prompt) session.prompt = extras.prompt;
  session.status = session.status || 'created';
  saveSession(session);
}
