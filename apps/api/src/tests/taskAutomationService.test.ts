import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  Task: {
    findOne: jest.fn(),
    find: jest.fn(),
  },
  TaskAutomation: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
  TaskAutomationExecution: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
  AppNotification: {
    create: jest.fn(),
  },
}));

jest.mock('../services/todoService', () => ({
  todoService: {
    recordActivity: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({ _id: { toString: () => 'new-task' } }),
  },
}));

jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { TaskAutomation, TaskAutomationExecution, AppNotification } from '@luxgen/db';
import { TaskAutomationService, evaluateConditions } from '../services/taskAutomationService';

describe('evaluateConditions', () => {
  const task = {
    status: 'COMPLETED',
    priority: 'HIGH',
    assigneeId: 'u1',
    title: 'Ship it',
  } as never;

  it('passes empty rules', () => {
    expect(evaluateConditions({ op: 'AND', rules: [] }, task)).toBe(true);
  });

  it('evaluates AND eq rules', () => {
    expect(
      evaluateConditions(
        {
          op: 'AND',
          rules: [
            { field: 'status', operator: 'eq', value: 'COMPLETED' },
            { field: 'priority', operator: 'eq', value: 'HIGH' },
          ],
        },
        task,
      ),
    ).toBe(true);
    expect(
      evaluateConditions(
        {
          op: 'AND',
          rules: [
            { field: 'status', operator: 'eq', value: 'COMPLETED' },
            { field: 'priority', operator: 'eq', value: 'LOW' },
          ],
        },
        task,
      ),
    ).toBe(false);
  });

  it('evaluates changed_to with previous', () => {
    const previous = { status: 'OPEN', priority: 'HIGH', assigneeId: 'u1', title: 'Ship it' } as never;
    expect(
      evaluateConditions(
        { op: 'AND', rules: [{ field: 'status', operator: 'changed_to', value: 'COMPLETED' }] },
        task,
        previous,
      ),
    ).toBe(true);
  });
});

describe('TaskAutomationService Phase 5', () => {
  let service: TaskAutomationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TaskAutomationService();
  });

  it('create requires name, trigger, actions', async () => {
    await expect(
      service.create({
        tenantId: 't1',
        name: '',
        trigger: { type: 'task.completed' },
        actions: [{ type: 'notify_user', config: { userId: 'u1' } }],
      }),
    ).rejects.toThrow();
  });

  it('dispatch runs matching automation and is idempotent', async () => {
    const automation = {
      _id: { toString: () => 'auto1' },
      tenantId: 't1',
      todoListId: null,
      name: 'On complete notify',
      enabled: true,
      trigger: { type: 'task.completed' },
      conditions: { op: 'AND', rules: [] },
      actions: [{ type: 'notify_user', config: { userId: 'u1', title: 'Done', body: '{{title}}' } }],
    };
    (TaskAutomation.find as jest.Mock).mockResolvedValue([automation]);
    (TaskAutomationExecution.findOne as jest.Mock).mockResolvedValue(null);
    (TaskAutomationExecution.create as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'exec1' },
      tenantId: 't1',
      automationId: 'auto1',
      taskId: 'task1',
      status: 'running',
      steps: [],
    });
    (TaskAutomationExecution.findOneAndUpdate as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'exec1' },
      status: 'completed',
      steps: [{ actionType: 'notify_user', ok: true }],
    });
    (AppNotification.create as jest.Mock).mockResolvedValue({});

    const task = {
      _id: { toString: () => 'task1' },
      tenantId: 't1',
      todoListId: 'list1',
      title: 'Finish report',
      status: 'COMPLETED',
      assigneeId: 'u1',
    } as never;

    const result = await service.dispatch({
      tenantId: 't1',
      trigger: 'task.completed',
      task,
      occurrenceBucket: 'completed:1',
    });

    expect(result.ran).toBe(1);
    expect(AppNotification.create).toHaveBeenCalled();
    expect(TaskAutomationExecution.create).toHaveBeenCalled();

    // Idempotent replay
    (TaskAutomationExecution.findOne as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'exec1' },
      status: 'completed',
    });
    jest.clearAllMocks();
    (TaskAutomation.find as jest.Mock).mockResolvedValue([automation]);
    (TaskAutomationExecution.findOne as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'exec1' },
      status: 'completed',
    });

    const replay = await service.dispatch({
      tenantId: 't1',
      trigger: 'task.completed',
      task,
      occurrenceBucket: 'completed:1',
    });
    expect(replay.ran).toBe(1);
    expect(AppNotification.create).not.toHaveBeenCalled();
  });

  it('skips when conditions fail', async () => {
    const automation = {
      _id: { toString: () => 'auto1' },
      tenantId: 't1',
      todoListId: null,
      name: 'Critical only',
      enabled: true,
      trigger: { type: 'task.completed' },
      conditions: {
        op: 'AND',
        rules: [{ field: 'priority', operator: 'eq', value: 'CRITICAL' }],
      },
      actions: [{ type: 'add_comment', config: { message: 'hi' } }],
    };
    (TaskAutomation.find as jest.Mock).mockResolvedValue([automation]);

    const result = await service.dispatch({
      tenantId: 't1',
      trigger: 'task.completed',
      task: {
        _id: { toString: () => 'task1' },
        tenantId: 't1',
        todoListId: 'list1',
        title: 'x',
        status: 'COMPLETED',
        priority: 'LOW',
      } as never,
      occurrenceBucket: 'c1',
    });

    expect(result.ran).toBe(0);
    expect(result.skipped).toBe(1);
  });
});
