import { Schema, model, Document } from 'mongoose';

/**
 * Todo engine Task — Phase 1 enrichment (docs/todo-engine/).
 * Deliberately separate from ProjectItem (sprint board).
 *
 * Legacy aliases: TODO ≈ open work, DONE ≈ completed. Prefer OPEN / COMPLETED for new writes.
 */
export type TaskStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'READY_FOR_REVIEW'
  | 'COMPLETED'
  | 'DONE'
  | 'CANCELLED'
  | 'ARCHIVED';

export const TASK_STATUSES: TaskStatus[] = [
  'DRAFT',
  'OPEN',
  'TODO',
  'IN_PROGRESS',
  'BLOCKED',
  'READY_FOR_REVIEW',
  'COMPLETED',
  'DONE',
  'CANCELLED',
  'ARCHIVED',
];

export const TASK_OPEN_STATUSES: TaskStatus[] = ['DRAFT', 'OPEN', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'READY_FOR_REVIEW'];

export const TASK_DONE_STATUSES: TaskStatus[] = ['COMPLETED', 'DONE', 'CANCELLED', 'ARCHIVED'];

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function isTaskOpenStatus(status: TaskStatus): boolean {
  return TASK_OPEN_STATUSES.includes(status);
}

export function normalizeTaskStatus(status: TaskStatus): TaskStatus {
  if (status === 'TODO') return 'OPEN';
  if (status === 'DONE') return 'COMPLETED';
  return status;
}

export interface ITask extends Document {
  tenantId: string;
  todoListId: string;
  title: string;
  notes?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  sortOrder: number;
  teamId?: string | null;
  assigneeId?: string | null;
  followerIds: string[];
  startDate?: Date | null;
  dueDate?: Date | null;
  timezone?: string | null;
  completedAt?: Date | null;
  /** Phase 3 — optional blueprint for required fields. */
  templateId?: string | null;
  /** Phase 4 — recurrence series root id (usually template task id). */
  seriesId?: string | null;
  /** Phase 4 — unique per series occurrence, e.g. 2026-08-10. */
  occurrenceKey?: string | null;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    tenantId: { type: String, required: true, index: true },
    todoListId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: null },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'OPEN',
      index: true,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'MEDIUM',
    },
    sortOrder: { type: Number, default: 0 },
    teamId: { type: String, default: null, index: true },
    assigneeId: { type: String, default: null, index: true },
    followerIds: { type: Schema.Types.Mixed, default: [] },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    timezone: { type: String, default: null },
    completedAt: { type: Date, default: null },
    templateId: { type: String, default: null, index: true },
    seriesId: { type: String, default: null, index: true },
    occurrenceKey: { type: String, default: null },
    createdById: { type: String, default: null },
  },
  { timestamps: true },
);

taskSchema.index({ tenantId: 1, todoListId: 1, status: 1, sortOrder: 1 });
taskSchema.index({ tenantId: 1, dueDate: 1 });
taskSchema.index({ tenantId: 1, assigneeId: 1, status: 1 });
taskSchema.index({ tenantId: 1, seriesId: 1, occurrenceKey: 1 }, { unique: true, sparse: true } as never);

export const Task = model<ITask>('Task', taskSchema);
