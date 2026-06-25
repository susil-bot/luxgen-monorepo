import type { NextApiRequest, NextApiResponse } from 'next';
import { hasFeature, getRequiredPlan, type BillingFeature, type PlanTier } from '@luxgen/billing';
import { resolveTenantBillingSnapshot } from '@luxgen/db';
import { ensureDbConnection } from './ensure-db';

export interface TenantBillingSnapshot {
  plan: PlanTier;
  featureFlags: Record<string, boolean>;
}

export async function fetchTenantBilling(tenantId: string): Promise<TenantBillingSnapshot> {
  try {
    await ensureDbConnection();
    return await resolveTenantBillingSnapshot(tenantId);
  } catch {
    return { plan: 'free', featureFlags: {} };
  }
}

export async function requirePlanFeature(
  tenantId: string,
  feature: BillingFeature,
  res: NextApiResponse,
  _req?: NextApiRequest,
): Promise<PlanTier | null> {
  const billing = await fetchTenantBilling(tenantId);
  if (!hasFeature(billing.plan, feature)) {
    res.status(403).json({
      error: 'Plan upgrade required',
      code: 'PLAN_UPGRADE_REQUIRED',
      feature,
      currentPlan: billing.plan,
      requiredPlan: getRequiredPlan(feature),
      upgradeUrl: `/organization/billing?tenant=${encodeURIComponent(tenantId)}`,
    });
    return null;
  }
  return billing.plan;
}
