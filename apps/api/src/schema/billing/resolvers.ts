import { billingService } from '../../services/billingService';
import type { GraphQLContext } from '../../context';
import type { PlanTier } from '@luxgen/billing';

function toGqlPlan(plan: string): string {
  return plan.toUpperCase();
}

function fromGqlPlan(plan: string): PlanTier {
  return plan.toLowerCase() as PlanTier;
}

export const billingResolvers = {
  Query: {
    tenantBilling: async (_: unknown, { tenantId }: { tenantId: string }) => {
      const billing = await billingService.getTenantBilling(tenantId);
      return {
        ...billing,
        plan: toGqlPlan(billing.plan),
        features: billing.features,
      };
    },
    pricingPlans: () => {
      return billingService.getPricingPlans().map((p) => ({
        ...p,
        id: toGqlPlan(p.id),
      }));
    },
  },
  Mutation: {
    createCheckoutSession: async (
      _: unknown,
      {
        tenantId,
        plan,
        successUrl,
        cancelUrl,
      }: { tenantId: string; plan: string; successUrl: string; cancelUrl: string },
      ctx: GraphQLContext,
    ) => {
      return billingService.createCheckoutSession({
        tenantId,
        plan: fromGqlPlan(plan),
        customerEmail: ctx.user?.email,
        successUrl,
        cancelUrl,
      });
    },
    createBillingPortalSession: async (
      _: unknown,
      { tenantId, returnUrl }: { tenantId: string; returnUrl: string },
    ) => {
      return billingService.createBillingPortalSession(tenantId, returnUrl);
    },
    setTenantPlanDev: async (_: unknown, { tenantId, plan }: { tenantId: string; plan: string }) => {
      await billingService.setPlanDev(tenantId, fromGqlPlan(plan));
      const billing = await billingService.getTenantBilling(tenantId);
      return { ...billing, plan: toGqlPlan(billing.plan) };
    },
  },
};
