import type { GraphQLContext } from '../../context';
import { GraphQLError } from 'graphql';
import { scopedTenantId as resolveScopedTenantId } from '../../graphql/tenantScope';
import { taskReminderService } from '../../services/taskReminderService';

function requireUserId(ctx: GraphQLContext): string {
  const user = ctx.user as { _id?: { toString(): string }; id?: string } | null;
  const id = user?._id?.toString?.() ?? user?.id ?? null;
  if (!id) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return id;
}

function tenantFromCtx(ctx: GraphQLContext, tenantId?: string | null): string {
  if (tenantId) return resolveScopedTenantId(ctx, tenantId);
  if (ctx.tenantId) return ctx.tenantId;
  throw new GraphQLError('tenantId is required', { extensions: { code: 'BAD_USER_INPUT' } });
}

export const notificationFeedTypeDefs = `
  """NavBar / NotificationBell feed shape (apps/web GET_NOTIFICATIONS)."""
  type NotificationFeedItem {
    id: ID!
    type: String!
    title: String!
    body: String
    href: String
    readAt: Date
    createdAt: Date!
  }

  type NotificationFeed {
    unreadCount: Int!
    items: [NotificationFeedItem!]!
  }

  extend type Query {
    """In-app notification feed for the authenticated user (tenant from header or arg)."""
    notifications(limit: Int, tenantId: String): NotificationFeed!
  }

  extend type Mutation {
    """Mark one notification read. tenantId optional when x-tenant-id is set."""
    markNotificationRead(id: ID!, tenantId: String): NotificationFeedItem
    markAllNotificationsRead(tenantId: String): Boolean!
  }
`;

export const notificationFeedResolvers = {
  Query: {
    notifications: async (
      _: unknown,
      { limit, tenantId }: { limit?: number; tenantId?: string },
      ctx: GraphQLContext,
    ) => {
      const scoped = tenantFromCtx(ctx, tenantId);
      const userId = requireUserId(ctx);
      return taskReminderService.getNotificationFeed(scoped, userId, limit ?? 15);
    },
  },
  Mutation: {
    markNotificationRead: async (
      _: unknown,
      { id, tenantId }: { id: string; tenantId?: string },
      ctx: GraphQLContext,
    ) => {
      const scoped = tenantFromCtx(ctx, tenantId);
      const userId = requireUserId(ctx);
      const updated = await taskReminderService.markNotificationRead(id, scoped, userId);
      return updated ? taskReminderService.notificationFeedItem(updated) : null;
    },
    markAllNotificationsRead: async (_: unknown, { tenantId }: { tenantId?: string }, ctx: GraphQLContext) => {
      const scoped = tenantFromCtx(ctx, tenantId);
      const userId = requireUserId(ctx);
      return taskReminderService.markAllNotificationsRead(scoped, userId);
    },
  },
};
