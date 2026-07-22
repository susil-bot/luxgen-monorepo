export type PlanTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export type BillingFeature =
  | 'automations'
  | 'analytics'
  | 'project'
  | 'webhooks'
  | 'customDomain'
  | 'agentStudio'
  | 'mobileApp'
  | 'apiAccess';

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  priceMonthly: number;
  description: string;
  features: string[];
  limits: {
    maxLearners: number;
    maxAutomations: number;
    maxAutomationRunsPerMonth: number;
  };
}

export const PLAN_ORDER: PlanTier[] = ['free', 'starter', 'pro', 'business', 'enterprise'];

export const PLAN_DEFINITIONS: Record<PlanTier, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    description: 'Get started with core LMS features',
    features: ['Courses & groups', 'Up to 100 learners', 'Basic dashboard'],
    limits: { maxLearners: 100, maxAutomations: 0, maxAutomationRunsPerMonth: 0 },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 49,
    description: 'For solo creators launching their first program',
    features: ['Everything in Free', 'Up to 250 learners', 'API access', 'Email support'],
    limits: { maxLearners: 250, maxAutomations: 0, maxAutomationRunsPerMonth: 0 },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 149,
    description: 'Automations and analytics for growing teams',
    features: [
      'Everything in Starter',
      'Automations',
      'Analytics',
      'Project boards',
      'Mobile learner app',
      'Up to 500 learners',
    ],
    limits: { maxLearners: 500, maxAutomations: 50, maxAutomationRunsPerMonth: 10_000 },
  },
  business: {
    id: 'business',
    name: 'Business',
    priceMonthly: 349,
    description: 'Webhooks, custom domain, and priority support',
    features: ['Everything in Pro', 'Webhooks', 'Custom domain', 'Agent Studio preview', 'Up to 2,000 learners'],
    limits: { maxLearners: 2000, maxAutomations: 200, maxAutomationRunsPerMonth: 50_000 },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 0,
    description: 'Agent Studio, git pipeline, SLA — contact sales',
    features: [
      'Everything in Business',
      'Agent Studio',
      'Git worktree pipeline',
      'Unlimited learners',
      'Dedicated support',
    ],
    limits: { maxLearners: 999_999, maxAutomations: 999_999, maxAutomationRunsPerMonth: 999_999 },
  },
};

/** Minimum plan required per feature (from BUSINESS_STRATEGY_2026.md). */
export const FEATURE_MIN_PLAN: Record<BillingFeature, PlanTier> = {
  apiAccess: 'starter',
  mobileApp: 'pro',
  automations: 'pro',
  analytics: 'pro',
  project: 'pro',
  webhooks: 'business',
  customDomain: 'business',
  agentStudio: 'enterprise',
};

export function normalizePlan(plan: string | undefined | null): PlanTier {
  const p = (plan || 'free').toLowerCase();
  if (p in PLAN_DEFINITIONS) return p as PlanTier;
  return 'free';
}

export function planRank(plan: PlanTier): number {
  return PLAN_ORDER.indexOf(plan);
}

export function planMeetsMinimum(current: PlanTier, required: PlanTier): boolean {
  return planRank(current) >= planRank(required);
}

export function getPlanDefinition(plan: PlanTier): PlanDefinition {
  return PLAN_DEFINITIONS[plan];
}

export function listPublicPlans(): PlanDefinition[] {
  return PLAN_ORDER.filter((id) => id !== 'free').map((id) => PLAN_DEFINITIONS[id]);
}
