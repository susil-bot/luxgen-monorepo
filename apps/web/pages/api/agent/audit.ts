import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuditLog } from '@luxgen/agent';
import { requireAgentAuth } from '../../../lib/agent-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = requireAgentAuth(req, res);
  if (!auth) return;

  const { sessionId, limit } = req.query as { sessionId?: string; limit?: string };

  if (!sessionId) {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }

  const entries = await getAuditLog(sessionId, limit ? parseInt(limit, 10) : 50);
  res.status(200).json({ sessionId, entries });
}
