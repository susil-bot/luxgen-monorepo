import { Router, Request, Response } from 'express';
import { certificateReminderService } from '../services/certificateReminderService';
import { taskReminderService } from '../services/taskReminderService';
import { taskRecurrenceService } from '../services/taskRecurrenceService';
import { taskAutomationService } from '../services/taskAutomationService';

const router = Router();

function authorizeJob(req: Request): boolean {
  const key = process.env.JOBS_API_KEY;
  if (!key) return false;
  return req.get('x-jobs-key') === key;
}

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

/** Due task reminders → in-app AppNotification. Cron: POST with x-jobs-key. */
router.post('/task-reminders', async (req: Request, res: Response) => {
  if (!authorizeJob(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const tenantId = req.body?.tenantId as string | undefined;
    const result = await taskReminderService.processDueReminders(tenantId);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

/** Due recurrence rules → create occurrence tasks. Cron: POST with x-jobs-key. */
router.post('/task-recurrence', async (req: Request, res: Response) => {
  if (!authorizeJob(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const tenantId = req.body?.tenantId as string | undefined;
    const result = await taskRecurrenceService.processDueRecurrences(tenantId);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

/** Due soon / overdue → task automation triggers. Cron: POST with x-jobs-key. */
router.post('/task-automation', async (req: Request, res: Response) => {
  if (!authorizeJob(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const tenantId = req.body?.tenantId as string | undefined;
    const result = await taskAutomationService.processScheduledTriggers(tenantId);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

export default router;
