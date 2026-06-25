import type { GraphQLContext } from '../../context';
import { scopedTenantId } from '../../graphql/tenantScope';
import { analyticsService } from '../../services/analyticsService';
function staff(ctx: GraphQLContext) {
  if (!ctx.user) throw new Error('Authentication required');
  const r = ctx.user.role;
  if (r !== 'ADMIN' && r !== 'SUPER_ADMIN' && r !== 'INSTRUCTOR') throw new Error('Staff access required');
}
export const analyticsResolvers = {
  Query: {
    courseAnalytics: async (
      _: unknown,
      { tenantId, days }: { tenantId: string; days?: number },
      ctx: GraphQLContext,
    ) => {
      staff(ctx);
      return analyticsService.getCourseAnalytics(scopedTenantId(ctx, tenantId), days ?? 90);
    },
    groupAnalytics: async (_: unknown, { tenantId }: { tenantId: string }, ctx: GraphQLContext) => {
      staff(ctx);
      return analyticsService.getGroupAnalytics(scopedTenantId(ctx, tenantId));
    },
  },
};
