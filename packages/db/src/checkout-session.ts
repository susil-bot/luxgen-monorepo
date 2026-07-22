import { Schema, model, Document, Types } from 'mongoose';

export enum CheckoutSessionStatus {
  OPEN = 'OPEN',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  ABANDONED = 'ABANDONED',
}

export interface ICheckoutSession extends Document {
  tenant: Types.ObjectId;
  course: Types.ObjectId;
  student: Types.ObjectId;
  stripeSessionId: string;
  amountCents: number;
  currency: string;
  status: CheckoutSessionStatus;
  customerEmail?: string;
  checkoutUrl?: string;
  courseTitle?: string;
  completedAt?: Date;
  abandonedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const checkoutSessionSchema = new Schema<ICheckoutSession>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stripeSessionId: { type: String, required: true, unique: true, index: true },
    amountCents: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'usd', trim: true },
    status: {
      type: String,
      enum: Object.values(CheckoutSessionStatus),
      default: CheckoutSessionStatus.OPEN,
      index: true,
    },
    customerEmail: { type: String, trim: true },
    checkoutUrl: { type: String, trim: true },
    courseTitle: { type: String, trim: true },
    completedAt: { type: Date },
    abandonedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

checkoutSessionSchema.index({ tenant: 1, status: 1, createdAt: -1 });

export const CheckoutSession = model<ICheckoutSession>('CheckoutSession', checkoutSessionSchema);
