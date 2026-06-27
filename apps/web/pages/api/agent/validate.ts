import type { NextApiRequest, NextApiResponse } from 'next';
import {
  runValidationPipeline,
  getSessionValidation,
  appendAuditEntry,
  bindSessionAuthAsync,
  updateTaskValidation,
} from '@luxgen/agent';
import { requireAgentAuth } from '../../../lib/agent-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query as { sessionId?: string };

  if (req.method === 'GET') {
    const getAuth = requireAgentAuth(req, res);
    if (!getAuth) return;
    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId' });
      return;
    }
    const cached = getSessionValidation(sessionId);
    res.status(200).json(cached || { passed: null, checks: [], ranAt: null });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = requireAgentAuth(req, res);
  if (!auth) return;

  const bodySessionId = (req.body as { sessionId?: string }).sessionId;
  const id = bodySessionId || sessionId;
  if (!id) {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }

  await bindSessionAuthAsync(id, auth);

  try {
    const result = await runValidationPipeline(id);
    await updateTaskValidation(id, result);
    await appendAuditEntry({
      sessionId: id,
      tenantId: auth.tenantId,
      userId: auth.userId,
      action: 'validated',
      details: {
        passed: result.passed,
        checks: result.checks.map((c) => ({ name: c.name, scope: c.scope, passed: c.passed })),
      },
    });
    res.status(200).json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
}
