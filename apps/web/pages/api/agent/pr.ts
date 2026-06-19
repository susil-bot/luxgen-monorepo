import type { NextApiRequest, NextApiResponse } from 'next';
import { createPullRequest } from '@luxgen/agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { sessionId, title, body } = req.body as {
    sessionId: string;
    title?: string;
    body?: string;
  };

  if (!sessionId) {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }

  try {
    const result = await createPullRequest(sessionId, title, body);
    res.status(result.created ? 200 : 400).json(result);
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: errMsg });
  }
}
