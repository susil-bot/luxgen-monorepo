import { type PlanTier, hasFeature } from '@luxgen/billing';
import { resolveEffectivePlan } from '@luxgen/db';

export { resolveEffectivePlan };

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

export interface TenantBillingSnapshot {
  plan: PlanTier;
  featureFlags: Record<string, boolean>;
}

export async function resolveTenantBillingSnapshot(tenantId: string): Promise<TenantBillingSnapshot> {
  const plan = await resolveEffectivePlan(tenantId);
  return { plan, featureFlags: buildTenantFeatureFlags(plan) };
}
