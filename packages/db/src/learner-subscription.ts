import { Schema, model, Document, Types } from 'mongoose';

export enum LearnerSubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
}

export interface ILearnerSubscription extends Document {
  tenant: Types.ObjectId;
  userId: Types.ObjectId;
  bundleId: Types.ObjectId;
  status: LearnerSubscriptionStatus;
  currentPeriodEnd?: Date;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const learnerSubscriptionSchema = new Schema<ILearnerSubscription>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bundleId: { type: Schema.Types.ObjectId, ref: 'StorefrontBundle', required: true, index: true },
    status: {
      type: String,
      enum: Object.values(LearnerSubscriptionStatus),
      default: LearnerSubscriptionStatus.ACTIVE,
    },
    currentPeriodEnd: Date,
    stripeSubscriptionId: String,
  },
  { timestamps: true },
);

learnerSubscriptionSchema.index({ userId: 1, bundleId: 1 }, { unique: true });

export const LearnerSubscription = model<ILearnerSubscription>('LearnerSubscription', learnerSubscriptionSchema);
