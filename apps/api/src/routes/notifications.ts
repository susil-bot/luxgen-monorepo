import { Router, Request, Response } from 'express';
import { LISTING_EMAIL_TEMPLATES, type ListingEmailTemplate } from '../notifications/listing-templates';
import { getTenantContext } from '../middleware/tenantRouting';
import { UserRole } from '@luxgen/auth';
import { requireRole } from '../middleware/roleManagement';

const router = Router();
const templateOverrides = new Map();
function overrideKey(tenantId, templateId) {
  return `${tenantId}:${templateId}`;
}

const TEMPLATE_META: Record<
  ListingEmailTemplate,
  { label: string; category: 'account' | 'order' | 'shipping' | 'refund' | 'cart'; status: 'live' | 'partial' }
> = {
  additional_information_requested: {
    label: 'Additional information requested',
    category: 'order',
    status: 'live',
  },
  application_approved: { label: 'Application approved', category: 'order', status: 'live' },
  application_rejected: { label: 'Application rejected', category: 'order', status: 'live' },
  payment_confirmation: { label: 'Payment confirmation', category: 'order', status: 'live' },
  subscription_expiration: { label: 'Subscription expiration', category: 'refund', status: 'live' },
  reminder_draft: { label: 'Draft application reminder', category: 'cart', status: 'live' },
  reminder_need_more_information: {
    label: 'Information needed reminder',
    category: 'shipping',
    status: 'live',
  },
  reminder_awaiting_payment: { label: 'Awaiting payment reminder', category: 'order', status: 'live' },
  reminder_expired_renewal: { label: 'Expired renewal reminder', category: 'account', status: 'live' },
};

const sampleContext = {
  applicantName: 'Alex Thompson',
  businessName: 'Demo Workspace',
  listingId: 'listing-demo-001',
  tenantId: 'demo',
  reviewerNotes: 'Please upload a clearer logo.',
  paymentUrl: 'https://demo.localhost:3000/billing',
  renewalUrl: 'https://demo.localhost:3000/billing',
  applicationUrl: 'https://demo.localhost:3000/listings/apply',
};

/**
 * List email notification templates for the current tenant
 */
router.get('/templates', requireRole(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const tenantContext = getTenantContext(req);

    if (!tenantContext) {
      return res.status(404).json({
        success: false,
        message: 'No tenant context found',
      });
    }

    const ctx = {
      ...sampleContext,
      businessName: tenantContext.tenant.name,
      tenantId: tenantContext.tenantId,
    };

    const templates = Object.values(LISTING_EMAIL_TEMPLATES).map((def) => {
      const meta = TEMPLATE_META[def.id];
      const override = templateOverrides.get(overrideKey(tenantContext.tenantId, def.id));
      const subject = override?.subject ?? def.subject(ctx);
      const body = override?.body ?? def.body(ctx);
      return {
        id: def.id,
        label: meta.label,
        category: meta.category,
        status: meta.status,
        subject,
        bodyPreview: body.split('\n').slice(0, 4).join('\n'),
      };
    });

    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('List notification templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

router.patch('/templates/:id', requireRole(UserRole.ADMIN), async (req, res) => {
  const tenantContext = getTenantContext(req);
  if (!tenantContext) return res.status(404).json({ success: false, message: 'No tenant context' });
  const { id } = req.params;
  const { subject, body } = req.body;
  templateOverrides.set(overrideKey(tenantContext.tenantId, id), { subject, body });
  res.json({ success: true, data: { id, subject, body } });
});
export default router;
