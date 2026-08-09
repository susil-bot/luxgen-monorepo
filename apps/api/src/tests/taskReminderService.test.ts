import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  Task: {
    findOne: jest.fn(),
  },
  TaskReminder: {
    find: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  },
  AppNotification: {
    create: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
  fireAtFromDueAndPreset: (due: Date, preset: string) => {
    const ms: Record<string, number> = {
      M5: 5 * 60 * 1000,
      M15: 15 * 60 * 1000,
      H1: 60 * 60 * 1000,
      D1: 24 * 60 * 60 * 1000,
    };
    if (!ms[preset]) return null;
    return new Date(due.getTime() - ms[preset]);
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

import { Task, TaskReminder, AppNotification } from '@luxgen/db';
import { TaskReminderService } from '../services/taskReminderService';
import { todoService } from '../services/todoService';

describe('TaskReminderService Phase 2', () => {
  let service: TaskReminderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TaskReminderService();
  });

  it('create computes fireAt from due date + H1 preset', async () => {
    const due = new Date('2026-08-10T18:00:00.000Z');
    (Task.findOne as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'task1' },
      dueDate: due,
      title: 'Ship Phase 2',
    });
    const created = {
      _id: { toString: () => 'rem1' },
      tenantId: 'tenant1',
      taskId: 'task1',
      fireAt: new Date('2026-08-10T17:00:00.000Z'),
      offsetPreset: 'H1',
      channelPrefs: ['in_app'],
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (TaskReminder.create as jest.Mock).mockResolvedValue(created);

    const result = await service.create('task1', 'tenant1', {
      offsetPreset: 'H1',
      createdById: 'u1',
    });

    expect(TaskReminder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fireAt: new Date('2026-08-10T17:00:00.000Z'),
        offsetPreset: 'H1',
        status: 'scheduled',
      }),
    );
    expect(todoService.recordActivity).toHaveBeenCalled();
    expect(result._id.toString()).toBe('rem1');
  });

  it('processDueReminders creates notification once (idempotent key)', async () => {
    const fireAt = new Date('2026-08-09T12:00:00.000Z');
    const reminder = {
      _id: { toString: () => 'rem1' },
      tenantId: 'tenant1',
      taskId: 'task1',
      fireAt,
      channelPrefs: ['in_app'],
      status: 'scheduled',
      lastIdempotencyKey: null,
      createdById: 'u1',
    };
    (TaskReminder.find as jest.Mock).mockReturnValue({
      limit: jest.fn().mockResolvedValue([reminder]),
    });
    (Task.findOne as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'task1' },
      title: 'Ship Phase 2',
      assigneeId: 'u2',
      createdById: 'u1',
    });
    (AppNotification.create as jest.Mock).mockResolvedValue({});
    (TaskReminder.updateOne as jest.Mock).mockResolvedValue({});

    const first = await service.processDueReminders('tenant1');
    expect(first.notified).toBe(1);
    expect(AppNotification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u2',
        category: 'task_reminder',
        taskId: 'task1',
      }),
    );
    expect(TaskReminder.updateOne).toHaveBeenCalledWith(
      { _id: reminder._id },
      expect.objectContaining({
        $set: expect.objectContaining({
          status: 'fired',
          lastIdempotencyKey: `rem1:${fireAt.toISOString()}`,
        }),
      }),
    );

    // Second pass with same key already set → skip notify
    jest.clearAllMocks();
    (TaskReminder.find as jest.Mock).mockReturnValue({
      limit: jest.fn().mockResolvedValue([{ ...reminder, lastIdempotencyKey: `rem1:${fireAt.toISOString()}` }]),
    });
    const second = await service.processDueReminders('tenant1');
    expect(second.skipped).toBe(1);
    expect(AppNotification.create).not.toHaveBeenCalled();
  });

  it('snooze moves fireAt and marks snoozed', async () => {
    const until = new Date('2026-08-10T20:00:00.000Z');
    (TaskReminder.findOne as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'rem1' },
      status: 'scheduled',
    });
    (TaskReminder.findOneAndUpdate as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'rem1' },
      status: 'snoozed',
      fireAt: until,
      snoozeUntil: until,
    });

    const result = await service.snooze('rem1', 'tenant1', until);
    expect(TaskReminder.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'rem1', tenantId: 'tenant1' },
      {
        $set: {
          status: 'snoozed',
          snoozeUntil: until,
          fireAt: until,
        },
      },
      { new: true },
    );
    expect(result?.status).toBe('snoozed');
  });
});
