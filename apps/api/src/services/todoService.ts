import { Task, type ITask, type TaskStatus } from '@luxgen/db';
import { GraphQLError } from 'graphql';

export interface CreateTaskInput {
  tenantId: string;
  title: string;
  notes?: string | null;
  status?: TaskStatus;
  dueDate?: Date | null;
}

export interface UpdateTaskInput {
  title?: string;
  notes?: string | null;
  status?: TaskStatus;
  dueDate?: Date | null;
}

export interface ListTasksFilter {
  status?: TaskStatus;
}

export class TodoService {
  async listByTenant(tenantId: string, filter: ListTasksFilter = {}): Promise<ITask[]> {
    const query: Record<string, unknown> = { tenantId };
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
    // New tasks go to the end of the list — same "append after current max" idiom as
    // ProjectItem's sortOrder handling.
    const last = await Task.findOne({ tenantId: input.tenantId }).sort({ sortOrder: -1 });
    const sortOrder = (last?.sortOrder ?? 0) + 1;

    return Task.create({
      tenantId: input.tenantId,
      title,
      notes: input.notes ?? null,
      status: input.status ?? 'TODO',
      dueDate: input.dueDate ?? null,
      sortOrder,
    });
  }

  async update(id: string, tenantId: string, input: UpdateTaskInput): Promise<ITask | null> {
    const $set: Record<string, unknown> = {};
    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) throw new GraphQLError('Task title cannot be empty', { extensions: { code: 'BAD_USER_INPUT' } });
      $set.title = title;
    }
    if (input.notes !== undefined) $set.notes = input.notes;
    if (input.status !== undefined) $set.status = input.status;
    if (input.dueDate !== undefined) $set.dueDate = input.dueDate;

    if (Object.keys($set).length === 0) return this.getById(id, tenantId);

    return Task.findOneAndUpdate({ _id: id, tenantId }, { $set }, { new: true });
  }

  async toggle(id: string, tenantId: string): Promise<ITask | null> {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    const nextStatus: TaskStatus = existing.status === 'DONE' ? 'TODO' : 'DONE';
    return Task.findOneAndUpdate({ _id: id, tenantId }, { $set: { status: nextStatus } }, { new: true });
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await Task.findOneAndDelete({ _id: id, tenantId });
    return Boolean(result);
  }

  /** Persists sortOrder = index for each id in orderedIds, scoped to tenant. Ids not owned by
   * this tenant are silently skipped (findOneAndUpdate with tenantId filter matches nothing). */
  async reorder(tenantId: string, orderedIds: string[]): Promise<ITask[]> {
    await Promise.all(
      orderedIds.map((id, index) => Task.findOneAndUpdate({ _id: id, tenantId }, { $set: { sortOrder: index } })),
    );
    return this.listByTenant(tenantId);
  }

  toGraphQL(task: ITask) {
    return {
      id: task._id.toString(),
      tenantId: task.tenantId,
      title: task.title,
      notes: task.notes ?? null,
      status: task.status,
      sortOrder: task.sortOrder,
      dueDate: task.dueDate ?? null,
      createdById: task.createdById ?? null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

export const todoService = new TodoService();
