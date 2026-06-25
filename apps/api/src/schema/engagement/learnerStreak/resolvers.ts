import type { GraphQLContext } from '../../../context';
import { scopedTenantId } from '../../../graphql/tenantScope';
import { learnerStreakService } from '../../../services/learnerStreakService';

export const LearnerStreakResolvers = {
  Query: {
    learnerStreak: async (_: unknown, { tenantId }: { tenantId: string }, context: GraphQLContext) =>
      learnerStreakService.get(scopedTenantId(context, tenantId), context.user?._id?.toString?.() ?? ''),
  },
};
