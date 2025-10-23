import { userService } from '../../services/userService';

export const userResolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      return await userService.getUserById(id);
    },
    users: async (_: any, { tenantId }: { tenantId: string }) => {
      return await userService.getUsersByTenant(tenantId);
    },
    currentUser: async (_: any, __: any, context: any) => {
      return context.user;
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: any }) => {
      return await userService.createUser(input);
    },
    updateUser: async (_: any, { id, input }: { id: string; input: any }) => {
      return await userService.updateUser(id, input);
    },
    deleteUser: async (_: any, { id }: { id: string }) => {
      return await userService.deleteUser(id);
    },
    login: async (_: any, { input }: { input: any }) => {
      return await userService.login(input);
    },
    register: async (_: any, { input }: { input: any }) => {
      return await userService.register(input);
    },
  },
};
