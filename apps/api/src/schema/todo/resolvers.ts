import type { TaskStatus } from '@luxgen/db';
import type { GraphQLContext } from '../../context';
import { scopedTenantId as resolveScopedTenantId } from '../../graphql/tenantScope';
import { todoService, type CreateTaskInput, type UpdateTaskInput } from '../../services/todoService';

export const todoResolvers = {
  Query: {
    tasks: async (
      _: unknown,
      { tenantId, status }: { tenantId: string; status?: TaskStatus },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const items = await todoService.listByTenant(scopedId, { status });
      return items.map((t) => todoService.toGraphQL(t));
    },
    task: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const item = await todoService.getById(id, scopedId);
      return item ? todoService.toGraphQL(item) : null;
    },
  },
  Mutation: {
    createTask: async (_: unknown, { input }: { input: CreateTaskInput }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, input.tenantId);
      const created = await todoService.create({ ...input, tenantId: scopedId });
      return todoService.toGraphQL(created);
    },
    updateTask: async (
      _: unknown,
      { id, tenantId, input }: { id: string; tenantId: string; input: UpdateTaskInput },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await todoService.update(id, scopedId, input);
      return updated ? todoService.toGraphQL(updated) : null;
    },
    toggleTask: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await todoService.toggle(id, scopedId);
      return updated ? todoService.toGraphQL(updated) : null;
    },
    deleteTask: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      return todoService.delete(id, scopedId);
    },
    reorderTasks: async (
      _: unknown,
      { tenantId, orderedIds }: { tenantId: string; orderedIds: string[] },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const items = await todoService.reorder(scopedId, orderedIds);
      return items.map((t) => todoService.toGraphQL(t));
    },
  },
};
