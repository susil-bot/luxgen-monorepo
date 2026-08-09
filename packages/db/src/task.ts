import { Schema, model, Document } from 'mongoose';

/** Lightweight personal/team todo item — deliberately separate from ProjectItem
 * (packages/db/src/project-item.ts), which is a heavier sprint/kanban tracker with
 * iteration/priority/estimate/courseId fields that don't apply here. Composition over
 * inheritance: same tenant-scoped/timestamps/sortOrder conventions, own collection. */
export type TaskStatus = 'TODO' | 'DONE';

export const TASK_STATUSES: TaskStatus[] = ['TODO', 'DONE'];

export interface ITask extends Document {
  tenantId: string;
  title: string;
  notes?: string | null;
  status: TaskStatus;
  sortOrder: number;
  dueDate?: Date | null;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    tenantId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: null },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'TODO',
      index: true,
    },
    sortOrder: { type: Number, default: 0 },
    dueDate: { type: Date, default: null },
    createdById: { type: String, default: null },
  },
  { timestamps: true },
);

taskSchema.index({ tenantId: 1, status: 1, sortOrder: 1 });

export const Task = model<ITask>('Task', taskSchema);
