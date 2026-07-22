import { Router, Request, Response } from 'express';
import { cartSessionService } from '../services/cartSessionService';
const router = Router();
router.get('/cart-session/:sessionId', (req: Request, res: Response) =>
  res.json({ success: true, data: cartSessionService.get(req.params.sessionId) }),
);
router.post('/cart-session/:sessionId', (req: Request, res: Response) =>
  res.json({ success: true, data: cartSessionService.upsert(req.params.sessionId, req.body.items ?? []) }),
);
export default router;
