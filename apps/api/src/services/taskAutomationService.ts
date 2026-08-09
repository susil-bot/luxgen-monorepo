import {
  AppNotification,
  Task,
  TaskAutomation,
  TaskAutomationExecution,
  type ITask,
  type ITaskAutomation,
  type ITaskAutomationAction,
  type ITaskAutomationConditionGroup,
  type ITaskAutomationConditionRule,
  type ITaskAutomationExecution,
  type ITaskAutomationExecutionStep,
  type ITaskAutomationTrigger,
  type TaskAutomationTriggerType,
  type TaskPriority,
  type TaskStatus,
} from '@luxgen/db';
import { GraphQLError } from 'graphql';
import { todoService } from './todoService';
import { logger } from '../utils/logger';

export interface TaskAutomationEvent {
  tenantId: string;
  trigger: TaskAutomationTriggerType;
  task: ITask;
  previous?: ITask | null;
  occurrenceBucket?: string;
  /** Extra context (e.g. overdueHours) */
  meta?: Record<string, unknown>;
  dryRun?: boolean;
}

export interface CreateTaskAutomationInput {
  tenantId: string;
  name: string;
  todoListId?: string | null;
  enabled?: boolean;
  trigger: ITaskAutomationTrigger;
  conditions?: ITaskAutomationConditionGroup;
  actions: ITaskAutomationAction[];
  createdById?: string | null;
}

export interface UpdateTaskAutomationInput {
  name?: string;
  todoListId?: string | null;
  enabled?: boolean;
  trigger?: ITaskAutomationTrigger;
  conditions?: ITaskAutomationConditionGroup;
  actions?: ITaskAutomationAction[];
}

function isGroup(
  node: ITaskAutomationConditionRule | ITaskAutomationConditionGroup,
): node is ITaskAutomationConditionGroup {
  return Boolean(node && typeof node === 'object' && 'op' in node && 'rules' in node);
}

function fieldValue(task: ITask, field: string): unknown {
  const record = task as unknown as Record<string, unknown>;
  return record[field];
}

/** Pure condition evaluator — exported for unit tests. */
export function evaluateConditions(
  group: ITaskAutomationConditionGroup | null | undefined,
  task: ITask,
  previous?: ITask | null,
): boolean {
  if (!group || !Array.isArray(group.rules) || group.rules.length === 0) return true;
  const results = group.rules.map((rule) => {
    if (isGroup(rule)) return evaluateConditions(rule, task, previous);
    return evaluateRule(rule, task, previous);
  });
  return group.op === 'OR' ? results.some(Boolean) : results.every(Boolean);
}

function evaluateRule(rule: ITaskAutomationConditionRule, task: ITask, previous?: ITask | null): boolean {
  const current = fieldValue(task, rule.field);
  const prior = previous ? fieldValue(previous, rule.field) : undefined;
  switch (rule.operator) {
    case 'eq':
      return current === rule.value || String(current) === String(rule.value);
    case 'neq':
      return current !== rule.value && String(current) !== String(rule.value);
    case 'contains':
      return String(current ?? '')
        .toLowerCase()
        .includes(String(rule.value ?? '').toLowerCase());
    case 'gt':
      return Number(current) > Number(rule.value);
    case 'lt':
      return Number(current) < Number(rule.value);
    case 'empty':
      return current == null || current === '' || (Array.isArray(current) && current.length === 0);
    case 'not_empty':
      return !(current == null || current === '' || (Array.isArray(current) && current.length === 0));
    case 'changed':
      return previous != null && current !== prior;
    case 'changed_from':
      return previous != null && (prior === rule.value || String(prior) === String(rule.value));
    case 'changed_to':
      return previous != null && (current === rule.value || String(current) === String(rule.value));
    default:
      return false;
  }
}

function triggerMatches(automationTrigger: ITaskAutomationTrigger, event: TaskAutomationEvent): boolean {
  if (automationTrigger.type !== event.trigger) return false;
  if (event.trigger === 'task.status_changed') {
    if (automationTrigger.from && event.previous?.status !== automationTrigger.from) return false;
    if (automationTrigger.to && event.task.status !== automationTrigger.to) return false;
  }
  if ((event.trigger === 'task.overdue' || event.trigger === 'task.due_soon') && automationTrigger.hours != null) {
    const hours = Number(event.meta?.overdueHours ?? event.meta?.dueSoonHours ?? 0);
    if (hours < automationTrigger.hours) return false;
  }
  return true;
}

function interpolate(template: string, task: ITask): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = fieldValue(task, key);
    return v == null ? '' : String(v);
  });
}

export class TaskAutomationService {
  async list(tenantId: string, todoListId?: string | null): Promise<ITaskAutomation[]> {
    const query: Record<string, unknown> = { tenantId };
    if (todoListId) query.todoListId = todoListId;
    return TaskAutomation.find(query).sort({ updatedAt: -1 });
  }

  async getById(id: string, tenantId: string): Promise<ITaskAutomation | null> {
    return TaskAutomation.findOne({ _id: id, tenantId });
  }

  async listExecutions(automationId: string, tenantId: string, limit = 50): Promise<ITaskAutomationExecution[]> {
    return TaskAutomationExecution.find({ tenantId, automationId })
      .sort({ createdAt: -1 })
      .limit(Math.min(100, Math.max(1, limit)));
  }

  async create(input: CreateTaskAutomationInput): Promise<ITaskAutomation> {
    const name = input.name?.trim();
    if (!name) {
      throw new GraphQLError('Automation name is required', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    if (!input.trigger?.type) {
      throw new GraphQLError('Trigger type is required', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    if (!Array.isArray(input.actions) || input.actions.length === 0) {
      throw new GraphQLError('At least one action is required', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    return TaskAutomation.create({
      tenantId: input.tenantId,
      todoListId: input.todoListId ?? null,
      name,
      enabled: input.enabled !== false,
      trigger: input.trigger,
      conditions: input.conditions ?? { op: 'AND', rules: [] },
      actions: input.actions,
      createdById: input.createdById ?? null,
    });
  }

  async update(id: string, tenantId: string, input: UpdateTaskAutomationInput): Promise<ITaskAutomation | null> {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    const $set: Record<string, unknown> = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new GraphQLError('Automation name cannot be empty', { extensions: { code: 'BAD_USER_INPUT' } });
      $set.name = name;
    }
    if (input.todoListId !== undefined) $set.todoListId = input.todoListId;
    if (input.enabled !== undefined) $set.enabled = input.enabled;
    if (input.trigger !== undefined) $set.trigger = input.trigger;
    if (input.conditions !== undefined) $set.conditions = input.conditions;
    if (input.actions !== undefined) {
      if (!input.actions.length) {
        throw new GraphQLError('At least one action is required', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      $set.actions = input.actions;
    }
    return TaskAutomation.findOneAndUpdate({ _id: id, tenantId }, { $set }, { new: true });
  }

  async setEnabled(id: string, tenantId: string, enabled: boolean): Promise<ITaskAutomation | null> {
    return this.update(id, tenantId, { enabled });
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await TaskAutomation.findOneAndDelete({ _id: id, tenantId });
    return Boolean(result);
  }

  /** Dry-run against a sample task — no side effects. */
  async test(id: string, tenantId: string, sampleTaskId: string): Promise<ITaskAutomationExecution> {
    const automation = await this.getById(id, tenantId);
    if (!automation) {
      throw new GraphQLError('Automation not found', { extensions: { code: 'NOT_FOUND' } });
    }
    const task = await Task.findOne({ _id: sampleTaskId, tenantId });
    if (!task) {
      throw new GraphQLError('Sample task not found', { extensions: { code: 'NOT_FOUND' } });
    }
    const event: TaskAutomationEvent = {
      tenantId,
      trigger: automation.trigger.type,
      task,
      dryRun: true,
      occurrenceBucket: `test:${Date.now()}`,
    };
    return this.runAutomation(automation, event);
  }

  /**
   * Dispatch domain event to matching enabled automations.
   * Safe to fire-and-forget from resolvers.
   */
  async dispatch(event: TaskAutomationEvent): Promise<{ matched: number; ran: number; skipped: number }> {
    const automations = await TaskAutomation.find({
      tenantId: event.tenantId,
      enabled: true,
      'trigger.type': event.trigger,
    });
    let ran = 0;
    let skipped = 0;
    for (const automation of automations) {
      if (automation.todoListId && automation.todoListId !== event.task.todoListId) {
        skipped += 1;
        continue;
      }
      if (!triggerMatches(automation.trigger, event)) {
        skipped += 1;
        continue;
      }
      if (!evaluateConditions(automation.conditions, event.task, event.previous)) {
        skipped += 1;
        continue;
      }
      try {
        await this.runAutomation(automation, event);
        ran += 1;
      } catch (err) {
        logger.error('Task automation failed', {
          automationId: automation._id.toString(),
          taskId: event.task._id.toString(),
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return { matched: automations.length, ran, skipped };
  }

  /** Emit update-derived triggers after a successful task update. */
  async dispatchFromUpdate(previous: ITask, updated: ITask, tenantId: string): Promise<void> {
    await this.dispatch({
      tenantId,
      trigger: 'task.updated',
      task: updated,
      previous,
      occurrenceBucket: `upd:${updated.updatedAt?.toISOString?.() ?? Date.now()}`,
    });
    if (previous.status !== updated.status) {
      await this.dispatch({
        tenantId,
        trigger: 'task.status_changed',
        task: updated,
        previous,
        occurrenceBucket: `status:${previous.status}->${updated.status}:${updated.updatedAt?.toISOString?.() ?? ''}`,
      });
      if (updated.status === 'COMPLETED' || updated.status === 'DONE') {
        await this.dispatch({
          tenantId,
          trigger: 'task.completed',
          task: updated,
          previous,
          occurrenceBucket: `completed:${updated.updatedAt?.toISOString?.() ?? Date.now()}`,
        });
      }
    }
    if (previous.assigneeId !== updated.assigneeId && updated.assigneeId) {
      await this.dispatch({
        tenantId,
        trigger: 'task.assigned',
        task: updated,
        previous,
        occurrenceBucket: `assign:${updated.assigneeId}:${updated.updatedAt?.toISOString?.() ?? ''}`,
      });
    }
  }

  /** Scheduler: due soon / overdue → emit triggers (idempotent per day bucket). */
  async processScheduledTriggers(tenantId?: string): Promise<{ dueSoon: number; overdue: number }> {
    const now = new Date();
    const dayBucket = now.toISOString().slice(0, 10);
    const query: Record<string, unknown> = {
      dueDate: { $ne: null },
      status: { $in: ['DRAFT', 'OPEN', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'READY_FOR_REVIEW'] },
    };
    if (tenantId) query.tenantId = tenantId;

    const tasks = await Task.find(query).limit(500);
    let dueSoon = 0;
    let overdue = 0;

    for (const task of tasks) {
      if (!task.dueDate) continue;
      const ms = task.dueDate.getTime() - now.getTime();
      const hoursUntil = ms / (60 * 60 * 1000);
      if (hoursUntil < 0) {
        const overdueHours = Math.abs(hoursUntil);
        await this.dispatch({
          tenantId: task.tenantId,
          trigger: 'task.overdue',
          task,
          occurrenceBucket: `overdue:${dayBucket}`,
          meta: { overdueHours },
        });
        overdue += 1;
      } else if (hoursUntil <= 24) {
        await this.dispatch({
          tenantId: task.tenantId,
          trigger: 'task.due_soon',
          task,
          occurrenceBucket: `duesoon:${dayBucket}`,
          meta: { dueSoonHours: hoursUntil },
        });
        dueSoon += 1;
      }
    }

    return { dueSoon, overdue };
  }

  private buildIdempotencyKey(automationId: string, event: TaskAutomationEvent): string {
    const taskId = event.task._id.toString();
    const bucket = event.occurrenceBucket ?? event.trigger;
    return `${event.tenantId}:${automationId}:${taskId}:${event.trigger}:${bucket}`;
  }

  private async runAutomation(
    automation: ITaskAutomation,
    event: TaskAutomationEvent,
  ): Promise<ITaskAutomationExecution> {
    const automationId = automation._id.toString();
    const idempotencyKey = this.buildIdempotencyKey(automationId, event);
    const startedAt = new Date();

    if (!event.dryRun) {
      const existing = await TaskAutomationExecution.findOne({
        tenantId: event.tenantId,
        idempotencyKey,
      });
      if (existing) return existing;
    }

    let execution: ITaskAutomationExecution;
    try {
      execution = await TaskAutomationExecution.create({
        tenantId: event.tenantId,
        automationId,
        taskId: event.task._id.toString(),
        triggerType: event.trigger,
        status: event.dryRun ? 'tested' : 'running',
        idempotencyKey: event.dryRun ? `${idempotencyKey}:dry:${startedAt.getTime()}` : idempotencyKey,
        steps: [],
        startedAt,
        finishedAt: null,
      });
    } catch (err: unknown) {
      // Unique index race — treat as idempotent replay
      const code = (err as { code?: number })?.code;
      if (code === 11000) {
        const replay = await TaskAutomationExecution.findOne({ tenantId: event.tenantId, idempotencyKey });
        if (replay) return replay;
      }
      throw err;
    }

    const steps: ITaskAutomationExecutionStep[] = [];
    let failed: string | null = null;

    for (const action of automation.actions || []) {
      try {
        const step = await this.executeAction(action, event);
        steps.push(step);
        if (!step.ok) {
          failed = step.detail || 'Action failed';
          break;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        steps.push({ actionType: action.type, ok: false, detail: message, dryRun: event.dryRun });
        failed = message;
        break;
      }
    }

    const finishedAt = new Date();
    const status = event.dryRun ? 'tested' : failed ? 'failed' : 'completed';
    const updated = await TaskAutomationExecution.findOneAndUpdate(
      { _id: execution._id },
      { $set: { steps, status, error: failed, finishedAt } },
      { new: true },
    );

    if (!event.dryRun) {
      await todoService.recordActivity({
        tenantId: event.tenantId,
        taskId: event.task._id.toString(),
        message: failed
          ? `Automation "${automation.name}" failed: ${failed}`
          : `Automation "${automation.name}" ran (${event.trigger})`,
        source: 'system',
        field: 'automation',
      });
    }

    return updated ?? execution;
  }

  private async executeAction(
    action: ITaskAutomationAction,
    event: TaskAutomationEvent,
  ): Promise<ITaskAutomationExecutionStep> {
    const dryRun = Boolean(event.dryRun);
    const cfg = action.config ?? {};
    const taskId = event.task._id.toString();
    const tenantId = event.tenantId;

    switch (action.type) {
      case 'update_task': {
        if (dryRun) return { actionType: action.type, ok: true, detail: 'dry-run update_task', dryRun };
        const patch: Record<string, unknown> = {};
        for (const key of ['title', 'notes', 'priority', 'teamId', 'assigneeId', 'timezone'] as const) {
          if (cfg[key] !== undefined) patch[key] = cfg[key];
        }
        await todoService.update(taskId, tenantId, patch as never, { id: null, name: 'automation' });
        return { actionType: action.type, ok: true, detail: 'task updated' };
      }
      case 'assign_task': {
        const assigneeId = String(cfg.assigneeId ?? '');
        if (!assigneeId) return { actionType: action.type, ok: false, detail: 'assigneeId required' };
        if (dryRun) return { actionType: action.type, ok: true, detail: `dry-run assign ${assigneeId}`, dryRun };
        await todoService.update(taskId, tenantId, { assigneeId }, { id: null, name: 'automation' });
        return { actionType: action.type, ok: true, detail: `assigned ${assigneeId}` };
      }
      case 'set_status': {
        const status = cfg.status as TaskStatus;
        if (!status) return { actionType: action.type, ok: false, detail: 'status required' };
        if (dryRun) return { actionType: action.type, ok: true, detail: `dry-run set_status ${status}`, dryRun };
        await todoService.update(taskId, tenantId, { status }, { id: null, name: 'automation' });
        return { actionType: action.type, ok: true, detail: `status ${status}` };
      }
      case 'set_priority': {
        const priority = cfg.priority as TaskPriority;
        if (!priority) return { actionType: action.type, ok: false, detail: 'priority required' };
        if (dryRun) return { actionType: action.type, ok: true, detail: `dry-run set_priority ${priority}`, dryRun };
        await todoService.update(taskId, tenantId, { priority }, { id: null, name: 'automation' });
        return { actionType: action.type, ok: true, detail: `priority ${priority}` };
      }
      case 'set_due': {
        const dueDate = cfg.dueDate as string | null | undefined;
        if (dryRun) return { actionType: action.type, ok: true, detail: 'dry-run set_due', dryRun };
        await todoService.update(taskId, tenantId, { dueDate: dueDate ?? null }, { id: null, name: 'automation' });
        return { actionType: action.type, ok: true, detail: 'due date set' };
      }
      case 'create_task':
      case 'create_subtask': {
        const titleRaw = String(cfg.title ?? 'Follow-up: {{title}}');
        const title = interpolate(titleRaw, event.task);
        if (dryRun) return { actionType: action.type, ok: true, detail: `dry-run create "${title}"`, dryRun };
        const created = await todoService.create({
          tenantId,
          todoListId: event.task.todoListId,
          title,
          notes: cfg.notes != null ? interpolate(String(cfg.notes), event.task) : null,
          priority: (cfg.priority as TaskPriority) ?? event.task.priority,
          assigneeId: (cfg.assigneeId as string) ?? event.task.assigneeId ?? null,
          createdById: null,
        });
        return { actionType: action.type, ok: true, detail: `created ${created._id.toString()}` };
      }
      case 'add_comment': {
        const message = interpolate(String(cfg.message ?? 'Automation note'), event.task);
        if (dryRun) return { actionType: action.type, ok: true, detail: `dry-run comment: ${message}`, dryRun };
        await todoService.recordActivity({
          tenantId,
          taskId,
          message,
          source: 'system',
          field: 'comment',
        });
        return { actionType: action.type, ok: true, detail: 'comment added' };
      }
      case 'notify_user': {
        const userId = String(cfg.userId ?? event.task.assigneeId ?? '');
        if (!userId) return { actionType: action.type, ok: false, detail: 'userId or assignee required' };
        const title = interpolate(String(cfg.title ?? 'Task update'), event.task);
        const body = interpolate(String(cfg.body ?? event.task.title), event.task);
        if (dryRun) return { actionType: action.type, ok: true, detail: `dry-run notify ${userId}`, dryRun };
        await AppNotification.create({
          tenantId,
          userId,
          category: 'automation',
          title,
          body,
          taskId,
          metadata: { automation: true },
        });
        return { actionType: action.type, ok: true, detail: `notified ${userId}` };
      }
      case 'notify_team': {
        const userIds = Array.isArray(cfg.userIds) ? (cfg.userIds as string[]) : [];
        if (!userIds.length) return { actionType: action.type, ok: false, detail: 'userIds required' };
        if (dryRun)
          return { actionType: action.type, ok: true, detail: `dry-run notify_team ${userIds.length}`, dryRun };
        const title = interpolate(String(cfg.title ?? 'Team task update'), event.task);
        const body = interpolate(String(cfg.body ?? event.task.title), event.task);
        for (const userId of userIds) {
          await AppNotification.create({
            tenantId,
            userId,
            category: 'automation',
            title,
            body,
            taskId,
            metadata: { automation: true },
          });
        }
        return { actionType: action.type, ok: true, detail: `notified ${userIds.length} users` };
      }
      default:
        return { actionType: action.type, ok: false, detail: `Unknown action ${(action as { type: string }).type}` };
    }
  }

  toGraphQL(doc: ITaskAutomation) {
    return {
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      todoListId: doc.todoListId ?? null,
      name: doc.name,
      enabled: doc.enabled,
      trigger: doc.trigger,
      conditions: doc.conditions,
      actions: doc.actions,
      createdById: doc.createdById ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  executionToGraphQL(doc: ITaskAutomationExecution) {
    return {
      id: doc._id.toString(),
      automationId: doc.automationId,
      taskId: doc.taskId,
      triggerType: doc.triggerType,
      status: doc.status,
      steps: doc.steps,
      error: doc.error ?? null,
      startedAt: doc.startedAt,
      finishedAt: doc.finishedAt ?? null,
      createdAt: doc.createdAt,
    };
  }
}

export const taskAutomationService = new TaskAutomationService();

/** Guard: avoid re-entrant automation loops when actions update the same task. */
let dispatchDepth = 0;
export async function safeDispatch(event: TaskAutomationEvent): Promise<void> {
  if (dispatchDepth >= 3) {
    logger.warn('Task automation dispatch depth exceeded — skipping', { trigger: event.trigger });
    return;
  }
  dispatchDepth += 1;
  try {
    await taskAutomationService.dispatch(event);
  } finally {
    dispatchDepth -= 1;
  }
}

export async function safeDispatchFromUpdate(previous: ITask, updated: ITask, tenantId: string): Promise<void> {
  if (dispatchDepth >= 3) return;
  dispatchDepth += 1;
  try {
    await taskAutomationService.dispatchFromUpdate(previous, updated, tenantId);
  } finally {
    dispatchDepth -= 1;
  }
}
