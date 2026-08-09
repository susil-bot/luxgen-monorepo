import { Schema, model, Document } from 'mongoose';

/** Reminder offset relative to task due date (Phase 2). Null/custom ⇒ absolute `fireAt`. */
export type ReminderOffsetPreset = 'M5' | 'M15' | 'M30' | 'H1' | 'D1' | 'W1' | 'CUSTOM';

export const REMINDER_OFFSET_PRESETS: ReminderOffsetPreset[] = ['M5', 'M15', 'M30', 'H1', 'D1', 'W1', 'CUSTOM'];

export type ReminderStatus = 'scheduled' | 'fired' | 'snoozed' | 'cancelled';

export const REMINDER_STATUSES: ReminderStatus[] = ['scheduled', 'fired', 'snoozed', 'cancelled'];

export type ReminderChannel = 'in_app' | 'email' | 'push';

export interface ITaskReminder extends Document {
  tenantId: string;
  taskId: string;
  /** UTC fire time (or next fire after snooze). */
  fireAt: Date;
  offsetPreset?: ReminderOffsetPreset | null;
  channelPrefs: ReminderChannel[];
  status: ReminderStatus;
  snoozeUntil?: Date | null;
  lastFiredAt?: Date | null;
  /** Unique per successful fire — prevents duplicate notifications on job retry. */
  lastIdempotencyKey?: string | null;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskReminderSchema = new Schema<ITaskReminder>(
  {
    tenantId: { type: String, required: true, index: true },
    taskId: { type: String, required: true, index: true },
    fireAt: { type: Date, required: true, index: true },
    offsetPreset: { type: String, enum: REMINDER_OFFSET_PRESETS, default: 'CUSTOM' },
    channelPrefs: { type: Schema.Types.Mixed, default: ['in_app'] },
    status: {
      type: String,
      enum: REMINDER_STATUSES,
      default: 'scheduled',
      index: true,
    },
    snoozeUntil: { type: Date, default: null },
    lastFiredAt: { type: Date, default: null },
    lastIdempotencyKey: { type: String, default: null },
    createdById: { type: String, default: null },
  },
  { timestamps: true },
);

taskReminderSchema.index({ tenantId: 1, status: 1, fireAt: 1 });
taskReminderSchema.index({ tenantId: 1, lastIdempotencyKey: 1 });

export const TaskReminder = model<ITaskReminder>('TaskReminder', taskReminderSchema);

const PRESET_MS: Record<Exclude<ReminderOffsetPreset, 'CUSTOM'>, number> = {
  M5: 5 * 60 * 1000,
  M15: 15 * 60 * 1000,
  M30: 30 * 60 * 1000,
  H1: 60 * 60 * 1000,
  D1: 24 * 60 * 60 * 1000,
  W1: 7 * 24 * 60 * 60 * 1000,
};

/** Compute UTC fireAt from due date + preset. CUSTOM requires explicit fireAt. */
export function fireAtFromDueAndPreset(dueDate: Date, preset: ReminderOffsetPreset): Date | null {
  if (preset === 'CUSTOM') return null;
  return new Date(dueDate.getTime() - PRESET_MS[preset]);
}
