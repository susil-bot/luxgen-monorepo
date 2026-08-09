import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  Task: {
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
  },
  TaskRecurrenceRule: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  },
  isTaskOpenStatus: (status: string) =>
    ['DRAFT', 'OPEN', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'READY_FOR_REVIEW'].includes(status),
  occurrenceKeyFromDate: (d: Date) => d.toISOString().slice(0, 10),
  advanceRecurrenceFireAt: (from: Date, frequency: string, interval: number) => {
    const next = new Date(from.getTime());
    const n = Math.max(1, interval || 1);
    if (frequency === 'DAILY') next.setUTCDate(next.getUTCDate() + n);
    else if (frequency === 'WEEKLY') next.setUTCDate(next.getUTCDate() + 7 * n);
    else next.setUTCDate(next.getUTCDate() + n);
    return next;
  },
}));

jest.mock('../services/todoService', () => ({
  todoService: {
    recordActivity: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { Task, TaskRecurrenceRule } from '@luxgen/db';
import { TaskRecurrenceService } from '../services/taskRecurrenceService';

describe('TaskRecurrenceService Phase 4', () => {
  let service: TaskRecurrenceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TaskRecurrenceService();
  });

  it('upsert creates rule and stamps seriesId on task', async () => {
    (Task.findOne as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'task1' },
      seriesId: null,
      dueDate: new Date('2026-08-10T12:00:00.000Z'),
      timezone: 'UTC',
    });
    (Task.updateOne as jest.Mock).mockResolvedValue({});
    (TaskRecurrenceRule.findOne as jest.Mock).mockResolvedValue(null);
    (TaskRecurrenceRule.create as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'rule1' },
      taskId: 'task1',
      seriesId: 'task1',
      frequency: 'WEEKLY',
      interval: 1,
      incompleteBehavior: 'create_anyway',
      timezone: 'UTC',
      nextFireAt: new Date('2026-08-10T12:00:00.000Z'),
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const rule = await service.upsertForTask('task1', 'tenant1', {
      frequency: 'WEEKLY',
      interval: 1,
      createdById: 'u1',
    });

    expect(Task.updateOne).toHaveBeenCalled();
    expect(TaskRecurrenceRule.create).toHaveBeenCalledWith(
      expect.objectContaining({
        seriesId: 'task1',
        frequency: 'WEEKLY',
        enabled: true,
      }),
    );
    expect(rule._id.toString()).toBe('rule1');
  });

  it('processDueRecurrences creates occurrence once (idempotent key)', async () => {
    const fireAt = new Date('2026-08-09T12:00:00.000Z');
    const rule = {
      _id: { toString: () => 'rule1' },
      tenantId: 'tenant1',
      taskId: 'task1',
      seriesId: 'task1',
      frequency: 'DAILY',
      interval: 1,
      incompleteBehavior: 'create_anyway',
      timezone: 'UTC',
      nextFireAt: fireAt,
      enabled: true,
      endAt: null,
      createdById: 'u1',
    };
    (TaskRecurrenceRule.find as jest.Mock).mockReturnValue({
      limit: jest.fn().mockResolvedValue([rule]),
    });
    (Task.findOne as jest.Mock)
      .mockResolvedValueOnce({
        _id: { toString: () => 'task1' },
        todoListId: 'list1',
        title: 'Daily standup',
        notes: null,
        status: 'OPEN',
        priority: 'MEDIUM',
        followerIds: [],
        templateId: null,
        createdById: 'u1',
      })
      .mockResolvedValueOnce(null) // existing occurrence
      .mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue({ sortOrder: 2 }),
      });
    (Task.create as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'occ1' },
    });
    (TaskRecurrenceRule.updateOne as jest.Mock).mockResolvedValue({});

    const first = await service.processDueRecurrences('tenant1');
    expect(first.created).toBe(1);
    expect(Task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        seriesId: 'task1',
        occurrenceKey: '2026-08-09',
        title: 'Daily standup',
      }),
    );

    jest.clearAllMocks();
    (TaskRecurrenceRule.find as jest.Mock).mockReturnValue({
      limit: jest.fn().mockResolvedValue([{ ...rule, nextFireAt: fireAt }]),
    });
    (Task.findOne as jest.Mock)
      .mockResolvedValueOnce({
        _id: { toString: () => 'task1' },
        todoListId: 'list1',
        title: 'Daily standup',
        status: 'OPEN',
        priority: 'MEDIUM',
        followerIds: [],
      })
      .mockResolvedValueOnce({ _id: { toString: () => 'occ1' } }); // existing
    (TaskRecurrenceRule.updateOne as jest.Mock).mockResolvedValue({});

    const second = await service.processDueRecurrences('tenant1');
    expect(second.skipped).toBeGreaterThanOrEqual(1);
    expect(Task.create).not.toHaveBeenCalled();
  });
});
