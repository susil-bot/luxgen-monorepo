import { Router, Request, Response } from 'express';
import { billingService } from '../services/billingService';
import { logger } from '../utils/logger';

const router = Router();

/** GET /api/billing/plan?tenant=demo — effective plan for server-side gates */
router.get('/plan', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenant as string) || req.subdomain || req.get('x-tenant') || 'demo';

    const billing = await billingService.getTenantBilling(tenantId);
    res.json(billing);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    logger.error('Billing plan fetch error:', message);
    res.status(500).json({ error: message });
  }
});

export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  try {
    const rawBody = req.body as Buffer;
    await billingService.handleStripeWebhook(rawBody, signature);
    res.json({ received: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    logger.error('Stripe webhook error:', message);
    res.status(400).json({ error: message });
  }
}

export default router;
