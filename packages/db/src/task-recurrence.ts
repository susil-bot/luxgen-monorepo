import { Schema, model, Document } from 'mongoose';

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export const RECURRENCE_FREQUENCIES: RecurrenceFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

/** What to do when the previous occurrence is still open. */
export type IncompleteOccurrenceBehavior = 'create_anyway' | 'skip' | 'after_complete';

export const INCOMPLETE_OCCURRENCE_BEHAVIORS: IncompleteOccurrenceBehavior[] = [
  'create_anyway',
  'skip',
  'after_complete',
];

export interface ITaskRecurrenceRule extends Document {
  tenantId: string;
  /** Series root / template task. */
  taskId: string;
  seriesId: string;
  frequency: RecurrenceFrequency;
  interval: number;
  incompleteBehavior: IncompleteOccurrenceBehavior;
  timezone: string;
  nextFireAt: Date;
  enabled: boolean;
  endAt?: Date | null;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskRecurrenceRuleSchema = new Schema<ITaskRecurrenceRule>(
  {
    tenantId: { type: String, required: true, index: true },
    taskId: { type: String, required: true, index: true },
    seriesId: { type: String, required: true, index: true },
    frequency: { type: String, enum: RECURRENCE_FREQUENCIES, required: true },
    interval: { type: Number, default: 1, min: 1 },
    incompleteBehavior: {
      type: String,
      enum: INCOMPLETE_OCCURRENCE_BEHAVIORS,
      default: 'create_anyway',
    },
    timezone: { type: String, default: 'UTC' },
    nextFireAt: { type: Date, required: true, index: true },
    enabled: { type: Boolean, default: true, index: true },
    endAt: { type: Date, default: null },
    createdById: { type: String, default: null },
  },
  { timestamps: true },
);

taskRecurrenceRuleSchema.index({ tenantId: 1, enabled: 1, nextFireAt: 1 });
taskRecurrenceRuleSchema.index({ tenantId: 1, seriesId: 1 });

export const TaskRecurrenceRule = model<ITaskRecurrenceRule>('TaskRecurrenceRule', taskRecurrenceRuleSchema);

/** UTC occurrence key YYYY-MM-DD from a fire instant. */
export function occurrenceKeyFromDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Advance nextFireAt by frequency × interval (calendar-ish UTC). */
export function advanceRecurrenceFireAt(from: Date, frequency: RecurrenceFrequency, interval: number): Date {
  const n = Math.max(1, interval || 1);
  const next = new Date(from.getTime());
  switch (frequency) {
    case 'DAILY':
      next.setUTCDate(next.getUTCDate() + n);
      break;
    case 'WEEKLY':
      next.setUTCDate(next.getUTCDate() + 7 * n);
      break;
    case 'MONTHLY':
      next.setUTCMonth(next.getUTCMonth() + n);
      break;
    case 'YEARLY':
      next.setUTCFullYear(next.getUTCFullYear() + n);
      break;
    default:
      next.setUTCDate(next.getUTCDate() + n);
  }
  return next;
}
