import { type PlanTier } from './plans';
import { getPlanLimits } from './gates';

export class UsageLimitError extends Error {
  readonly code = 'USAGE_LIMIT_EXCEEDED';
  readonly metric: string;
  readonly current: number;
  readonly limit: number;
  readonly plan: PlanTier;

  constructor(metric: string, current: number, limit: number, plan: PlanTier) {
    super(`${metric} limit exceeded (${current}/${limit} on ${plan} plan). Upgrade to continue.`);
    this.name = 'UsageLimitError';
    this.metric = metric;
    this.current = current;
    this.limit = limit;
    this.plan = plan;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      metric: this.metric,
      current: this.current,
      limit: this.limit,
      plan: this.plan,
    };
  }
}

export interface UsageSnapshot {
  automationRuns: number;
  activeLearners: number;
  agentTasks: number;
}

export interface UsageWithLimits extends UsageSnapshot {
  limits: ReturnType<typeof getPlanLimits>;
  percentUsed: {
    automationRuns: number;
    activeLearners: number;
  };
}

export function percentUsed(current: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((current / limit) * 100));
}

export function assertWithinLimit(
  plan: PlanTier,
  metric: 'automationRuns' | 'activeLearners' | 'automations',
  current: number,
): void {
  const limits = getPlanLimits(plan);
  const limitMap = {
    automationRuns: limits.maxAutomationRunsPerMonth,
    activeLearners: limits.maxLearners,
    automations: limits.maxAutomations,
  };
  const limit = limitMap[metric];
  if (current >= limit) {
    throw new UsageLimitError(metric, current, limit, plan);
  }
}

export function buildUsageSummary(
  plan: PlanTier,
  usage: UsageSnapshot,
  automationCount: number,
): UsageWithLimits & { automationCount: number } {
  const limits = getPlanLimits(plan);
  return {
    ...usage,
    automationCount,
    limits,
    percentUsed: {
      automationRuns: percentUsed(usage.automationRuns, limits.maxAutomationRunsPerMonth),
      activeLearners: percentUsed(usage.activeLearners, limits.maxLearners),
    },
  };
}
