import type { NextApiRequest, NextApiResponse } from 'next';
import { listTasksFromMongo } from '@luxgen/agent';
import type { TaskStatus } from '@luxgen/agent';
import { requireAgentAdmin } from '../../../../lib/agent-auth';

const VALID_STATUSES: TaskStatus[] = [
  'created',
  'running',
  'staged',
  'validating',
  'pending_review',
  'committed',
  'merged',
  'failed',
  'cancelled',
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = requireAgentAdmin(req, res);
  if (!auth) return;

  const tenantId = (req.query.tenantId as string | undefined) || auth.tenantId;
  if (!tenantId) {
    res.status(400).json({ error: 'Missing tenantId' });
    return;
  }

  const status = req.query.status as string | undefined;
  if (status && !VALID_STATUSES.includes(status as TaskStatus)) {
    res.status(400).json({ error: 'Invalid status filter' });
    return;
  }

  const limitRaw = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
  const limit = Number.isFinite(limitRaw) ? limitRaw : 20;
  const cursor = req.query.cursor as string | undefined;

  const result = await listTasksFromMongo({ tenantId, status, limit, cursor });
  res.status(200).json(result);
}
