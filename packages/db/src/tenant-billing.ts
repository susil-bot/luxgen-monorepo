import { type PlanTier, normalizePlan } from '@luxgen/billing';
import { TenantSubscription } from './subscription';

/** Resolve effective plan from TenantSubscription (authoritative). */
export async function resolveEffectivePlan(tenantId: string): Promise<PlanTier> {
  const sub = await TenantSubscription.findOne({ tenantId });
  if (sub && ['active', 'trialing'].includes(sub.status)) {
    return normalizePlan(sub.plan);
  }
  return 'free';
}
