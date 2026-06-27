import { CustomRole } from '@luxgen/db';
const defaults = {
  canManageUsers: false,
  canManageCourses: false,
  canManageGroups: false,
  canViewReports: false,
  canManageSettings: false,
};
export const customRoleResolvers = {
  Query: {
    customRoles: async (_: unknown, { tenantId }: { tenantId: string }) =>
      CustomRole.find({ tenant: tenantId }).sort({ name: 1 }),
    customRole: async (_: unknown, { id }: { id: string }) => CustomRole.findById(id),
  },
  Mutation: {
    createCustomRole: async (_: unknown, { input }: { input: Record<string, unknown> }) =>
      CustomRole.create({
        tenant: input.tenantId,
        name: input.name,
        description: input.description,
        permissions: { ...defaults, ...(input.permissions as object) },
      }),
    updateCustomRole: async (_: unknown, { input }: { input: Record<string, unknown> }) => {
      const { id, ...u } = input;
      const role = await CustomRole.findByIdAndUpdate(
        id,
        {
          ...(u.name ? { name: u.name } : {}),
          ...(u.description !== undefined ? { description: u.description } : {}),
          ...(u.permissions ? { permissions: u.permissions } : {}),
        },
        { new: true },
      );
      if (!role) throw new Error('Custom role not found');
      return role;
    },
    deleteCustomRole: async (_: unknown, { id }: { id: string }) => Boolean(await CustomRole.findByIdAndDelete(id)),
  },
  CustomRole: {
    id: (p: { _id: { toString(): string } }) => p._id.toString(),
    permissions: (p: { permissions?: typeof defaults }) => p.permissions ?? defaults,
  },
};
