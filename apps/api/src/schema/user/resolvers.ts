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
      const user = await userService.createUser(input);
      if (input.role === 'STUDENT') {
        const actor = actorFromContext(context.user);
        await activityEventService.recordCustomerCreated(
          input.tenantId,
          user.id,
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
};
