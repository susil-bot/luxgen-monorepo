import { Schema, model, Document } from 'mongoose';

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ICourseCommerce {
  priceCents?: number;
  compareAtPriceCents?: number;
  sku?: string;
  category?: string;
  currency?: string;
}

export interface ICourse extends Document {
  title: string;
  description?: string;
  instructor: Schema.Types.ObjectId;
  students: Schema.Types.ObjectId[];
  tenant: Schema.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  status: CourseStatus;
  commerce?: ICourseCommerce;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
    },
    commerce: {
      priceCents: { type: Number, min: 0 },
      compareAtPriceCents: { type: Number, min: 0 },
      sku: { type: String, trim: true },
      category: { type: String, trim: true },
      currency: { type: String, trim: true, default: 'usd' },
    },
  },
  {
    timestamps: true,
  },
);

courseSchema.index({ tenant: 1, status: 1 });
courseSchema.index({ tenant: 1 });
courseSchema.index({ instructor: 1 });

export const Course = model<ICourse>('Course', courseSchema);
