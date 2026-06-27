import type { NextApiRequest, NextApiResponse } from 'next';
import { applySession, bindSessionAuthAsync } from '@luxgen/agent';
import { requireAgentAuth } from '../../../lib/agent-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = requireAgentAuth(req, res);
  if (!auth) return;

  const { sessionId } = req.body as { sessionId: string };
  if (!sessionId) {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }

  await bindSessionAuthAsync(sessionId, auth);

  try {
    const result = applySession(sessionId);

    if (result.blocked) {
      res.status(409).json({
        ...result,
        blocked: true,
        hasConflicts: true,
        error: `${result.conflicts.length} file(s) changed on disk since staging. Apply blocked to protect your edits.`,
      });
      return;
    }

    res.status(200).json({
      ...result,
      blocked: false,
      hasConflicts: result.conflicts.length > 0,
      conflictWarning:
        result.conflicts.length > 0
          ? `${result.conflicts.length} file(s) changed on disk since staging. They were still applied, but review the changes.`
          : undefined,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
}
