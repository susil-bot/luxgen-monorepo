import { Router, Request, Response } from 'express';
import { listingReminderService } from '../services/listingReminderService';
import { certificateReminderService } from '../services/certificateReminderService';

const router = Router();

function authorizeJob(req: Request): boolean {
  const key = process.env.JOBS_API_KEY;
  if (!key) return false;
  return req.get('x-jobs-key') === key;
}

router.post('/listing-reminders', async (req: Request, res: Response) => {
  if (!authorizeJob(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const tenantId = req.body?.tenantId as string | undefined;
    const result = await listingReminderService.processReminders(tenantId);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

router.post('/certificate-reminders', async (req: Request, res: Response) => {
  if (!authorizeJob(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const tenantId = req.body?.tenantId as string | undefined;
    const result = await certificateReminderService.processReminders(tenantId);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

export default router;
