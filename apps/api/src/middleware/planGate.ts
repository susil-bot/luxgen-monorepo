import { assertFeature, PlanGateError, normalizePlan } from '@luxgen/billing';
import { billingService } from '../services/billingService';
import type { GraphQLContext } from '../context';
import { GraphQLError } from 'graphql';

export async function resolveTenantPlan(ctx: GraphQLContext): Promise<string> {
  const tenantId = ctx.tenant || 'demo';
  return billingService.getEffectivePlan(tenantId);
}

export async function requireFeature(ctx: GraphQLContext, feature: Parameters<typeof assertFeature>[1]): Promise<void> {
  const plan = await resolveTenantPlan(ctx);
  try {
    assertFeature(plan, feature);
  } catch (e) {
    if (e instanceof PlanGateError) {
      const { code: _code, ...rest } = e.toJSON();
      throw new GraphQLError(e.message, {
        extensions: { code: e.code, ...rest },
      });
    }
    throw e;
  }
}

export function planGateMiddleware(feature: Parameters<typeof assertFeature>[1]) {
  return async function checkPlan(plan: string | undefined) {
    assertFeature(normalizePlan(plan), feature);
  };
}
