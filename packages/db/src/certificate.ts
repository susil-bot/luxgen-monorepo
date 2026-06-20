import { Schema, model, Document, Types } from 'mongoose';

export interface ICertificate extends Document {
  tenant: Types.ObjectId;
  course: Types.ObjectId;
  student: Types.ObjectId;
  enrollment: Types.ObjectId;
  courseTitle: string;
  studentName: string;
  certificateNumber: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    enrollment: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    courseTitle: { type: String, required: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    certificateNumber: { type: String, required: true, unique: true, index: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

certificateSchema.index({ tenant: 1, course: 1, student: 1 }, { unique: true });

export const Certificate = model<ICertificate>('Certificate', certificateSchema);
