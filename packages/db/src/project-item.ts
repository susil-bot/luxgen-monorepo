import { Schema, model, Document, Types } from 'mongoose';

export type ProjectItemStatus = 'BACKLOG' | 'READY' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type ProjectItemIteration = 'CURRENT' | 'NEXT';

export type ProjectItemPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface IProjectItem extends Document {
  tenantId: string;
  title: string;
  description?: string;
  status: ProjectItemStatus;
  iteration: ProjectItemIteration;
  priority: ProjectItemPriority;
  assigneeName?: string;
  assigneeId?: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  estimate?: number;
  labels: string[];
  courseId?: Types.ObjectId;
  sortOrder: number;
  createdById?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectItemSchema = new Schema<IProjectItem>(
  {
    tenantId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['BACKLOG', 'READY', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
      default: 'BACKLOG',
      index: true,
    },
    iteration: {
      type: String,
      enum: ['CURRENT', 'NEXT'],
      default: 'CURRENT',
      index: true,
    },
    priority: {
      type: String,
      enum: ['P0', 'P1', 'P2', 'P3'],
      default: 'P2',
    },
    assigneeName: { type: String },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date },
    endDate: { type: Date },
    estimate: { type: Number, min: 0 },
    labels: { type: [String], default: [] },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    sortOrder: { type: Number, default: 0 },
    createdById: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

projectItemSchema.index({ tenantId: 1, iteration: 1, status: 1, sortOrder: 1 });

export const ProjectItem = model<IProjectItem>('ProjectItem', projectItemSchema);
