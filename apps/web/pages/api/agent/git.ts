import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureGitSession, getGitStatus } from '@luxgen/agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionId = (req.query.sessionId || req.body?.sessionId) as string | undefined;

  if (!sessionId) {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }

  if (req.method === 'GET') {
    const status = await getGitStatus(sessionId);
    res.status(200).json(status);
    return;
  }

  if (req.method === 'POST') {
    try {
      const info = await ensureGitSession(sessionId);
      if (!info) {
        const status = await getGitStatus(sessionId);
        res.status(200).json({ initialized: false, ...status });
        return;
      }
      res.status(200).json({ initialized: true, ...info, ...(await getGitStatus(sessionId)) });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
