import {
  type BillingFeature,
  type PlanTier,
  FEATURE_MIN_PLAN,
  planMeetsMinimum,
  getPlanDefinition,
  normalizePlan,
} from './plans';

export class PlanGateError extends Error {
  readonly code = 'PLAN_UPGRADE_REQUIRED';
  readonly feature: BillingFeature;
  readonly currentPlan: PlanTier;
  readonly requiredPlan: PlanTier;

  constructor(feature: BillingFeature, currentPlan: PlanTier) {
    const requiredPlan = FEATURE_MIN_PLAN[feature];
    super(`Feature "${feature}" requires ${requiredPlan} plan or higher (current: ${currentPlan}).`);
    this.name = 'PlanGateError';
    this.feature = feature;
    this.currentPlan = currentPlan;
    this.requiredPlan = requiredPlan;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      feature: this.feature,
      currentPlan: this.currentPlan,
      requiredPlan: this.requiredPlan,
    };
  }
}

export function hasFeature(plan: string | PlanTier, feature: BillingFeature): boolean {
  const normalized = typeof plan === 'string' ? normalizePlan(plan) : plan;
  const required = FEATURE_MIN_PLAN[feature];
  return planMeetsMinimum(normalized, required);
}

export function assertFeature(plan: string | PlanTier, feature: BillingFeature): void {
  const normalized = typeof plan === 'string' ? normalizePlan(plan) : plan;
  if (!hasFeature(normalized, feature)) {
    throw new PlanGateError(feature, normalized);
  }
}

export function getRequiredPlan(feature: BillingFeature): PlanTier {
  return FEATURE_MIN_PLAN[feature];
}

export function getPlanFeatures(plan: PlanTier): BillingFeature[] {
  return (Object.keys(FEATURE_MIN_PLAN) as BillingFeature[]).filter((f) => hasFeature(plan, f));
}

export function getPlanLimits(plan: PlanTier) {
  return getPlanDefinition(plan).limits;
}
