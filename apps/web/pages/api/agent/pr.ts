import type { NextApiRequest, NextApiResponse } from 'next';
import { createPullRequest, bindSessionAuthAsync } from '@luxgen/agent';
import { requireAgentAuth } from '../../../lib/agent-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = requireAgentAuth(req, res);
  if (!auth) return;

  const { sessionId, title, body } = req.body as {
    sessionId: string;
    title?: string;
    body?: string;
  };

  if (!sessionId) {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }

  await bindSessionAuthAsync(sessionId, auth);

  try {
    const result = await createPullRequest(sessionId, title, body);
    res.status(result.created ? 200 : 400).json(result);
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: errMsg });
  }
}
