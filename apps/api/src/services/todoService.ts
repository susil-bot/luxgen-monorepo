import {
  Task,
  TaskActivity,
  TaskFieldValue,
  isTaskOpenStatus,
  normalizeTaskStatus,
  type ITask,
  type ITaskActivity,
  type TaskPriority,
  type TaskStatus,
} from '@luxgen/db';
import { GraphQLError } from 'graphql';
import { taskFieldService } from './taskFieldService';

export interface CreateTaskInput {
  tenantId: string;
  todoListId: string;
  title: string;
  notes?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  teamId?: string | null;
  assigneeId?: string | null;
  followerIds?: string[];
  startDate?: Date | null;
  dueDate?: Date | null;
  timezone?: string | null;
  templateId?: string | null;
  createdById?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  notes?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  teamId?: string | null;
  assigneeId?: string | null;
  followerIds?: string[];
  startDate?: Date | null;
  dueDate?: Date | null;
  timezone?: string | null;
  templateId?: string | null;
}

export interface ListTasksFilter {
  todoListId?: string;
  status?: TaskStatus;
}

export interface RecordTaskActivityInput {
  tenantId: string;
  taskId: string;
  message: string;
  actorId?: string | null;
  actorName?: string | null;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  source?: 'user' | 'system';
}

function parseDate(value: Date | string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new GraphQLError('Invalid date', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return d;
}

function statusLabel(status: TaskStatus): string {
  return status.replace(/_/g, ' ').toLowerCase();
}

export class TodoService {
  async listByTenant(tenantId: string, filter: ListTasksFilter = {}): Promise<ITask[]> {
    const query: Record<string, unknown> = { tenantId };
    if (filter.todoListId) query.todoListId = filter.todoListId;
    if (filter.status) query.status = filter.status;
    return Task.find(query).sort({ sortOrder: 1, createdAt: -1 });
  }

  async getById(id: string, tenantId: string): Promise<ITask | null> {
    return Task.findOne({ _id: id, tenantId });
  }

  async create(input: CreateTaskInput): Promise<ITask> {
    const title = input.title.trim();
    if (!title) {
      throw new GraphQLError('Task title is required', { extensions: { code: 'BAD_USER_INPUT' } });
    }

    const last = await Task.findOne({ tenantId: input.tenantId, todoListId: input.todoListId }).sort({
      sortOrder: -1,
    });
    const sortOrder = (last?.sortOrder ?? 0) + 1;
    const status = normalizeTaskStatus(input.status ?? 'OPEN');
    const completedAt = isTaskOpenStatus(status) ? null : new Date();

    const task = await Task.create({
      tenantId: input.tenantId,
      todoListId: input.todoListId,
      title,
      notes: input.notes ?? null,
      status,
      priority: input.priority ?? 'MEDIUM',
      sortOrder,
      teamId: input.teamId ?? null,
      assigneeId: input.assigneeId ?? null,
      followerIds: input.followerIds ?? [],
      startDate: parseDate(input.startDate) ?? null,
      dueDate: parseDate(input.dueDate) ?? null,
      timezone: input.timezone ?? null,
      completedAt,
      templateId: input.templateId ?? null,
      createdById: input.createdById ?? null,
    });

    await this.recordActivity({
      tenantId: input.tenantId,
      taskId: task._id.toString(),
      message: 'Task created',
      actorId: input.createdById ?? null,
      source: 'user',
    });

    void import('./taskAutomationService')
      .then(({ safeDispatch }) =>
        safeDispatch({
          tenantId: input.tenantId,
          trigger: 'task.created',
          task,
          occurrenceBucket: `created:${task._id.toString()}`,
        }),
      )
      .catch(() => undefined);

    return task;
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateTaskInput,
    actor?: { id?: string | null; name?: string | null },
  ): Promise<ITask | null> {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;

    const $set: Record<string, unknown> = {};
    const activities: Omit<RecordTaskActivityInput, 'tenantId' | 'taskId'>[] = [];

    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) throw new GraphQLError('Task title cannot be empty', { extensions: { code: 'BAD_USER_INPUT' } });
      if (title !== existing.title) {
        $set.title = title;
        activities.push({
          message: 'Title updated',
          field: 'title',
          oldValue: existing.title,
          newValue: title,
        });
      }
    }
    if (input.notes !== undefined && input.notes !== existing.notes) {
      $set.notes = input.notes;
      activities.push({ message: 'Notes updated', field: 'notes' });
    }
    if (input.priority !== undefined && input.priority !== existing.priority) {
      $set.priority = input.priority;
      activities.push({
        message: `Priority set to ${input.priority}`,
        field: 'priority',
        oldValue: existing.priority,
        newValue: input.priority,
      });
    }
    if (input.teamId !== undefined && input.teamId !== existing.teamId) {
      $set.teamId = input.teamId;
      activities.push({
        message: input.teamId ? 'Team assigned' : 'Team cleared',
        field: 'teamId',
        oldValue: existing.teamId ?? null,
        newValue: input.teamId,
      });
    }
    if (input.assigneeId !== undefined && input.assigneeId !== existing.assigneeId) {
      $set.assigneeId = input.assigneeId;
      activities.push({
        message: input.assigneeId ? 'Assignee updated' : 'Assignee cleared',
        field: 'assigneeId',
        oldValue: existing.assigneeId ?? null,
        newValue: input.assigneeId,
      });
    }
    if (input.followerIds !== undefined) {
      $set.followerIds = input.followerIds;
      activities.push({ message: 'Followers updated', field: 'followerIds' });
    }
    if (input.startDate !== undefined) {
      const startDate = parseDate(input.startDate) ?? null;
      $set.startDate = startDate;
      activities.push({ message: 'Start date updated', field: 'startDate' });
    }
    if (input.dueDate !== undefined) {
      const dueDate = parseDate(input.dueDate) ?? null;
      $set.dueDate = dueDate;
      activities.push({ message: 'Due date updated', field: 'dueDate' });
    }
    if (input.timezone !== undefined && input.timezone !== existing.timezone) {
      $set.timezone = input.timezone;
      activities.push({ message: 'Timezone updated', field: 'timezone' });
    }
    if (input.templateId !== undefined && input.templateId !== existing.templateId) {
      $set.templateId = input.templateId;
      activities.push({
        message: input.templateId ? 'Template applied' : 'Template cleared',
        field: 'templateId',
        oldValue: existing.templateId ?? null,
        newValue: input.templateId,
      });
    }
    if (input.status !== undefined) {
      const status = normalizeTaskStatus(input.status);
      if (status !== existing.status) {
        if (status === 'COMPLETED' || status === 'DONE') {
          await taskFieldService.assertCanComplete(id, tenantId);
        }
        $set.status = status;
        $set.completedAt = isTaskOpenStatus(status) ? null : (existing.completedAt ?? new Date());
        activities.push({
          message: `Status changed to ${statusLabel(status)}`,
          field: 'status',
          oldValue: existing.status,
          newValue: status,
        });
      }
    }

    if (Object.keys($set).length === 0) return existing;

    const updated = await Task.findOneAndUpdate({ _id: id, tenantId }, { $set }, { new: true });
    if (!updated) return null;

    for (const activity of activities) {
      await this.recordActivity({
        tenantId,
        taskId: id,
        actorId: actor?.id ?? null,
        actorName: actor?.name ?? null,
        source: 'user',
        ...activity,
      });
    }

    void import('./taskAutomationService')
      .then(({ safeDispatchFromUpdate }) => safeDispatchFromUpdate(existing, updated, tenantId))
      .catch(() => undefined);

    return updated;
  }

  async toggle(
    id: string,
    tenantId: string,
    actor?: { id?: string | null; name?: string | null },
  ): Promise<ITask | null> {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    const nextStatus: TaskStatus = isTaskOpenStatus(existing.status) ? 'COMPLETED' : 'OPEN';
    return this.update(id, tenantId, { status: nextStatus }, actor);
  }

  /** Explicit complete — enforces required fields (Phase 3). */
  async complete(
    id: string,
    tenantId: string,
    actor?: { id?: string | null; name?: string | null },
  ): Promise<ITask | null> {
    return this.update(id, tenantId, { status: 'COMPLETED' }, actor);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await Task.findOneAndDelete({ _id: id, tenantId });
    if (result) {
      await TaskActivity.deleteMany({ tenantId, taskId: id });
      await TaskFieldValue.deleteMany({ tenantId, taskId: id });
    }
    return Boolean(result);
  }

  async reorder(tenantId: string, orderedIds: string[], todoListId?: string): Promise<ITask[]> {
    await Promise.all(
      orderedIds.map((id, index) => Task.findOneAndUpdate({ _id: id, tenantId }, { $set: { sortOrder: index } })),
    );
    return this.listByTenant(tenantId, todoListId ? { todoListId } : {});
  }

  async recordActivity(input: RecordTaskActivityInput): Promise<ITaskActivity> {
    return TaskActivity.create({
      tenantId: input.tenantId,
      taskId: input.taskId,
      message: input.message,
      actorId: input.actorId ?? null,
      actorName: input.actorName ?? null,
      field: input.field ?? null,
      oldValue: input.oldValue ?? null,
      newValue: input.newValue ?? null,
      source: input.source ?? 'user',
    });
  }

  async listActivity(taskId: string, tenantId: string, limit = 50): Promise<ITaskActivity[]> {
    const task = await this.getById(taskId, tenantId);
    if (!task) return [];
    return TaskActivity.find({ tenantId, taskId }).sort({ createdAt: -1 }).limit(Math.min(limit, 100));
  }

  toGraphQL(task: ITask) {
    return {
      id: task._id.toString(),
      tenantId: task.tenantId,
      todoListId: task.todoListId,
      title: task.title,
      notes: task.notes ?? null,
      status: task.status,
      priority: task.priority ?? 'MEDIUM',
      sortOrder: task.sortOrder,
      teamId: task.teamId ?? null,
      assigneeId: task.assigneeId ?? null,
      followerIds: task.followerIds ?? [],
      startDate: task.startDate ?? null,
      dueDate: task.dueDate ?? null,
      timezone: task.timezone ?? null,
      completedAt: task.completedAt ?? null,
      templateId: task.templateId ?? null,
      seriesId: task.seriesId ?? null,
      occurrenceKey: task.occurrenceKey ?? null,
      createdById: task.createdById ?? null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  activityToGraphQL(row: ITaskActivity) {
    return {
      id: row._id.toString(),
      taskId: row.taskId,
      message: row.message,
      actorId: row.actorId ?? null,
      actorName: row.actorName ?? null,
      field: row.field ?? null,
      oldValue: row.oldValue ?? null,
      newValue: row.newValue ?? null,
      source: row.source,
      createdAt: row.createdAt,
    };
  }
}

export const todoService = new TodoService();
