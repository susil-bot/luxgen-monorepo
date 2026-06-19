import { userService } from '../../services/userService';

export const userResolvers = {
  Query: {
    user: (_: unknown, { id }: { id: string }) => userService.getUserById(id),
    users: (_: unknown, { tenantId }: { tenantId: string }) => userService.getUsersByTenant(tenantId),
    currentUser: (_: unknown, __: unknown, context: { user?: any }) => context.user ?? null,
  },
  Mutation: {
    createUser: (_: unknown, { input }: { input: any }) => userService.createUser(input),

    updateUser: (_: unknown, { id, input }: { id: string; input: any }) => userService.updateUser(id, input),

    deleteUser: (_: unknown, { id }: { id: string }) => userService.deleteUser(id),

    login: (_: unknown, { input }: { input: { email: string; password: string } }) => userService.login(input),

    register: (_: unknown, { input }: { input: any }) => userService.register(input),
  },
};
