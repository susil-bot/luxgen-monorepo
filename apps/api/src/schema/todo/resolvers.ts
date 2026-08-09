import type { TaskStatus } from '@luxgen/db';
import type { GraphQLContext } from '../../context';
import { scopedTenantId as resolveScopedTenantId } from '../../graphql/tenantScope';
import { todoService, type CreateTaskInput, type UpdateTaskInput } from '../../services/todoService';
import { todoListService, type CreateTodoListInput, type UpdateTodoListInput } from '../../services/todoListService';

export const todoResolvers = {
  TodoList: {
    taskCount: async (parent: { id: string; tenantId: string }) => todoListService.taskCount(parent.id, parent.tenantId),
  },
  Query: {
    todoLists: async (_: unknown, { tenantId }: { tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const lists = await todoListService.listByTenant(scopedId);
      return lists.map((l) => todoListService.toGraphQL(l));
    },
    todoList: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const list = await todoListService.getById(id, scopedId);
      return list ? todoListService.toGraphQL(list) : null;
    },
    tasks: async (
      _: unknown,
      { tenantId, todoListId, status }: { tenantId: string; todoListId?: string; status?: TaskStatus },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const items = await todoService.listByTenant(scopedId, { todoListId, status });
      return items.map((t) => todoService.toGraphQL(t));
    },
    task: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const item = await todoService.getById(id, scopedId);
      return item ? todoService.toGraphQL(item) : null;
    },
  },
  Mutation: {
    createTodoList: async (_: unknown, { input }: { input: CreateTodoListInput }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, input.tenantId);
      const created = await todoListService.create({ ...input, tenantId: scopedId });
      return todoListService.toGraphQL(created);
    },
    updateTodoList: async (
      _: unknown,
      { id, tenantId, input }: { id: string; tenantId: string; input: UpdateTodoListInput },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await todoListService.update(id, scopedId, input);
      return updated ? todoListService.toGraphQL(updated) : null;
    },
    deleteTodoList: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      return todoListService.delete(id, scopedId);
    },

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
      { tenantId, todoListId, orderedIds }: { tenantId: string; todoListId?: string; orderedIds: string[] },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const items = await todoService.reorder(scopedId, orderedIds, todoListId);
      return items.map((t) => todoService.toGraphQL(t));
    },
  },
};
