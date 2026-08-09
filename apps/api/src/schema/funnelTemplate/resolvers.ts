import { funnelTemplateService } from '../../services/funnelTemplateService';
import { requireFeature } from '../../middleware/planGate';
import { scopedTenantId } from '../../graphql/tenantScope';
import type { GraphQLContext } from '../../context';

export const funnelTemplateResolvers = {
  Query: {
    funnelTemplates: async (_: unknown, { industry }: { industry?: string }) => {
      const templates = await funnelTemplateService.listTemplates({ industry });
      return templates.map((t) => funnelTemplateService.toGraphQL(t));
    },
    funnelTemplate: async (_: unknown, { slug }: { slug: string }) => {
      const template = await funnelTemplateService.getTemplateBySlug(slug);
      return template ? funnelTemplateService.toGraphQL(template) : null;
    },
  },
  Mutation: {
    installFunnelTemplate: async (
      _: unknown,
      { tenantId, slug }: { tenantId: string; slug: string },
      ctx: GraphQLContext,
    ) => {
      // Same gate marketplace's own installTemplate resolver enforces — installing a funnel
      // template installs automation templates under the hood, so it needs the same entitlement.
      await requireFeature(ctx, 'automations');
      const scoped = scopedTenantId(ctx, tenantId);
      return funnelTemplateService.installFunnelTemplate(scoped, slug);
    },
  },
};
