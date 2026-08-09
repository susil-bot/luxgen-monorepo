import type { ReminderChannel, ReminderOffsetPreset, ReminderStatus, TaskStatus } from '@luxgen/db';
import { GraphQLError } from 'graphql';
import type { GraphQLContext } from '../../context';
import { scopedTenantId as resolveScopedTenantId } from '../../graphql/tenantScope';
import { todoService, type CreateTaskInput, type UpdateTaskInput } from '../../services/todoService';
import { todoListService, type CreateTodoListInput, type UpdateTodoListInput } from '../../services/todoListService';
import { taskReminderService } from '../../services/taskReminderService';
import { taskFieldService, type CreateTemplateInput, type UpdateTemplateInput } from '../../services/taskFieldService';
import { taskRecurrenceService, type UpsertRecurrenceInput } from '../../services/taskRecurrenceService';
import {
  taskAutomationService,
  type CreateTaskAutomationInput,
  type UpdateTaskAutomationInput,
} from '../../services/taskAutomationService';

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
    taskTemplates: async (
      _: unknown,
      { tenantId, teamId }: { tenantId: string; teamId?: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const rows = await taskFieldService.listTemplates(scopedId, teamId);
      return rows.map((t) => taskFieldService.templateToGraphQL(t));
    },
    taskTemplate: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const row = await taskFieldService.getTemplate(id, scopedId);
      return row ? taskFieldService.templateToGraphQL(row) : null;
    },
    taskFieldValues: async (
      _: unknown,
      { taskId, tenantId }: { taskId: string; tenantId: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const rows = await taskFieldService.listFieldValues(taskId, scopedId);
      return rows.map((v) => taskFieldService.valueToGraphQL(v));
    },
    taskRecurrence: async (
      _: unknown,
      { taskId, tenantId }: { taskId: string; tenantId: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const row = await taskRecurrenceService.getForTask(taskId, scopedId);
      return row ? taskRecurrenceService.toGraphQL(row) : null;
    },
    taskAutomations: async (
      _: unknown,
      { tenantId, todoListId }: { tenantId: string; todoListId?: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const rows = await taskAutomationService.list(scopedId, todoListId);
      return rows.map((r) => taskAutomationService.toGraphQL(r));
    },
    taskAutomation: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const row = await taskAutomationService.getById(id, scopedId);
      return row ? taskAutomationService.toGraphQL(row) : null;
    },
    taskAutomationExecutions: async (
      _: unknown,
      { automationId, tenantId, limit }: { automationId: string; tenantId: string; limit?: number },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const rows = await taskAutomationService.listExecutions(automationId, scopedId, limit ?? 50);
      return rows.map((r) => taskAutomationService.executionToGraphQL(r));
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
    completeTask: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await todoService.complete(id, scopedId, actorFromCtx(ctx));
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

    createTaskTemplate: async (_: unknown, { input }: { input: CreateTemplateInput }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, input.tenantId);
      const actor = actorFromCtx(ctx);
      const created = await taskFieldService.createTemplate({
        ...input,
        tenantId: scopedId,
        createdById: actor.id ?? null,
      });
      return taskFieldService.templateToGraphQL(created);
    },
    updateTaskTemplate: async (
      _: unknown,
      { id, tenantId, input }: { id: string; tenantId: string; input: UpdateTemplateInput },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await taskFieldService.updateTemplate(id, scopedId, input);
      return updated ? taskFieldService.templateToGraphQL(updated) : null;
    },
    deleteTaskTemplate: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      return taskFieldService.deleteTemplate(id, scopedId);
    },
    applyTaskTemplate: async (
      _: unknown,
      { taskId, tenantId, templateId }: { taskId: string; tenantId: string; templateId: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      await taskFieldService.applyTemplateToTask(taskId, scopedId, templateId);
      const updated = await todoService.update(taskId, scopedId, { templateId }, actorFromCtx(ctx));
      return updated ? todoService.toGraphQL(updated) : null;
    },
    upsertTaskFieldValue: async (
      _: unknown,
      { taskId, tenantId, fieldId, value }: { taskId: string; tenantId: string; fieldId: string; value: unknown },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const actor = actorFromCtx(ctx);
      const row = await taskFieldService.upsertFieldValue(taskId, scopedId, fieldId, value, actor.id ?? null);
      return taskFieldService.valueToGraphQL(row);
    },
    upsertTaskRecurrence: async (
      _: unknown,
      { taskId, tenantId, input }: { taskId: string; tenantId: string; input: UpsertRecurrenceInput },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const actor = actorFromCtx(ctx);
      const row = await taskRecurrenceService.upsertForTask(taskId, scopedId, {
        ...input,
        createdById: actor.id ?? null,
      });
      return taskRecurrenceService.toGraphQL(row);
    },
    disableTaskRecurrence: async (
      _: unknown,
      { taskId, tenantId }: { taskId: string; tenantId: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      return taskRecurrenceService.disable(taskId, scopedId);
    },

    createTaskAutomation: async (_: unknown, { input }: { input: CreateTaskAutomationInput }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, input.tenantId);
      const actor = actorFromCtx(ctx);
      const created = await taskAutomationService.create({
        ...input,
        tenantId: scopedId,
        createdById: actor.id ?? null,
      });
      return taskAutomationService.toGraphQL(created);
    },
    updateTaskAutomation: async (
      _: unknown,
      { id, tenantId, input }: { id: string; tenantId: string; input: UpdateTaskAutomationInput },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await taskAutomationService.update(id, scopedId, input);
      return updated ? taskAutomationService.toGraphQL(updated) : null;
    },
    enableTaskAutomation: async (
      _: unknown,
      { id, tenantId }: { id: string; tenantId: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await taskAutomationService.setEnabled(id, scopedId, true);
      return updated ? taskAutomationService.toGraphQL(updated) : null;
    },
    disableTaskAutomation: async (
      _: unknown,
      { id, tenantId }: { id: string; tenantId: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const updated = await taskAutomationService.setEnabled(id, scopedId, false);
      return updated ? taskAutomationService.toGraphQL(updated) : null;
    },
    testTaskAutomation: async (
      _: unknown,
      { id, tenantId, sampleTaskId }: { id: string; tenantId: string; sampleTaskId: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const execution = await taskAutomationService.test(id, scopedId, sampleTaskId);
      return taskAutomationService.executionToGraphQL(execution);
    },
    deleteTaskAutomation: async (
      _: unknown,
      { id, tenantId }: { id: string; tenantId: string },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      return taskAutomationService.delete(id, scopedId);
    },
  },
};
