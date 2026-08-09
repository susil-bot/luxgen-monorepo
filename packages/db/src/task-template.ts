import { Schema, model, Document } from 'mongoose';
import { randomBytes } from 'crypto';

export type TaskFieldType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multi'
  | 'person'
  | 'team'
  | 'file'
  | 'url'
  | 'checkbox'
  | 'richtext';

export const TASK_FIELD_TYPES: TaskFieldType[] = [
  'text',
  'number',
  'currency',
  'date',
  'datetime',
  'select',
  'multi',
  'person',
  'team',
  'file',
  'url',
  'checkbox',
  'richtext',
];

export interface ITaskFieldDefinition {
  /** Stable id within the template (not a Mongo _id). */
  id: string;
  name: string;
  type: TaskFieldType;
  required: boolean;
  options?: string[];
  helpText?: string | null;
}

export interface ITaskTemplate extends Document {
  tenantId: string;
  teamId?: string | null;
  name: string;
  description?: string | null;
  fields: ITaskFieldDefinition[];
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskTemplateSchema = new Schema<ITaskTemplate>(
  {
    tenantId: { type: String, required: true, index: true },
    teamId: { type: String, default: null, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    /** Embedded field definitions (ITaskFieldDefinition[]). Mixed avoids mongoose array TS baseline noise. */
    fields: { type: Schema.Types.Mixed, default: [] },
    createdById: { type: String, default: null },
  },
  { timestamps: true },
);

taskTemplateSchema.index({ tenantId: 1, teamId: 1, name: 1 });

export const TaskTemplate = model<ITaskTemplate>('TaskTemplate', taskTemplateSchema);

export function newFieldDefinitionId(): string {
  return randomBytes(8).toString('hex');
}
