import { Router, Request, Response } from 'express';
import { Tenant } from '@luxgen/db';
import { getTenantContext } from '../middleware/tenantRouting';
const router = Router();
router.get('/saml', async (req: Request, res: Response) => {
  const ctx = getTenantContext(req); if (!ctx) return res.status(404).json({ success: false, message: 'No tenant context' });
  const tenant = await Tenant.findById(ctx.tenantId);
  const saml = (tenant?.settings as { sso?: { saml?: Record<string, unknown> } })?.sso?.saml ?? {};
  res.json({ success: true, data: { idpMetadataUrl: saml.idpMetadataUrl ?? '', entityId: saml.entityId ?? '', enabled: Boolean(saml.enabled) } });
});
router.patch('/saml', async (req: Request, res: Response) => {
  const ctx = getTenantContext(req); if (!ctx) return res.status(404).json({ success: false, message: 'No tenant context' });
  const { idpMetadataUrl, entityId, enabled } = req.body;
  await Tenant.findByIdAndUpdate(ctx.tenantId, { $set: { 'settings.sso.saml.idpMetadataUrl': idpMetadataUrl ?? '', 'settings.sso.saml.entityId': entityId ?? '', 'settings.sso.saml.enabled': enabled ?? false } });
  res.json({ success: true, data: { idpMetadataUrl, entityId, enabled } });
});
router.get('/saml/metadata', (_req: Request, res: Response) => res.type('application/xml').send('<?xml version="1.0"?><EntityDescriptor entityID="luxgen-sp-stub"/>'));
export default router;
