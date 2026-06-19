import { Tenant, TenantSubscription, TenantUsageMonthly, Automation, User, currentUsagePeriod } from '@luxgen/db';
import { type PlanTier, getPlanLimits, assertWithinLimit, buildUsageSummary, UsageLimitError } from '@luxgen/billing';
import { billingService } from './billingService';
import { logger } from '../utils/logger';

export class UsageService {
  async getTenantPlan(tenantId: string): Promise<PlanTier> {
    return billingService.getEffectivePlan(tenantId);
  }

  async getMonthlyUsage(tenantId: string, period = currentUsagePeriod()) {
    let record = await TenantUsageMonthly.findOne({ tenantId, period });
    if (!record) {
      record = await TenantUsageMonthly.create({
        tenantId,
        period,
        automationRuns: 0,
        activeLearners: 0,
        agentTasks: 0,
      });
    }
    return record;
  }

  async countActiveLearners(tenantId: string): Promise<number> {
    const tenant = await Tenant.findOne({ subdomain: tenantId });
    if (!tenant) return 0;
    return User.countDocuments({ tenant: tenant._id, isActive: true, role: 'USER' });
  }

  async syncActiveLearners(tenantId: string): Promise<number> {
    const count = await this.countActiveLearners(tenantId);
    const period = currentUsagePeriod();
    await TenantUsageMonthly.findOneAndUpdate(
      { tenantId, period },
      { $set: { activeLearners: count } },
      { upsert: true },
    );
    return count;
  }

  async incrementAutomationRuns(tenantId: string, amount = 1): Promise<void> {
    const period = currentUsagePeriod();
    await TenantUsageMonthly.findOneAndUpdate(
      { tenantId, period },
      { $inc: { automationRuns: amount } },
      { upsert: true },
    );
    await this.reportAutomationOverageToStripe(tenantId).catch((err) => {
      logger.debug('Stripe usage report skipped:', err instanceof Error ? err.message : err);
    });
  }

  async incrementAgentTasks(tenantId: string, amount = 1): Promise<void> {
    const period = currentUsagePeriod();
    await TenantUsageMonthly.findOneAndUpdate({ tenantId, period }, { $inc: { agentTasks: amount } }, { upsert: true });
  }

  async assertAutomationRunAllowed(tenantId: string): Promise<void> {
    const plan = await this.getTenantPlan(tenantId);
    const usage = await this.getMonthlyUsage(tenantId);
    assertWithinLimit(plan, 'automationRuns', usage.automationRuns);
  }

  async assertAutomationCreateAllowed(tenantId: string): Promise<void> {
    const plan = await this.getTenantPlan(tenantId);
    const count = await Automation.countDocuments({ tenantId });
    assertWithinLimit(plan, 'automations', count);
  }

  async getUsageSummary(tenantId: string) {
    const plan = await this.getTenantPlan(tenantId);
    const period = currentUsagePeriod();
    const usage = await this.getMonthlyUsage(tenantId);
    const activeLearners = await this.syncActiveLearners(tenantId);
    const automationCount = await Automation.countDocuments({ tenantId });
    const limits = getPlanLimits(plan);

    return {
      tenantId,
      period,
      plan,
      ...buildUsageSummary(
        plan,
        {
          automationRuns: usage.automationRuns,
          activeLearners,
          agentTasks: usage.agentTasks,
        },
        automationCount,
      ),
      withinLimits: {
        automationRuns: usage.automationRuns < limits.maxAutomationRunsPerMonth,
        activeLearners: activeLearners <= limits.maxLearners,
        automations: automationCount < limits.maxAutomations,
      },
    };
  }

  /** Report overage runs to Stripe metered billing when configured. */
  async reportAutomationOverageToStripe(tenantId: string): Promise<void> {
    const meterItemId = process.env.STRIPE_METER_AUTOMATION_RUNS_ITEM;
    if (!meterItemId || !process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) return;

    const plan = await this.getTenantPlan(tenantId);
    const limits = getPlanLimits(plan);
    const usage = await this.getMonthlyUsage(tenantId);
    const overage = usage.automationRuns - limits.maxAutomationRunsPerMonth;
    if (overage <= 0) return;

    const sub = await TenantSubscription.findOne({ tenantId });
    if (!sub?.stripeSubscriptionId) return;

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    await stripe.subscriptionItems.createUsageRecord(meterItemId, {
      quantity: 1,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    });

    await TenantUsageMonthly.updateOne(
      { tenantId, period: currentUsagePeriod() },
      { $set: { overageReportedAt: new Date() } },
    );
  }
}

export const usageService = new UsageService();
export { UsageLimitError };
