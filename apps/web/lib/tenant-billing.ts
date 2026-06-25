import { type PlanTier, normalizePlan, hasFeature } from '@luxgen/billing';
import { Tenant, TenantSubscription } from '@luxgen/db';

export function buildTenantFeatureFlags(plan: PlanTier): Record<string, boolean> {
  return {
    automations: hasFeature(plan, 'automations'),
    analytics: hasFeature(plan, 'analytics'),
    project: hasFeature(plan, 'project'),
    webhooks: hasFeature(plan, 'webhooks'),
    customDomain: hasFeature(plan, 'customDomain'),
    agentStudio: hasFeature(plan, 'agentStudio'),
    mobileApp: hasFeature(plan, 'mobileApp'),
    apiAccess: hasFeature(plan, 'apiAccess'),
  };
}

/** Resolve effective plan from subscription row or tenant metadata (id or subdomain). */
export async function resolveEffectivePlan(tenantId: string): Promise<PlanTier> {
  const sub = await TenantSubscription.findOne({ tenantId });
  if (sub && ['active', 'trialing'].includes(sub.status)) {
    return normalizePlan(sub.plan);
  }

  const tenant = (await Tenant.findById(tenantId).lean()) ?? (await Tenant.findOne({ subdomain: tenantId }).lean());
  if (tenant?.metadata?.plan) {
    return normalizePlan(tenant.metadata.plan);
  }

  return 'free';
}

export interface TenantBillingSnapshot {
  plan: PlanTier;
  featureFlags: Record<string, boolean>;
}

export async function resolveTenantBillingSnapshot(tenantId: string): Promise<TenantBillingSnapshot> {
  const plan = await resolveEffectivePlan(tenantId);
  return { plan, featureFlags: buildTenantFeatureFlags(plan) };
}
