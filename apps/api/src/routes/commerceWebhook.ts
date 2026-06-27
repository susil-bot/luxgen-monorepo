import { Router, Request, Response } from 'express';
const router = Router();
router.post('/order-status-webhook', (req: Request, res: Response) =>
  res.json({ success: true, received: true, event: req.body?.type ?? 'unknown' }),
);
export default router;
