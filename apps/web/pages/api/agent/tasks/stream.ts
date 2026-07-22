import type { NextApiRequest, NextApiResponse } from 'next';
import { getTaskFromMongo } from '@luxgen/agent';
import type { TaskStatus } from '@luxgen/agent';
import { requireAgentAuth } from '../../../../lib/agent-auth';

const TERMINAL_STATUSES: TaskStatus[] = ['pending_review', 'failed', 'merged', 'cancelled'];
const POLL_INTERVAL_MS = 2000;

function sendEvent(res: NextApiResponse, data: Record<string, unknown>) {
  if (res.writableEnded) return;
  res.write(`data: ${JSON.stringify(data)}\n\n`);
  (res as NextApiResponse & { flush?: () => void }).flush?.();
}

function isTerminal(status: string | undefined): boolean {
  return TERMINAL_STATUSES.includes(status as TaskStatus);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = requireAgentAuth(req, res);
  if (!auth) return;

  const sessionId = req.query.sessionId as string | undefined;
  if (!sessionId) {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.status(200);
  res.flushHeaders();

  let closed = false;
  let lastStatus: string | undefined;

  const endStream = () => {
    if (closed || res.writableEnded) return;
    closed = true;
    res.end();
  };

  req.on('close', () => {
    closed = true;
  });

  const poll = async () => {
    if (closed) return;

    const task = await getTaskFromMongo(sessionId);
    if (!task) {
      sendEvent(res, { type: 'status', status: 'created', validation: null });
      return;
    }

    const tenantId = task.tenantId as string | undefined;
    if (tenantId && tenantId !== auth.tenantId) {
      sendEvent(res, { type: 'error', message: 'Forbidden' });
      endStream();
      return;
    }

    const status = (task.status as string) || 'created';
    const validation = task.validation ?? null;

    if (status !== lastStatus) {
      lastStatus = status;
      sendEvent(res, { type: 'status', status, validation });
    }

    if (isTerminal(status)) {
      sendEvent(res, { type: 'done', status, validation });
      endStream();
    }
  };

  await poll();

  const interval = setInterval(async () => {
    if (closed) {
      clearInterval(interval);
      return;
    }
    await poll();
  }, POLL_INTERVAL_MS);

  req.on('close', () => clearInterval(interval));

  setTimeout(
    () => {
      clearInterval(interval);
      if (!closed) {
        sendEvent(res, { type: 'error', message: 'Stream timed out' });
        endStream();
      }
    },
    30 * 60 * 1000,
  );
}
