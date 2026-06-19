import { userService } from '../../services/userService';
import type { GraphQLContext } from '../../context';

export const userResolvers = {
  Query: {
    user: (_: unknown, { id }: { id: string }) => userService.getUserById(id),
    users: (_: unknown, { tenantId }: { tenantId: string }) => userService.getUsersByTenant(tenantId),
    currentUser: (_: unknown, __: unknown, context: GraphQLContext) => context.user ?? null,
  },
  Mutation: {
    createUser: (_: unknown, { input }: { input: any }) => userService.createUser(input),

    updateUser: (_: unknown, { id, input }: { id: string; input: any }) => userService.updateUser(id, input),

    deleteUser: (_: unknown, { id }: { id: string }) => userService.deleteUser(id),

    login: (_: unknown, { input }: { input: { email: string; password: string } }, ctx: GraphQLContext) =>
      userService.login({ ...input, req: ctx.req }),

    register: (_: unknown, { input }: { input: any }) => userService.register(input),
  },
};
