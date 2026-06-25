import { Router, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { Tenant } from '@luxgen/db';
import { getTenantContext } from '../middleware/tenantRouting';
const router = Router();
router.get('/scim', async (req: Request, res: Response) => {
  const ctx = getTenantContext(req); if (!ctx) return res.status(404).json({ success: false, message: 'No tenant context' });
  const tenant = await Tenant.findById(ctx.tenantId);
  const scim = (tenant?.settings as { sso?: { scim?: { tokenHint?: string; enabled?: boolean } } })?.sso?.scim ?? {};
  res.json({ success: true, data: { enabled: Boolean(scim.enabled), tokenHint: scim.tokenHint ?? null } });
});
router.post('/scim/token', async (req: Request, res: Response) => {
  const ctx = getTenantContext(req); if (!ctx) return res.status(404).json({ success: false, message: 'No tenant context' });
  const token = `scim_${randomBytes(24).toString('hex')}`; const tokenHint = `${token.slice(0, 8)}…`;
  await Tenant.findByIdAndUpdate(ctx.tenantId, { $set: { 'settings.sso.scim.token': token, 'settings.sso.scim.tokenHint': tokenHint, 'settings.sso.scim.enabled': true } });
  res.json({ success: true, data: { token, tokenHint } });
});
export default router;
