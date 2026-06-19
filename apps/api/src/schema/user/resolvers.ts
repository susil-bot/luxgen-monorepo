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

    updateUser: async (_: unknown, { id, input }: { id: string; input: any }, context: GraphQLContext) => {
      const user = await userService.updateUser(id, input);
      const role = user.role === 'USER' ? 'STUDENT' : user.role;
      if (role === 'STUDENT') {
        const actor = actorFromContext(context.user);
        const tenantId = (user.tenant as { _id?: { toString(): string }; id?: string })?._id?.toString?.()
          ?? (user.tenant as { toString(): string })?.toString?.();
        if (tenantId) {
          await activityEventService.recordCustomerUpdated(
            tenantId,
            id,
            'Customer profile updated',
            actor,
          );
        }
      }
      return user;
    },

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
