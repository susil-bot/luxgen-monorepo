import { Schema, model, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  subdomain: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  settings: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

export const Tenant = model<ITenant>('Tenant', tenantSchema);
