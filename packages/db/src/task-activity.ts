import { Schema, model, Document } from 'mongoose';

/** Append-only activity for Todo engine tasks (Phase 1). Separate from commerce ActivityEvent. */
export interface ITaskActivity extends Document {
  tenantId: string;
  taskId: string;
  message: string;
  actorId?: string | null;
  actorName?: string | null;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  source: 'user' | 'system';
  createdAt: Date;
}

const taskActivitySchema = new Schema<ITaskActivity>(
  {
    tenantId: { type: String, required: true, index: true },
    taskId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    actorId: { type: String, default: null },
    actorName: { type: String, default: null },
    field: { type: String, default: null },
    oldValue: { type: String, default: null },
    newValue: { type: String, default: null },
    source: { type: String, enum: ['user', 'system'], default: 'user' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

taskActivitySchema.index({ tenantId: 1, taskId: 1, createdAt: -1 });

export const TaskActivity = model<ITaskActivity>('TaskActivity', taskActivitySchema);
