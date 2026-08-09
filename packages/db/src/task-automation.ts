import { Schema, model, Document } from 'mongoose';

/** Domain triggers evaluated by taskAutomationService (Phase 5). */
export type TaskAutomationTriggerType =
  | 'task.created'
  | 'task.updated'
  | 'task.assigned'
  | 'task.status_changed'
  | 'task.completed'
  | 'task.due_soon'
  | 'task.overdue'
  | 'task.reminder_triggered';

export const TASK_AUTOMATION_TRIGGER_TYPES: TaskAutomationTriggerType[] = [
  'task.created',
  'task.updated',
  'task.assigned',
  'task.status_changed',
  'task.completed',
  'task.due_soon',
  'task.overdue',
  'task.reminder_triggered',
];

export type TaskAutomationExecutionStatus = 'running' | 'completed' | 'failed' | 'tested' | 'skipped';

export const TASK_AUTOMATION_EXECUTION_STATUSES: TaskAutomationExecutionStatus[] = [
  'running',
  'completed',
  'failed',
  'tested',
  'skipped',
];

export interface ITaskAutomationTrigger {
  type: TaskAutomationTriggerType;
  /** Optional filters for status_changed */
  from?: string | null;
  to?: string | null;
  /** Hours overdue / until due for scheduled triggers */
  hours?: number | null;
}

export interface ITaskAutomationConditionRule {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt' | 'empty' | 'not_empty' | 'changed' | 'changed_from' | 'changed_to';
  value?: unknown;
}

export interface ITaskAutomationConditionGroup {
  op: 'AND' | 'OR';
  rules: Array<ITaskAutomationConditionRule | ITaskAutomationConditionGroup>;
}

export interface ITaskAutomationAction {
  type:
    | 'update_task'
    | 'assign_task'
    | 'set_status'
    | 'set_priority'
    | 'set_due'
    | 'create_task'
    | 'create_subtask'
    | 'add_comment'
    | 'notify_user'
    | 'notify_team';
  config?: Record<string, unknown>;
}

export interface ITaskAutomation extends Document {
  tenantId: string;
  todoListId?: string | null;
  name: string;
  enabled: boolean;
  trigger: ITaskAutomationTrigger;
  conditions: ITaskAutomationConditionGroup;
  actions: ITaskAutomationAction[];
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskAutomationExecutionStep {
  actionType: string;
  ok: boolean;
  detail?: string;
  dryRun?: boolean;
}

export interface ITaskAutomationExecution extends Document {
  tenantId: string;
  automationId: string;
  taskId: string;
  triggerType: string;
  status: TaskAutomationExecutionStatus;
  idempotencyKey: string;
  steps: ITaskAutomationExecutionStep[];
  error?: string | null;
  startedAt: Date;
  finishedAt?: Date | null;
  createdAt: Date;
}

const taskAutomationSchema = new Schema<ITaskAutomation>(
  {
    tenantId: { type: String, required: true, index: true },
    todoListId: { type: String, default: null, index: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true, index: true },
    trigger: { type: Schema.Types.Mixed, required: true },
    conditions: { type: Schema.Types.Mixed, default: { op: 'AND', rules: [] } },
    actions: { type: Schema.Types.Mixed, default: [] },
    createdById: { type: String, default: null },
  },
  { timestamps: true },
);

taskAutomationSchema.index({ tenantId: 1, enabled: 1 });
taskAutomationSchema.index({ tenantId: 1, 'trigger.type': 1, enabled: 1 });

export const TaskAutomation = model<ITaskAutomation>('TaskAutomation', taskAutomationSchema);

const taskAutomationExecutionSchema = new Schema<ITaskAutomationExecution>(
  {
    tenantId: { type: String, required: true, index: true },
    automationId: { type: String, required: true, index: true },
    taskId: { type: String, required: true, index: true },
    triggerType: { type: String, required: true },
    status: {
      type: String,
      enum: TASK_AUTOMATION_EXECUTION_STATUSES,
      default: 'running',
      index: true,
    },
    idempotencyKey: { type: String, required: true },
    steps: { type: Schema.Types.Mixed, default: [] },
    error: { type: String, default: null },
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

taskAutomationExecutionSchema.index({ tenantId: 1, idempotencyKey: 1 }, { unique: true });
taskAutomationExecutionSchema.index({ tenantId: 1, automationId: 1, createdAt: -1 });

export const TaskAutomationExecution = model<ITaskAutomationExecution>(
  'TaskAutomationExecution',
  taskAutomationExecutionSchema,
);
