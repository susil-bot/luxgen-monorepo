import { Schema, model, Document } from 'mongoose';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'need_more_information'
  | 'approved'
  | 'rejected'
  | 'awaiting_payment'
  | 'published'
  | 'expired';

export type PublicationStatus = 'unpublished' | 'published' | 'expired';

export interface IStatusHistoryEntry {
  status: ApplicationStatus;
  at: Date;
  by?: string;
  note?: string;
}

export interface IReminderTimestamps {
  draft?: Date;
  needMoreInformation?: Date;
  awaitingPayment?: Date;
  expiredRenewal?: Date;
}

export interface IBusinessListing extends Document {
  tenantId: string;
  applicantUserId?: string;
  applicantEmail: string;
  applicantName?: string;
  businessName: string;
  slug: string;
  description?: string;
  category?: string;
  website?: string;
  phone?: string;
  address?: string;
  applicationStatus: ApplicationStatus;
  publicationStatus: PublicationStatus;
  reviewerNotes?: string;
  statusHistory: IStatusHistoryEntry[];
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionActive: boolean;
  publishedAt?: Date;
  expiredAt?: Date;
  paymentCompletedAt?: Date;
  approvedAt?: Date;
  submittedAt?: Date;
  lastReminderAt: IReminderTimestamps;
  createdAt: Date;
  updatedAt: Date;
}

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    by: String,
    note: String,
  },
  { _id: false },
);

const reminderSchema = new Schema<IReminderTimestamps>(
  {
    draft: Date,
    needMoreInformation: Date,
    awaitingPayment: Date,
    expiredRenewal: Date,
  },
  { _id: false },
);

const businessListingSchema = new Schema<IBusinessListing>(
  {
    tenantId: { type: String, required: true, index: true },
    applicantUserId: { type: String, index: true },
    applicantEmail: { type: String, required: true, lowercase: true, trim: true },
    applicantName: String,
    businessName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: String,
    category: String,
    website: String,
    phone: String,
    address: String,
    applicationStatus: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'need_more_information',
        'approved',
        'rejected',
        'awaiting_payment',
        'published',
        'expired',
      ],
      default: 'draft',
      index: true,
    },
    publicationStatus: {
      type: String,
      enum: ['unpublished', 'published', 'expired'],
      default: 'unpublished',
      index: true,
    },
    reviewerNotes: String,
    statusHistory: { type: [statusHistorySchema], default: [] },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    subscriptionActive: { type: Boolean, default: false },
    publishedAt: Date,
    expiredAt: Date,
    paymentCompletedAt: Date,
    approvedAt: Date,
    submittedAt: Date,
    lastReminderAt: { type: reminderSchema, default: {} },
  },
  { timestamps: true },
);

businessListingSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
businessListingSchema.index({ tenantId: 1, publicationStatus: 1 });
businessListingSchema.index({ tenantId: 1, applicationStatus: 1 });

export const BusinessListing = model<IBusinessListing>('BusinessListing', businessListingSchema);
