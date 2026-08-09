import {
  Task,
  TaskRecurrenceRule,
  advanceRecurrenceFireAt,
  isTaskOpenStatus,
  occurrenceKeyFromDate,
  type ITaskRecurrenceRule,
  type IncompleteOccurrenceBehavior,
  type RecurrenceFrequency,
} from '@luxgen/db';
import { GraphQLError } from 'graphql';
import { todoService } from './todoService';
import { logger } from '../utils/logger';

export interface UpsertRecurrenceInput {
  frequency: RecurrenceFrequency;
  interval?: number;
  incompleteBehavior?: IncompleteOccurrenceBehavior;
  timezone?: string | null;
  nextFireAt?: Date | string | null;
  enabled?: boolean;
  endAt?: Date | string | null;
  createdById?: string | null;
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

export class TaskRecurrenceService {
  async getForTask(taskId: string, tenantId: string): Promise<ITaskRecurrenceRule | null> {
    return TaskRecurrenceRule.findOne({ tenantId, taskId });
  }

  async upsertForTask(taskId: string, tenantId: string, input: UpsertRecurrenceInput): Promise<ITaskRecurrenceRule> {
    const task = await Task.findOne({ _id: taskId, tenantId });
    if (!task) {
      throw new GraphQLError('Task not found', { extensions: { code: 'NOT_FOUND' } });
    }

    const frequency = input.frequency;
    const interval = Math.max(1, input.interval ?? 1);
    const incompleteBehavior = input.incompleteBehavior ?? 'create_anyway';
    const timezone = input.timezone?.trim() || task.timezone || 'UTC';
    const nextFireAt =
      parseDate(input.nextFireAt) ?? task.dueDate ?? advanceRecurrenceFireAt(new Date(), frequency, interval);
    const endAt = parseDate(input.endAt) ?? null;
    const enabled = input.enabled !== false;

    const seriesId = task.seriesId || task._id.toString();
    if (!task.seriesId) {
      await Task.updateOne({ _id: taskId, tenantId }, { $set: { seriesId } });
    }

    const existing = await this.getForTask(taskId, tenantId);
    if (existing) {
      const updated = await TaskRecurrenceRule.findOneAndUpdate(
        { _id: existing._id, tenantId },
        {
          $set: {
            frequency,
            interval,
            incompleteBehavior,
            timezone,
            nextFireAt,
            enabled,
            endAt,
            seriesId,
          },
        },
        { new: true },
      );
      if (!updated) {
        throw new GraphQLError('Failed to update recurrence', { extensions: { code: 'INTERNAL' } });
      }
      await todoService.recordActivity({
        tenantId,
        taskId,
        message: `Recurrence updated (${frequency} every ${interval})`,
        actorId: input.createdById ?? null,
        source: 'user',
        field: 'recurrence',
      });
      return updated;
    }

    const created = await TaskRecurrenceRule.create({
      tenantId,
      taskId,
      seriesId,
      frequency,
      interval,
      incompleteBehavior,
      timezone,
      nextFireAt,
      enabled,
      endAt,
      createdById: input.createdById ?? null,
    });

    await todoService.recordActivity({
      tenantId,
      taskId,
      message: `Recurrence set (${frequency} every ${interval})`,
      actorId: input.createdById ?? null,
      source: 'user',
      field: 'recurrence',
    });

    return created;
  }

  async disable(taskId: string, tenantId: string): Promise<boolean> {
    const result = await TaskRecurrenceRule.findOneAndUpdate(
      { tenantId, taskId },
      { $set: { enabled: false } },
      { new: true },
    );
    return Boolean(result);
  }

  /**
   * Cron sweep: materialize due occurrences. Idempotent via (tenantId, seriesId, occurrenceKey).
   */
  async processDueRecurrences(tenantId?: string): Promise<{ processed: number; created: number; skipped: number }> {
    const now = new Date();
    const filter: Record<string, unknown> = {
      enabled: true,
      nextFireAt: { $lte: now },
    };
    if (tenantId) filter.tenantId = tenantId;

    const due = await TaskRecurrenceRule.find(filter).limit(100);
    let processed = 0;
    let created = 0;
    let skipped = 0;

    for (const rule of due) {
      processed += 1;

      if (rule.endAt && rule.nextFireAt > rule.endAt) {
        await TaskRecurrenceRule.updateOne({ _id: rule._id }, { $set: { enabled: false } });
        skipped += 1;
        continue;
      }

      const template = await Task.findOne({ _id: rule.taskId, tenantId: rule.tenantId });
      if (!template) {
        await TaskRecurrenceRule.updateOne({ _id: rule._id }, { $set: { enabled: false } });
        skipped += 1;
        continue;
      }

      const fireAt = rule.nextFireAt;
      const occurrenceKey = occurrenceKeyFromDate(fireAt);

      if (rule.incompleteBehavior === 'skip' || rule.incompleteBehavior === 'after_complete') {
        const openSibling = await Task.findOne({
          tenantId: rule.tenantId,
          seriesId: rule.seriesId,
          status: { $in: ['DRAFT', 'OPEN', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'READY_FOR_REVIEW'] },
          _id: { $ne: template._id },
        });
        const templateOpen = isTaskOpenStatus(template.status);
        const hasOpen = Boolean(openSibling) || templateOpen;

        if (hasOpen && rule.incompleteBehavior === 'skip') {
          const nextFireAt = advanceRecurrenceFireAt(fireAt, rule.frequency, rule.interval);
          await TaskRecurrenceRule.updateOne({ _id: rule._id }, { $set: { nextFireAt } });
          skipped += 1;
          continue;
        }
        if (hasOpen && rule.incompleteBehavior === 'after_complete') {
          skipped += 1;
          continue;
        }
      }

      const existingOcc = await Task.findOne({
        tenantId: rule.tenantId,
        seriesId: rule.seriesId,
        occurrenceKey,
      });

      if (!existingOcc) {
        const last = await Task.findOne({
          tenantId: rule.tenantId,
          todoListId: template.todoListId,
        }).sort({ sortOrder: -1 });
        const sortOrder = (last?.sortOrder ?? 0) + 1;

        const occurrence = await Task.create({
          tenantId: rule.tenantId,
          todoListId: template.todoListId,
          title: template.title,
          notes: template.notes ?? null,
          status: 'OPEN',
          priority: template.priority ?? 'MEDIUM',
          sortOrder,
          teamId: template.teamId ?? null,
          assigneeId: template.assigneeId ?? null,
          followerIds: template.followerIds ?? [],
          startDate: null,
          dueDate: fireAt,
          timezone: rule.timezone || template.timezone || null,
          completedAt: null,
          templateId: template.templateId ?? null,
          seriesId: rule.seriesId,
          occurrenceKey,
          createdById: rule.createdById ?? template.createdById ?? null,
        });

        await todoService.recordActivity({
          tenantId: rule.tenantId,
          taskId: occurrence._id.toString(),
          message: `Occurrence ${occurrenceKey} created from series`,
          source: 'system',
          field: 'recurrence',
        });
        created += 1;
      } else {
        skipped += 1;
      }

      const nextFireAt = advanceRecurrenceFireAt(fireAt, rule.frequency, rule.interval);
      const disable = Boolean(rule.endAt && nextFireAt > rule.endAt);
      await TaskRecurrenceRule.updateOne(
        { _id: rule._id },
        { $set: { nextFireAt, ...(disable ? { enabled: false } : {}) } },
      );

      logger.info('task recurrence processed', {
        tenantId: rule.tenantId,
        seriesId: rule.seriesId,
        occurrenceKey,
        created: !existingOcc,
      });
    }

    return { processed, created, skipped };
  }

  toGraphQL(rule: ITaskRecurrenceRule) {
    return {
      id: rule._id.toString(),
      taskId: rule.taskId,
      seriesId: rule.seriesId,
      frequency: rule.frequency,
      interval: rule.interval,
      incompleteBehavior: rule.incompleteBehavior,
      timezone: rule.timezone,
      nextFireAt: rule.nextFireAt,
      enabled: rule.enabled,
      endAt: rule.endAt ?? null,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}

export const taskRecurrenceService = new TaskRecurrenceService();
