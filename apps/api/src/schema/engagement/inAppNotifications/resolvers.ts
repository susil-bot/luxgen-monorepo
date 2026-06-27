import type { GraphQLContext } from '../../../context';
import { inAppNotificationsService } from '../../../services/inAppNotificationsService';
export const InAppNotificationsResolvers = {
  Query: {
    inAppNotifications: async (_: unknown, __: unknown, ctx: GraphQLContext) =>
      inAppNotificationsService.list(ctx.user?._id?.toString?.() ?? ''),
  },
  Mutation: {
    markNotificationRead: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) =>
      inAppNotificationsService.markRead(ctx.user?._id?.toString?.() ?? '', id),
  },
};
