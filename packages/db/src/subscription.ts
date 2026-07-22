import { Schema, model, Document } from 'mongoose';

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

export interface ITenantSubscription extends Document {
  tenantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSubscriptionSchema = new Schema<ITenantSubscription>(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'business', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused'],
      default: 'active',
    },
    stripeCustomerId: { type: String, index: true, sparse: true },
    stripeSubscriptionId: { type: String, index: true, sparse: true },
    stripePriceId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    trialEnd: Date,
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const TenantSubscription = model<ITenantSubscription>('TenantSubscription', tenantSubscriptionSchema);
