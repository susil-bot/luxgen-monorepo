import { Schema, model, Document } from 'mongoose';

export type ListingEmailTemplate =
  | 'additional_information_requested'
  | 'application_approved'
  | 'application_rejected'
  | 'payment_confirmation'
  | 'subscription_expiration'
  | 'reminder_draft'
  | 'reminder_need_more_information'
  | 'reminder_awaiting_payment'
  | 'reminder_expired_renewal';

export interface IEmailNotificationLog extends Document {
  tenantId: string;
  listingId: string;
  recipientEmail: string;
  template: ListingEmailTemplate;
  subject: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
  metadata?: Record<string, unknown>;
  sentAt: Date;
}

const emailNotificationLogSchema = new Schema<IEmailNotificationLog>(
  {
    tenantId: { type: String, required: true, index: true },
    listingId: { type: String, required: true, index: true },
    recipientEmail: { type: String, required: true },
    template: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ['sent', 'failed', 'skipped'], default: 'sent' },
    error: String,
    metadata: { type: Schema.Types.Mixed },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

emailNotificationLogSchema.index({ listingId: 1, template: 1, sentAt: -1 });

export const EmailNotificationLog = model<IEmailNotificationLog>('EmailNotificationLog', emailNotificationLogSchema);
