import { billingService } from '../../services/billingService';
import type { GraphQLContext } from '../../context';
import type { PlanTier } from '@luxgen/billing';
import { scopedTenantId } from '../../graphql/tenantScope';

function toGqlPlan(plan: string): string {
  return plan.toUpperCase();
}

function fromGqlPlan(plan: string): PlanTier {
  return plan.toLowerCase() as PlanTier;
}

export const billingResolvers = {
  Query: {
    tenantBilling: async (_: unknown, { tenantId }: { tenantId: string }, ctx: GraphQLContext) => {
      const scoped = scopedTenantId(ctx, tenantId);
      const billing = await billingService.getTenantBilling(scoped);
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
      const scoped = scopedTenantId(ctx, tenantId);
      return billingService.createCheckoutSession({
        tenantId: scoped,
        plan: fromGqlPlan(plan),
        customerEmail: ctx.user?.email,
        successUrl,
        cancelUrl,
      });
    },
    createBillingPortalSession: async (
      _: unknown,
      { tenantId, returnUrl }: { tenantId: string; returnUrl: string },
      ctx: GraphQLContext,
    ) => {
      const scoped = scopedTenantId(ctx, tenantId);
      return billingService.createBillingPortalSession(scoped, returnUrl);
    },
    setTenantPlanDev: async (
      _: unknown,
      { tenantId, plan }: { tenantId: string; plan: string },
      ctx: GraphQLContext,
    ) => {
      const scoped = scopedTenantId(ctx, tenantId);
      await billingService.setPlanDev(scoped, fromGqlPlan(plan));
      const billing = await billingService.getTenantBilling(scoped);
      return { ...billing, plan: toGqlPlan(billing.plan) };
    },
  },
};
