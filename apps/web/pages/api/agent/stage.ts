import type { NextApiRequest, NextApiResponse } from 'next';
import { loadSession, discardSession, discardGitSession, getGitStatus } from '@luxgen/agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query as { sessionId: string };

  if (!sessionId) {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }

  if (req.method === 'GET') {
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
