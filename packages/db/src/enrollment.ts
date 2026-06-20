import { Schema, model, Document, Types } from 'mongoose';

export enum EnrollmentPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  VOIDED = 'VOIDED',
}

export enum EnrollmentLearningStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface IEnrollment extends Document {
  tenant: Types.ObjectId;
  course: Types.ObjectId;
  student: Types.ObjectId;
  notes: string;
  paymentStatus: EnrollmentPaymentStatus;
  progressPercent: number;
  learningStatus: EnrollmentLearningStatus;
  lastAccessedAt?: Date;
  stripeCheckoutSessionId?: string;
  paidAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    notes: { type: String, default: '' },
    paymentStatus: {
      type: String,
      enum: Object.values(EnrollmentPaymentStatus),
      default: EnrollmentPaymentStatus.PENDING,
    },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    learningStatus: {
      type: String,
      enum: Object.values(EnrollmentLearningStatus),
      default: EnrollmentLearningStatus.ACTIVE,
    },
    lastAccessedAt: { type: Date },
    stripeCheckoutSessionId: { type: String },
    paidAt: { type: Date },
    cancelledAt: { type: Date },
    completedAt: { type: Date },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

enrollmentSchema.index({ course: 1, student: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>('Enrollment', enrollmentSchema);

export function enrollmentSubjectId(courseId: string, studentId: string): string {
  return `${courseId}:${studentId}`;
}
