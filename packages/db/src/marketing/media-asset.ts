import { Schema, model, Document } from 'mongoose';

export type MediaAssetType = 'image' | 'video' | 'doc';

export const MEDIA_ASSET_TYPES: MediaAssetType[] = ['image', 'video', 'doc'];

export interface IMediaAsset extends Document {
  /** Tenant isolation — Content Library backing model. */
  tenantId: string;
  type: MediaAssetType;
  /**
   * S3-compatible object URL — never base64-in-Mongo (MARKETING_PLATFORM_STRATEGY §5/§7).
   */
  storageUrl: string;
  sizeBytes: number;
  durationSeconds?: number;
  tags: string[];
  /** User id of the uploader (group.ts createdBy convention). */
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaAssetSchema = new Schema<IMediaAsset>(
  {
    tenantId: { type: String, required: true, index: true },
    type: { type: String, enum: MEDIA_ASSET_TYPES, required: true },
    storageUrl: { type: String, required: true },
    sizeBytes: { type: Number, required: true, min: 0 },
    durationSeconds: { type: Number, min: 0 },
    tags: { type: [String], default: [] },
    createdBy: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

mediaAssetSchema.index({ tenantId: 1, createdAt: -1 });
mediaAssetSchema.index({ tenantId: 1, tags: 1 });

export const MediaAsset = model<IMediaAsset>('MediaAsset', mediaAssetSchema);
