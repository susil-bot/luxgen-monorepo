import { Schema, Document } from 'mongoose';
export declare enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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
  createdAt: Date;
  updatedAt: Date;
}
export declare const Course: import('mongoose').Model<
  ICourse,
  {},
  {},
  {},
  Document<unknown, {}, ICourse> &
    ICourse & {
      _id: import('mongoose').Types.ObjectId;
    },
  any
>;
