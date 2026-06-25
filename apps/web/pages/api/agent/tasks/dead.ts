import type { NextApiRequest, NextApiResponse } from 'next';
import { listDeadLetterJobs } from '@luxgen/agent';
import { requireAgentAdmin } from '../../../../lib/agent-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = requireAgentAdmin(req, res);
  if (!auth) return;

  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const jobs = await listDeadLetterJobs(limit);
  res.status(200).json({ jobs, count: jobs.length });
}
