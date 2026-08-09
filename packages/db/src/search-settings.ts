import { Schema, model, Document } from 'mongoose';

/** T-SRCH-12 — per-tenant search result preferences (result page size, history opt-out). */
export interface ISearchSettings extends Document {
  tenantId: string;
  resultsPerPage: number;
  trackSearchHistory: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const searchSettingsSchema = new Schema<ISearchSettings>(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    resultsPerPage: { type: Number, default: 20, min: 5, max: 100 },
    trackSearchHistory: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const SearchSettings = model<ISearchSettings>('SearchSettings', searchSettingsSchema);
