import type { NextApiRequest, NextApiResponse } from 'next';
import {
  commitStagedSession,
  runValidationPipeline,
  getValidationPolicy,
  validationBlocksCommit,
  appendAuditEntry,
  bindSessionAuthAsync,
  emitAgentAutomationEvent,
} from '@luxgen/agent';
import { requireAgentAuth } from '../../../lib/agent-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = requireAgentAuth(req, res);
  if (!auth) return;

  const { sessionId, message, skipValidation } = req.body as {
    sessionId: string;
    message?: string;
    skipValidation?: boolean;
  };

  if (!sessionId) {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }

  await bindSessionAuthAsync(sessionId, auth);

  try {
    if (!skipValidation) {
      const validation = await runValidationPipeline(sessionId);
      const policy = getValidationPolicy();
      if (validationBlocksCommit(validation, policy)) {
        await emitAgentAutomationEvent(auth.tenantId, 'failed', {
          sessionId,
          reason: 'validation_failed',
          validation,
        }).catch(() => {});
        res.status(422).json({
          error: 'Validation failed — fix issues before committing.',
          validation,
          policy,
        });
        return;
      }
      await appendAuditEntry({
        sessionId,
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: 'validated',
        details: { passed: validation.passed, strict: policy === 'strict' },
      });
    }

    const result = await commitStagedSession(sessionId, message);

    if (result.commitSha) {
      await appendAuditEntry({
        sessionId,
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: 'committed',
        details: { branch: result.branch, commitSha: result.commitSha, files: result.applied },
      });
      await emitAgentAutomationEvent(auth.tenantId, 'committed', {
        sessionId,
        branch: result.branch,
        commitSha: result.commitSha,
        files: result.applied,
      }).catch(() => {});
    }

    res.status(200).json({
      ...result,
      hasConflicts: result.conflicts.length > 0,
      committed: Boolean(result.commitSha),
    });
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: errMsg });
  }
}
