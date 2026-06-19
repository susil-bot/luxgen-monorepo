import { GraphQLError } from 'graphql';
import { marketplaceService } from '../../services/marketplaceService';
import { usageService, UsageLimitError } from '../../services/usageService';
import { requireFeature } from '../../middleware/planGate';
import type { GraphQLContext } from '../../context';

function fromGqlCategory(category?: string): string | undefined {
  if (!category) return undefined;
  return category.toLowerCase();
}

function toGqlPlan(plan: string): string {
  return plan.toUpperCase();
}

function handleUsageError(e: unknown): never {
  if (e instanceof UsageLimitError) {
    throw new GraphQLError(e.message, { extensions: { code: e.code, ...e.toJSON() } });
  }
  throw e;
}

export const marketplaceResolvers = {
  Query: {
    automationTemplates: async (_: unknown, { category, featured }: { category?: string; featured?: boolean }) => {
      const items = await marketplaceService.listTemplates({
        category: fromGqlCategory(category) as Parameters<typeof marketplaceService.listTemplates>[0]['category'],
        featured,
      });
      return items.map((t) => marketplaceService.toGraphQL(t));
    },
    automationTemplate: async (_: unknown, { slug }: { slug: string }) => {
      const item = await marketplaceService.getTemplateBySlug(slug);
      return item ? marketplaceService.toGraphQL(item) : null;
    },
    tenantUsage: async (_: unknown, { tenantId }: { tenantId: string }) => {
      const summary = await usageService.getUsageSummary(tenantId);
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
        return await marketplaceService.installTemplate(tenantId, slug, nameOverride);
      } catch (e) {
        handleUsageError(e);
      }
    },
  },
};
