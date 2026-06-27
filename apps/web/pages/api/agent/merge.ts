import type { NextApiRequest, NextApiResponse } from 'next';
import { mergeAgentBranch, appendAuditEntry, bindSessionAuthAsync, emitAgentAutomationEvent } from '@luxgen/agent';
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
    const result = await mergeAgentBranch(sessionId);
    if (result.merged) {
      await appendAuditEntry({
        sessionId,
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: 'merged',
        details: { branch: result.branch, commitSha: result.commitSha },
      });
      await emitAgentAutomationEvent(auth.tenantId, 'merged', {
        sessionId,
        branch: result.branch,
        commitSha: result.commitSha,
      }).catch(() => {});
    }
    res.status(result.merged ? 200 : 409).json(result);
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: errMsg });
  }
}
