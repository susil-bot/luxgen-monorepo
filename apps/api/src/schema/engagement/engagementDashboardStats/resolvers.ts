import type { GraphQLContext } from '../../../context';
import { scopedTenantId } from '../../../graphql/tenantScope';
import { engagementDashboardStatsService } from '../../../services/engagementDashboardStatsService';

export const EngagementDashboardStatsResolvers = {
  Query: {
    engagementDashboardStats: async (_: unknown, { tenantId }: { tenantId: string }, context: GraphQLContext) =>
      engagementDashboardStatsService.forStudent(
        scopedTenantId(context, tenantId),
        context.user?._id?.toString?.() ?? '',
      ),
  },
};
