import { Schema, model, Document } from 'mongoose';

/** T-SRCH-08 — one row per executed search; aggregated into SearchEventSummary. */
export interface ISearchEvent extends Document {
  tenantId: string;
  query: string;
  resultCount: number;
  createdAt: Date;
}

const searchEventSchema = new Schema<ISearchEvent>(
  {
    tenantId: { type: String, required: true, index: true },
    query: { type: String, required: true, trim: true },
    resultCount: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

searchEventSchema.index({ tenantId: 1, createdAt: -1 });

export const SearchEvent = model<ISearchEvent>('SearchEvent', searchEventSchema);
