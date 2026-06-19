import { userService } from '../../services/userService';
import { activityEventService, actorFromContext } from '../../services/activityEventService';
import type { GraphQLContext } from '../../context';

export const userResolvers = {
  Query: {
    user: (_: unknown, { id }: { id: string }) => userService.getUserById(id),
    users: (_: unknown, { tenantId }: { tenantId: string }) => userService.getUsersByTenant(tenantId),
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
        await activityEventService.recordCustomerCreated(
          input.tenantId,
          userId,
          user.email,
          actor,
        );
      }
      return user;
    },

    updateUser: (_: unknown, { id, input }: { id: string; input: any }) => userService.updateUser(id, input),

    deleteUser: (_: unknown, { id }: { id: string }) => userService.deleteUser(id),

    login: (_: unknown, { input }: { input: { email: string; password: string } }, ctx: GraphQLContext) =>
      userService.login({ ...input, req: ctx.req }),

    register: (_: unknown, { input }: { input: any }) => userService.register(input),
  },
  User: {
    id: (parent: { _id?: { toString(): string }; id?: string }) =>
      parent._id?.toString?.() ?? parent.id ?? '',
    role: (parent: { role: string }) => (parent.role === 'USER' ? 'STUDENT' : parent.role),
    staffNotes: (parent: { staffNotes?: string }) => parent.staffNotes ?? '',
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
