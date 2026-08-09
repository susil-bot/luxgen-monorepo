import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  Task: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
  TaskActivity: {
    create: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn(),
  },
  isTaskOpenStatus: (status: string) =>
    ['DRAFT', 'OPEN', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'READY_FOR_REVIEW'].includes(status),
  normalizeTaskStatus: (status: string) => {
    if (status === 'TODO') return 'OPEN';
    if (status === 'DONE') return 'COMPLETED';
    return status;
  },
}));

import { Task, TaskActivity } from '@luxgen/db';
import { TodoService } from '../services/todoService';

describe('TodoService Phase 1', () => {
  let service: TodoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TodoService();
    (TaskActivity.create as jest.Mock).mockResolvedValue({});
  });

  it('create persists priority assignee and records activity', async () => {
    (Task.findOne as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue({ sortOrder: 2 }),
    });
    const created = {
      _id: { toString: () => 't1' },
      tenantId: 'tenant1',
      todoListId: 'list1',
      title: 'Sales report',
      status: 'OPEN',
      priority: 'HIGH',
      assigneeId: 'u1',
      teamId: 'g1',
      followerIds: [],
      sortOrder: 3,
      dueDate: null,
      startDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (Task.create as jest.Mock).mockResolvedValue(created);

    const result = await service.create({
      tenantId: 'tenant1',
      todoListId: 'list1',
      title: 'Sales report',
      priority: 'HIGH',
      assigneeId: 'u1',
      teamId: 'g1',
      createdById: 'u1',
    });

    expect(Task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sales report',
        status: 'OPEN',
        priority: 'HIGH',
        assigneeId: 'u1',
        teamId: 'g1',
        sortOrder: 3,
      }),
    );
    expect(TaskActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: 't1', message: 'Task created' }),
    );
    expect(service.toGraphQL(result as never).priority).toBe('HIGH');
  });

  it('update status to COMPLETED stamps completedAt and logs activity', async () => {
    const existing = {
      _id: { toString: () => 't1' },
      tenantId: 'tenant1',
      title: 'Sales report',
      status: 'OPEN',
      priority: 'MEDIUM',
      notes: null,
      teamId: null,
      assigneeId: null,
      followerIds: [],
      timezone: null,
      completedAt: null,
    };
    const updated = { ...existing, status: 'COMPLETED', completedAt: new Date() };
    (Task.findOne as jest.Mock).mockResolvedValue(existing);
    (Task.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);

    const result = await service.update('t1', 'tenant1', { status: 'COMPLETED' }, { id: 'u1', name: 'Ada' });

    expect(Task.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 't1', tenantId: 'tenant1' },
      { $set: expect.objectContaining({ status: 'COMPLETED', completedAt: expect.any(Date) }) },
      { new: true },
    );
    expect(TaskActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        field: 'status',
        newValue: 'COMPLETED',
        actorName: 'Ada',
      }),
    );
    expect(result?.status).toBe('COMPLETED');
  });

  it('toggle flips open to COMPLETED', async () => {
    const existing = {
      _id: { toString: () => 't1' },
      tenantId: 'tenant1',
      title: 'X',
      status: 'TODO',
      priority: 'MEDIUM',
      notes: null,
      teamId: null,
      assigneeId: null,
      followerIds: [],
      timezone: null,
      completedAt: null,
    };
    (Task.findOne as jest.Mock).mockResolvedValue(existing);
    (Task.findOneAndUpdate as jest.Mock).mockResolvedValue({ ...existing, status: 'COMPLETED' });

    await service.toggle('t1', 'tenant1');
    expect(Task.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 't1', tenantId: 'tenant1' },
      { $set: expect.objectContaining({ status: 'COMPLETED' }) },
      { new: true },
    );
  });
});
