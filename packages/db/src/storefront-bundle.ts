import { Schema, model, Document, Types } from 'mongoose';

export enum StorefrontBundleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum StorefrontBillingInterval {
  ONE_TIME = 'one_time',
  MONTH = 'month',
  YEAR = 'year',
}

export interface IStorefrontBundle extends Document {
  tenant: Types.ObjectId;
  title: string;
  description?: string;
  slug: string;
  courseIds: Types.ObjectId[];
  priceCents: number;
  currency: string;
  billingInterval: StorefrontBillingInterval;
  status: StorefrontBundleStatus;
  createdAt: Date;
  updatedAt: Date;
}

const storefrontBundleSchema = new Schema<IStorefrontBundle>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    courseIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    priceCents: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, default: 'usd', lowercase: true },
    billingInterval: {
      type: String,
      enum: Object.values(StorefrontBillingInterval),
      default: StorefrontBillingInterval.ONE_TIME,
    },
    status: {
      type: String,
      enum: Object.values(StorefrontBundleStatus),
      default: StorefrontBundleStatus.DRAFT,
    },
  },
  { timestamps: true },
);

storefrontBundleSchema.index({ tenant: 1, slug: 1 }, { unique: true });

export const StorefrontBundle = model<IStorefrontBundle>('StorefrontBundle', storefrontBundleSchema);
