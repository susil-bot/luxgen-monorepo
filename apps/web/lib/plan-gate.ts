import type { NextApiResponse } from 'next';
import { hasFeature, getRequiredPlan, normalizePlan, type BillingFeature, type PlanTier } from '@luxgen/billing';

export interface TenantBillingSnapshot {
  plan: PlanTier;
  featureFlags: Record<string, boolean>;
}

import { getApiUrl } from '@luxgen/config';

export async function fetchTenantBilling(tenantId: string): Promise<TenantBillingSnapshot> {
  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/api/billing/plan?tenant=${encodeURIComponent(tenantId)}`, {
      headers: { 'x-tenant': tenantId },
    });
    if (!res.ok) {
      return { plan: 'free', featureFlags: {} };
    }
    const data = await res.json();
    return {
      plan: normalizePlan(data.plan),
      featureFlags: data.featureFlags ?? {},
    };
  } catch {
    return { plan: 'free', featureFlags: {} };
  }
}

export async function requirePlanFeature(
  tenantId: string,
  feature: BillingFeature,
  res: NextApiResponse,
): Promise<PlanTier | null> {
  const billing = await fetchTenantBilling(tenantId);
  if (!hasFeature(billing.plan, feature)) {
    res.status(403).json({
      error: 'Plan upgrade required',
      code: 'PLAN_UPGRADE_REQUIRED',
      feature,
      currentPlan: billing.plan,
      requiredPlan: getRequiredPlan(feature),
      upgradeUrl: `/billing?tenant=${encodeURIComponent(tenantId)}`,
    });
    return null;
  }
  return billing.plan;
}
