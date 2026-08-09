import { Task, TodoList, type ITodoList } from '@luxgen/db';
import { GraphQLError } from 'graphql';

export interface CreateTodoListInput {
  tenantId: string;
  name: string;
  createdById?: string | null;
}

export interface UpdateTodoListInput {
  name?: string;
}

export class TodoListService {
  /**
   * Lists a tenant's named todo lists, oldest first. If a tenant has none yet -- either
   * they're brand new, or they're on data from before multi-list support existed -- creates a
   * default "My Tasks" list and, if there are any orphaned Task documents (todoListId missing,
   * from before this field existed), attaches them to it. Idempotent: once a list exists this
   * branch never runs again for that tenant, so it's safe to leave as the standing migration
   * path rather than a one-off script someone has to remember to run.
   */
  async listByTenant(tenantId: string): Promise<ITodoList[]> {
    const lists = await TodoList.find({ tenantId }).sort({ createdAt: 1 });
    if (lists.length > 0) return lists;

    const orphaned = await Task.countDocuments({ tenantId, todoListId: { $in: [null, undefined] } });
    const defaultList = await TodoList.create({ tenantId, name: 'My Tasks' });
    if (orphaned > 0) {
      await Task.updateMany(
        { tenantId, todoListId: { $in: [null, undefined] } },
        { $set: { todoListId: defaultList._id.toString() } },
      );
    }
    return [defaultList];
  }

  async getById(id: string, tenantId: string): Promise<ITodoList | null> {
    return TodoList.findOne({ _id: id, tenantId });
  }

  async create(input: CreateTodoListInput): Promise<ITodoList> {
    const name = input.name.trim();
    if (!name) {
      throw new GraphQLError('List name is required', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    return TodoList.create({
      tenantId: input.tenantId,
      name,
      createdById: input.createdById ?? null,
    });
  }

  async update(id: string, tenantId: string, input: UpdateTodoListInput): Promise<ITodoList | null> {
    const $set: Record<string, unknown> = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new GraphQLError('List name cannot be empty', { extensions: { code: 'BAD_USER_INPUT' } });
      $set.name = name;
    }
    if (Object.keys($set).length === 0) return this.getById(id, tenantId);
    return TodoList.findOneAndUpdate({ _id: id, tenantId }, { $set }, { new: true });
  }

  /** Deletes the list and every task in it. */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await TodoList.findOneAndDelete({ _id: id, tenantId });
    if (!result) return false;
    await Task.deleteMany({ tenantId, todoListId: id });
    return true;
  }

  async taskCount(id: string, tenantId: string): Promise<number> {
    return Task.countDocuments({ tenantId, todoListId: id });
  }

  toGraphQL(list: ITodoList) {
    return {
      id: list._id.toString(),
      tenantId: list.tenantId,
      name: list.name,
      createdById: list.createdById ?? null,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    };
  }
}

export const todoListService = new TodoListService();
