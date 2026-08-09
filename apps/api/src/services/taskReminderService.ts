import {
  AppNotification,
  Task,
  TaskReminder,
  fireAtFromDueAndPreset,
  type IAppNotification,
  type ITaskReminder,
  type ReminderChannel,
  type ReminderOffsetPreset,
  type ReminderStatus,
} from '@luxgen/db';
import { GraphQLError } from 'graphql';
import { todoService } from './todoService';
import { logger } from '../utils/logger';

export interface CreateReminderInput {
  fireAt?: Date | string | null;
  offsetPreset?: ReminderOffsetPreset | null;
  channelPrefs?: ReminderChannel[];
  createdById?: string | null;
}

export interface UpdateReminderInput {
  fireAt?: Date | string | null;
  offsetPreset?: ReminderOffsetPreset | null;
  channelPrefs?: ReminderChannel[];
  status?: ReminderStatus;
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

function resolveFireAt(
  taskDue: Date | null | undefined,
  input: { fireAt?: Date | string | null; offsetPreset?: ReminderOffsetPreset | null },
): Date {
  const preset = input.offsetPreset ?? 'CUSTOM';
  if (preset !== 'CUSTOM' && taskDue) {
    const computed = fireAtFromDueAndPreset(taskDue, preset);
    if (computed) return computed;
  }
  const absolute = parseDate(input.fireAt);
  if (!absolute) {
    throw new GraphQLError('fireAt is required for custom reminders (or set a task due date with a preset)', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  return absolute;
}

export class TaskReminderService {
  async listForTask(taskId: string, tenantId: string): Promise<ITaskReminder[]> {
    const task = await Task.findOne({ _id: taskId, tenantId });
    if (!task) return [];
    return TaskReminder.find({ tenantId, taskId }).sort({ fireAt: 1 });
  }

  async getById(id: string, tenantId: string): Promise<ITaskReminder | null> {
    return TaskReminder.findOne({ _id: id, tenantId });
  }

  async create(taskId: string, tenantId: string, input: CreateReminderInput): Promise<ITaskReminder> {
    const task = await Task.findOne({ _id: taskId, tenantId });
    if (!task) {
      throw new GraphQLError('Task not found', { extensions: { code: 'NOT_FOUND' } });
    }

    const fireAt = resolveFireAt(task.dueDate, input);
    const reminder = await TaskReminder.create({
      tenantId,
      taskId,
      fireAt,
      offsetPreset: input.offsetPreset ?? 'CUSTOM',
      channelPrefs: input.channelPrefs?.length ? input.channelPrefs : ['in_app'],
      status: 'scheduled',
      createdById: input.createdById ?? null,
    });

    await todoService.recordActivity({
      tenantId,
      taskId,
      message: `Reminder scheduled for ${fireAt.toISOString()}`,
      actorId: input.createdById ?? null,
      source: 'user',
      field: 'reminder',
    });

    return reminder;
  }

  async update(id: string, tenantId: string, input: UpdateReminderInput): Promise<ITaskReminder | null> {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    if (existing.status === 'cancelled' || existing.status === 'fired') {
      throw new GraphQLError('Cannot update a fired or cancelled reminder', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const task = await Task.findOne({ _id: existing.taskId, tenantId });
    const $set: Record<string, unknown> = {};
    if (input.offsetPreset !== undefined || input.fireAt !== undefined) {
      $set.fireAt = resolveFireAt(task?.dueDate, {
        fireAt: input.fireAt !== undefined ? input.fireAt : existing.fireAt,
        offsetPreset: input.offsetPreset !== undefined ? input.offsetPreset : existing.offsetPreset,
      });
      if (input.offsetPreset !== undefined) $set.offsetPreset = input.offsetPreset;
    }
    if (input.channelPrefs !== undefined) $set.channelPrefs = input.channelPrefs;
    if (input.status !== undefined) $set.status = input.status;

    if (Object.keys($set).length === 0) return existing;
    return TaskReminder.findOneAndUpdate({ _id: id, tenantId }, { $set }, { new: true });
  }

  async snooze(id: string, tenantId: string, until: Date | string): Promise<ITaskReminder | null> {
    const snoozeUntil = parseDate(until);
    if (!snoozeUntil) {
      throw new GraphQLError('snooze until date is required', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;

    return TaskReminder.findOneAndUpdate(
      { _id: id, tenantId },
      {
        $set: {
          status: 'snoozed',
          snoozeUntil,
          fireAt: snoozeUntil,
        },
      },
      { new: true },
    );
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await TaskReminder.findOneAndUpdate(
      { _id: id, tenantId, status: { $in: ['scheduled', 'snoozed'] } },
      { $set: { status: 'cancelled' } },
      { new: true },
    );
    return Boolean(result);
  }

  /**
   * Cron sweep: fire due reminders (scheduled/snoozed with fireAt <= now).
   * Idempotent via lastIdempotencyKey = reminderId:fireAtISO.
   */
  async processDueReminders(tenantId?: string): Promise<{ processed: number; notified: number; skipped: number }> {
    const now = new Date();
    const filter: Record<string, unknown> = {
      status: { $in: ['scheduled', 'snoozed'] },
      fireAt: { $lte: now },
    };
    if (tenantId) filter.tenantId = tenantId;

    const due = await TaskReminder.find(filter).limit(200);
    let processed = 0;
    let notified = 0;
    let skipped = 0;

    for (const reminder of due) {
      processed += 1;
      const idempotencyKey = `${reminder._id.toString()}:${reminder.fireAt.toISOString()}`;
      if (reminder.lastIdempotencyKey === idempotencyKey) {
        skipped += 1;
        continue;
      }

      const task = await Task.findOne({ _id: reminder.taskId, tenantId: reminder.tenantId });
      if (!task) {
        await TaskReminder.updateOne({ _id: reminder._id }, { $set: { status: 'cancelled' } });
        skipped += 1;
        continue;
      }

      const recipientId = task.assigneeId || task.createdById || reminder.createdById;
      const channels = (reminder.channelPrefs as ReminderChannel[]) || ['in_app'];

      if (recipientId && channels.includes('in_app')) {
        await AppNotification.create({
          tenantId: reminder.tenantId,
          userId: recipientId,
          category: 'task_reminder',
          title: 'Task reminder',
          body: `"${task.title}" is due soon.`,
          taskId: task._id.toString(),
          reminderId: reminder._id.toString(),
          metadata: { fireAt: reminder.fireAt.toISOString() },
        });
        notified += 1;
      }

      await TaskReminder.updateOne(
        { _id: reminder._id },
        {
          $set: {
            status: 'fired',
            lastFiredAt: now,
            lastIdempotencyKey: idempotencyKey,
            snoozeUntil: null,
          },
        },
      );

      await todoService.recordActivity({
        tenantId: reminder.tenantId,
        taskId: reminder.taskId,
        message: 'Reminder fired',
        source: 'system',
        field: 'reminder',
      });

      logger.info('task reminder fired', {
        tenantId: reminder.tenantId,
        taskId: reminder.taskId,
        reminderId: reminder._id.toString(),
      });
    }

    return { processed, notified, skipped };
  }

  async listNotifications(tenantId: string, userId: string, unreadOnly?: boolean): Promise<IAppNotification[]> {
    const query: Record<string, unknown> = { tenantId, userId };
    if (unreadOnly) query.readAt = null;
    return AppNotification.find(query).sort({ createdAt: -1 }).limit(100);
  }

  async markNotificationRead(id: string, tenantId: string, userId: string): Promise<IAppNotification | null> {
    return AppNotification.findOneAndUpdate(
      { _id: id, tenantId, userId },
      { $set: { readAt: new Date() } },
      { new: true },
    );
  }

  toGraphQL(reminder: ITaskReminder) {
    return {
      id: reminder._id.toString(),
      taskId: reminder.taskId,
      fireAt: reminder.fireAt,
      offsetPreset: reminder.offsetPreset ?? null,
      channelPrefs: reminder.channelPrefs ?? ['in_app'],
      status: reminder.status,
      snoozeUntil: reminder.snoozeUntil ?? null,
      lastFiredAt: reminder.lastFiredAt ?? null,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    };
  }

  notificationToGraphQL(n: IAppNotification) {
    return {
      id: n._id.toString(),
      category: n.category,
      title: n.title,
      body: n.body,
      taskId: n.taskId ?? null,
      reminderId: n.reminderId ?? null,
      readAt: n.readAt ?? null,
      createdAt: n.createdAt,
    };
  }
}

export const taskReminderService = new TaskReminderService();
