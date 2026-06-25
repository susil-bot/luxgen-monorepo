import { GraphQLError } from 'graphql';
import { UserRole } from '@luxgen/db';
import { userService } from '../../services/userService';
import { activityEventService, actorFromContext } from '../../services/activityEventService';
import type { GraphQLContext } from '../../context';
import { scopedTenantId } from '../../graphql/tenantScope';

const STAFF_ROLES = new Set<UserRole>([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR]);

function contextUserId(context: GraphQLContext): string {
  return context.user?._id?.toString?.() ?? '';
}

function assertStaff(context: GraphQLContext): void {
  if (!context.user) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  if (!STAFF_ROLES.has(context.user.role)) {
    throw new GraphQLError('Staff access required', { extensions: { code: 'FORBIDDEN' } });
  }
}

function assertCanReadUser(context: GraphQLContext, userId: string): void {
  if (!context.user) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  if (contextUserId(context) === userId) return;
  if (STAFF_ROLES.has(context.user.role)) return;
  throw new GraphQLError('Not authorized to view this user', { extensions: { code: 'FORBIDDEN' } });
}

export const userResolvers = {
  Query: {
    user: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      assertCanReadUser(ctx, id);
      if (!ctx.tenantId) throw new Error('Tenant context required');
      return userService.getUserById(id, scopedTenantId(ctx, ctx.tenantId));
    },
    users: (_: unknown, { tenantId }: { tenantId: string }, ctx: GraphQLContext) => {
      assertStaff(ctx);
      return userService.getUsersByTenant(scopedTenantId(ctx, tenantId));
    },
    customers: (_: unknown, { tenantId, search }: { tenantId: string; search?: string }, ctx: GraphQLContext) =>
      userService.getCustomersByTenant(scopedTenantId(ctx, tenantId), search),
    currentUser: (_: unknown, __: unknown, context: GraphQLContext) => context.user ?? null,
  },
  Mutation: {
    createUser: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      const actor = actorFromContext(context.user);
      const user = await userService.createUser({
        ...input,
        invitedBy: actor?.id,
      });
      if (input.role === 'STUDENT') {
        const userId = (user as { _id?: { toString(): string }; id?: string })._id?.toString?.() ?? user.id;
        await activityEventService.recordCustomerCreated(input.tenantId, userId, user.email, actor);
      }
      return user;
    },

    updateUser: async (_: unknown, { id, input }: { id: string; input: any }, context: GraphQLContext) => {
      if (!context.tenantId) throw new Error('Tenant context required');
      const user = await userService.updateUser(id, context.tenantId, input);
      const role = user.role === 'USER' ? 'STUDENT' : user.role;
      if (role === 'STUDENT') {
        const actor = actorFromContext(context.user);
        const tenantId =
          (user.tenant as { _id?: { toString(): string }; id?: string })?._id?.toString?.() ??
          (user.tenant as { toString(): string })?.toString?.();
        if (tenantId) {
          await activityEventService.recordCustomerUpdated(tenantId, id, 'Customer profile updated', actor);
        }
      }
      return user;
    },

    deleteUser: (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.tenantId) throw new Error('Tenant context required');
      return userService.deleteUser(id, context.tenantId);
    },

    login: (_: unknown, { input }: { input: { email: string; password: string } }, ctx: GraphQLContext) =>
      userService.login({ ...input, req: ctx.req }),

    register: (_: unknown, { input }: { input: any }, ctx: GraphQLContext) =>
      userService.register(input, { selfService: true, tenantId: ctx.tenantId }),

    registerPushToken: async (_: unknown, { token }: { token: string }, context: GraphQLContext) => {
      if (!context.user || !context.tenantId) {
        throw new Error('Authentication required');
      }
      const userId = context.user._id?.toString?.() ?? '';
      if (!userId) throw new Error('Authentication required');
      return userService.registerPushToken(userId, context.tenantId, token);
    },
  },
  User: {
    id: (parent: { _id?: { toString(): string }; id?: string }) => parent._id?.toString?.() ?? parent.id ?? '',
    role: (parent: { role: string }) => (parent.role === 'USER' ? 'STUDENT' : parent.role),
    status: (parent: { status?: string }) => parent.status ?? 'ACTIVE',
    isActive: (parent: { isActive?: boolean }) => parent.isActive ?? true,
    staffNotes: (parent: { staffNotes?: string }) => parent.staffNotes ?? '',
    phone: (parent: { phone?: string }) => parent.phone ?? '',
    marketingEmail: (parent: { marketingEmail?: boolean }) => parent.marketingEmail ?? true,
    marketingSms: (parent: { marketingSms?: boolean }) => parent.marketingSms ?? false,
    marketingWhatsapp: (parent: { marketingWhatsapp?: boolean }) => parent.marketingWhatsapp ?? false,
    tenant: (parent: {
      tenant?: {
        _id?: { toString(): string };
        id?: string;
        name?: string;
        subdomain?: string;
      };
    }) => {
      const t = parent.tenant;
      if (!t || typeof t !== 'object') return t;
      return {
        id: t._id?.toString?.() ?? t.id,
        name: t.name,
        subdomain: t.subdomain,
      };
    },
  },
};
