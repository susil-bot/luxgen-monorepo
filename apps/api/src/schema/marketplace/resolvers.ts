import { GraphQLError } from 'graphql';
import type { TemplateCategory } from '@luxgen/db';
import { marketplaceService } from '../../services/marketplaceService';
import { usageService, UsageLimitError } from '../../services/usageService';
import { requireFeature } from '../../middleware/planGate';
import type { GraphQLContext } from '../../context';
import { scopedTenantId } from '../../graphql/tenantScope';

function fromGqlCategory(category?: string): string | undefined {
  if (!category) return undefined;
  return category.toLowerCase();
}

function toGqlPlan(plan: string): string {
  return plan.toUpperCase();
}

function handleUsageError(e: unknown): never {
  if (e instanceof UsageLimitError) {
    const { code: _code, ...rest } = e.toJSON();
    throw new GraphQLError(e.message, { extensions: { code: e.code, ...rest } });
  }
  throw e;
}

export const marketplaceResolvers = {
  Query: {
    automationTemplates: async (_: unknown, { category, featured }: { category?: string; featured?: boolean }) => {
      const items = await marketplaceService.listTemplates({
        category: fromGqlCategory(category) as TemplateCategory | undefined,
        featured,
      });
      return items.map((t) => marketplaceService.toGraphQL(t));
    },
    automationTemplate: async (_: unknown, { slug }: { slug: string }) => {
      const item = await marketplaceService.getTemplateBySlug(slug);
      return item ? marketplaceService.toGraphQL(item) : null;
    },
    tenantUsage: async (_: unknown, { tenantId }: { tenantId: string }, ctx: GraphQLContext) => {
      const scoped = scopedTenantId(ctx, tenantId);
      const summary = await usageService.getUsageSummary(scoped);
      return { ...summary, plan: toGqlPlan(summary.plan) };
    },
  },
  Mutation: {
    installAutomationTemplate: async (
      _: unknown,
      { tenantId, slug, nameOverride }: { tenantId: string; slug: string; nameOverride?: string },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'automations');
      try {
        const scoped = scopedTenantId(ctx, tenantId);
        return await marketplaceService.installTemplate(scoped, slug, nameOverride);
      } catch (e) {
        handleUsageError(e);
      }
    },
  },
};
