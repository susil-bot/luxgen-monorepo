import { Schema, model, Document } from 'mongoose';

export interface ITaskFieldValue extends Document {
  tenantId: string;
  taskId: string;
  fieldDefinitionId: string;
  /** JSON-compatible value for the field type. */
  value: unknown;
  updatedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskFieldValueSchema = new Schema<ITaskFieldValue>(
  {
    tenantId: { type: String, required: true, index: true },
    taskId: { type: String, required: true, index: true },
    fieldDefinitionId: { type: String, required: true },
    value: { type: Schema.Types.Mixed, default: null },
    updatedById: { type: String, default: null },
  },
  { timestamps: true },
);

taskFieldValueSchema.index({ tenantId: 1, taskId: 1, fieldDefinitionId: 1 }, { unique: true } as never);

export const TaskFieldValue = model<ITaskFieldValue>('TaskFieldValue', taskFieldValueSchema);

/** Whether a required field value counts as filled for completion gating. */
export function isTaskFieldValueFilled(type: string, value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (type === 'checkbox') return value === true;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return !Number.isNaN(value);
  if (typeof value === 'boolean') return true;
  return true;
}
