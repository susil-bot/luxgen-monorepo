import type { ReminderChannel, ReminderOffsetPreset, ReminderStatus, TaskStatus } from '@luxgen/db';
import { GraphQLError } from 'graphql';
import type { GraphQLContext } from '../../context';
import { scopedTenantId as resolveScopedTenantId } from '../../graphql/tenantScope';
import { todoService, type CreateTaskInput, type UpdateTaskInput } from '../../services/todoService';
import { todoListService, type CreateTodoListInput, type UpdateTodoListInput } from '../../services/todoListService';
import { taskReminderService } from '../../services/taskReminderService';

function actorFromCtx(ctx: GraphQLContext): { id?: string | null; name?: string | null } {
  const user = ctx.user as { _id?: { toString(): string }; id?: string; firstName?: string; lastName?: string } | null;
  if (!user) return {};
  const id = user._id?.toString?.() ?? user.id ?? null;
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || null;
  return { id, name };
}

function requireUserId(ctx: GraphQLContext): string {
  const id = actorFromCtx(ctx).id;
  if (!id) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return id;
}

export const todoResolvers = {
  TodoList: {
    taskCount: async (parent: { id: string; tenantId: string }) =>
      todoListService.taskCount(parent.id, parent.tenantId),
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
    taskActivity: async (
      _: unknown,
      { taskId, tenantId, limit }: { taskId: string; tenantId: string; limit?: number },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const rows = await todoService.listActivity(taskId, scopedId, limit ?? 50);
      return rows.map((r) => todoService.activityToGraphQL(r));
    },
    taskReminders: async (
      _: unknown,
      { taskId, tenantId }: { taskId: string; tenantId: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const rows = await taskReminderService.listForTask(taskId, scopedId);
      return rows.map((r) => taskReminderService.toGraphQL(r));
    },
    myNotifications: async (
      _: unknown,
      { tenantId, unreadOnly }: { tenantId: string; unreadOnly?: boolean },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const userId = requireUserId(ctx);
      const rows = await taskReminderService.listNotifications(scopedId, userId, unreadOnly);
      return rows.map((n) => taskReminderService.notificationToGraphQL(n));
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
      const actor = actorFromCtx(ctx);
      const created = await todoService.create({
        ...input,
        tenantId: scopedId,
        createdById: actor.id ?? null,
      });
      return todoService.toGraphQL(created);
    },
    updateTask: async (
      _: unknown,
      { id, tenantId, input }: { id: string; tenantId: string; input: UpdateTaskInput },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await todoService.update(id, scopedId, input, actorFromCtx(ctx));
      return updated ? todoService.toGraphQL(updated) : null;
    },
    toggleTask: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await todoService.toggle(id, scopedId, actorFromCtx(ctx));
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

    createTaskReminder: async (
      _: unknown,
      {
        taskId,
        tenantId,
        input,
      }: {
        taskId: string;
        tenantId: string;
        input: {
          fireAt?: string | null;
          offsetPreset?: ReminderOffsetPreset | null;
          channelPrefs?: ReminderChannel[];
        };
      },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const actor = actorFromCtx(ctx);
      const created = await taskReminderService.create(taskId, scopedId, {
        ...input,
        createdById: actor.id ?? null,
      });
      return taskReminderService.toGraphQL(created);
    },
    updateTaskReminder: async (
      _: unknown,
      {
        id,
        tenantId,
        input,
      }: {
        id: string;
        tenantId: string;
        input: {
          fireAt?: string | null;
          offsetPreset?: ReminderOffsetPreset | null;
          channelPrefs?: ReminderChannel[];
          status?: ReminderStatus;
        };
      },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await taskReminderService.update(id, scopedId, input);
      return updated ? taskReminderService.toGraphQL(updated) : null;
    },
    snoozeTaskReminder: async (
      _: unknown,
      { id, tenantId, until }: { id: string; tenantId: string; until: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await taskReminderService.snooze(id, scopedId, until);
      return updated ? taskReminderService.toGraphQL(updated) : null;
    },
    deleteTaskReminder: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      return taskReminderService.delete(id, scopedId);
    },
    markNotificationRead: async (
      _: unknown,
      { id, tenantId }: { id: string; tenantId: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const userId = requireUserId(ctx);
      const updated = await taskReminderService.markNotificationRead(id, scopedId, userId);
      return updated ? taskReminderService.notificationToGraphQL(updated) : null;
    },
  },
};
