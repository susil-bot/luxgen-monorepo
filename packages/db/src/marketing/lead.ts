import { Schema, model, Document, Types } from 'mongoose';

export type LeadSource = 'post' | 'campaign' | 'dm';

export const LEAD_SOURCES: LeadSource[] = ['post', 'campaign', 'dm'];

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'converted';

export const LEAD_STAGES: LeadStage[] = ['new', 'contacted', 'qualified', 'converted'];

export interface ILead extends Document {
  /** Tenant isolation. */
  tenantId: string;
  source: LeadSource;
  sourcePostId?: string;
  email?: string;
  name?: string;
  stage: LeadStage;
  /**
   * Links into the EXISTING Customer model (User role STUDENT) — MARKETING_PLATFORM_STRATEGY §5a.
   * A converted lead becomes a normal customer record, never a second parallel person record.
   */
  convertedToCustomerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    tenantId: { type: String, required: true, index: true },
    source: { type: String, enum: LEAD_SOURCES, required: true },
    sourcePostId: { type: String },
    email: { type: String, trim: true },
    name: { type: String, trim: true },
    stage: {
      type: String,
      enum: LEAD_STAGES,
      default: 'new',
      index: true,
    },
    convertedToCustomerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

leadSchema.index({ tenantId: 1, stage: 1 });
leadSchema.index({ tenantId: 1, createdAt: -1 });

export const Lead = model<ILead>('Lead', leadSchema);
