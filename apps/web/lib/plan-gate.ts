import type { NextApiRequest, NextApiResponse } from 'next';
import { hasFeature, getRequiredPlan, normalizePlan, type BillingFeature, type PlanTier } from '@luxgen/billing';
import { extractBearerToken } from '@luxgen/agent';

export interface TenantBillingSnapshot {
  plan: PlanTier;
  featureFlags: Record<string, boolean>;
}

import { getApiUrl } from '@luxgen/config';

export async function fetchTenantBilling(tenantId: string, authToken?: string): Promise<TenantBillingSnapshot> {
  const apiUrl = getApiUrl();
  const headers: Record<string, string> = { 'x-tenant': tenantId };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  try {
    const res = await fetch(`${apiUrl}/api/billing/plan?tenant=${encodeURIComponent(tenantId)}`, {
      headers,
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
  req?: NextApiRequest,
): Promise<PlanTier | null> {
  const authToken = req ? extractBearerToken(req) : undefined;
  const billing = await fetchTenantBilling(tenantId, authToken);
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
