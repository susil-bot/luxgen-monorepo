import type { NextApiRequest, NextApiResponse } from 'next';
import {
  bindSessionAuthAsync,
  enqueueHeadlessTask,
  isQueueEnabled,
  getTaskFromMongo,
  appendAuditEntry,
  loadSession,
  ensureSessionHydrated,
  ensureGitSession,
} from '@luxgen/agent';
import { getOllamaUrl } from '@luxgen/config';
import { requireAgentAuth } from '../../../lib/agent-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireAgentAuth(req, res);
  if (!auth) return;

  if (req.method === 'GET') {
    const sessionId = (req.query.sessionId || req.body?.sessionId) as string | undefined;
    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId' });
      return;
    }

    await ensureSessionHydrated(sessionId);
    const fsSession = loadSession(sessionId);
    const mongoTask = await getTaskFromMongo(sessionId);

    res.status(200).json({
      session: fsSession,
      task: mongoTask,
      queueEnabled: isQueueEnabled(),
    });
    return;
  }

  if (req.method === 'POST') {
    const { sessionId, prompt, model } = req.body as {
      sessionId: string;
      prompt: string;
      model?: string;
    };

    if (!sessionId || !prompt) {
      res.status(400).json({ error: 'Missing sessionId or prompt' });
      return;
    }

    await bindSessionAuthAsync(sessionId, auth, { mode: 'headless', prompt });
    await ensureGitSession(sessionId);

    const ollamaHost = getOllamaUrl();

    if (!isQueueEnabled()) {
      res.status(503).json({
        error: 'Headless queue unavailable. Set REDIS_URL and run apps/agent-worker.',
      });
      return;
    }

    const job = await enqueueHeadlessTask({
      sessionId,
      tenantId: auth.tenantId,
      userId: auth.userId,
      messages: [{ role: 'user', content: prompt }],
      ollamaHost,
      model,
    });

    if (!job) {
      res.status(503).json({ error: 'Failed to enqueue task' });
      return;
    }

    await appendAuditEntry({
      sessionId,
      tenantId: auth.tenantId,
      userId: auth.userId,
      action: 'enqueued',
      details: { jobId: job.id, prompt: prompt.slice(0, 200) },
    });

    res.status(202).json({ job, sessionId, status: 'enqueued' });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
