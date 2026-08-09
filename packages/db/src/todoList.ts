import { Schema, model, Document } from 'mongoose';

/** A named, tenant-scoped container of Tasks (packages/db/src/task.ts). Lets a tenant keep
 * several independent todo lists (e.g. "Work", "Personal", "Launch checklist") instead of one
 * global list — the Todo List hub page (apps/web/pages/todo.tsx) shows these as cards; opening
 * one loads apps/web/pages/todo/[id].tsx scoped to that list's tasks via Task.todoListId. */
export interface ITodoList extends Document {
  tenantId: string;
  name: string;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const todoListSchema = new Schema<ITodoList>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    createdById: { type: String, default: null },
  },
  { timestamps: true },
);

todoListSchema.index({ tenantId: 1, createdAt: 1 });

export const TodoList = model<ITodoList>('TodoList', todoListSchema);
