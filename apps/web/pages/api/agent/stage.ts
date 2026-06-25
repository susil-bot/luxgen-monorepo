import type { NextApiRequest, NextApiResponse } from 'next';
import { loadSession, discardSession, discardGitSession, getGitStatus, ensureSessionHydrated } from '@luxgen/agent';
import { requireAgentAuth } from '../../../lib/agent-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireAgentAuth(req, res);
  if (!auth) return;

  const { sessionId } = req.query as { sessionId: string };

  if (!sessionId) {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }

  if (req.method === 'GET') {
    await ensureSessionHydrated(sessionId);
    res.status(200).json(loadSession(sessionId));
    return;
  }

  if (req.method === 'DELETE') {
    const status = await getGitStatus(sessionId);
    if (status.available) {
      await discardGitSession(sessionId);
    } else {
      discardSession(sessionId);
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
