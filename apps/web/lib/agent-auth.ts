import type { NextApiRequest, NextApiResponse } from 'next';
import { isAuthRequired, resolveAgentAuth } from '@luxgen/agent';
import type { AgentAuthContext } from '@luxgen/agent';
import { hasRoleAtLeast, UserRole } from '@luxgen/auth';
import { requirePlanFeature } from './plan-gate';

export function requireAgentAuth(req: NextApiRequest, res: NextApiResponse): AgentAuthContext | null {
  const auth = resolveAgentAuth(req);
  if (!auth) {
    res.status(401).json({
      error: isAuthRequired()
        ? 'Authentication required. Pass Authorization: Bearer <token>.'
        : 'Unable to resolve agent auth context.',
    });
    return null;
  }
  return auth;
}

/** Agent admin endpoints require ADMIN role or higher. */
export function requireAgentAdmin(req: NextApiRequest, res: NextApiResponse): AgentAuthContext | null {
  const auth = requireAgentAuth(req, res);
  if (!auth) return null;

  const role = auth.role as UserRole | undefined;
  if (!role || !hasRoleAtLeast(role, UserRole.ADMIN)) {
    res.status(403).json({ error: 'Admin role required.' });
    return null;
  }

  if (auth.tenantId && role !== UserRole.SUPER_ADMIN) {
    const queryTenant = req.query.tenantId as string | undefined;
    if (queryTenant && queryTenant !== auth.tenantId) {
      res.status(403).json({ error: 'Cannot list tasks for another tenant.' });
      return null;
    }
  }

  return auth;
}

/** Agent Studio requires Enterprise plan (unless tenant is on enterprise in dev). */
export async function requireAgentStudio(req: NextApiRequest, res: NextApiResponse): Promise<AgentAuthContext | null> {
  const auth = requireAgentAuth(req, res);
  if (!auth) return null;

  const plan = await requirePlanFeature(auth.tenantId, 'agentStudio', res, req);
  if (!plan) return null;

  return auth;
}
