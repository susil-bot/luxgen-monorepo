import { Schema, model, Document, Types } from 'mongoose';
import { SocialPlatform, SOCIAL_PLATFORMS } from './social-account';

export type SocialPostStatus = 'draft' | 'queued' | 'scheduled' | 'publishing' | 'published' | 'failed';

export const SOCIAL_POST_STATUSES: SocialPostStatus[] = [
  'draft',
  'queued',
  'scheduled',
  'publishing',
  'published',
  'failed',
];

export interface ISocialPost extends Document {
  /** Tenant isolation. */
  tenantId: string;
  /**
   * Cross-post grouping — a "cross-post" is N rows (one per platform-target)
   * sharing the same postGroupId.
   */
  postGroupId: string;
  socialAccountId: Types.ObjectId;
  platform: SocialPlatform;
  status: SocialPostStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  body: string;
  mediaAssetIds: Types.ObjectId[];
  externalPostId?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const socialPostSchema = new Schema<ISocialPost>(
  {
    tenantId: { type: String, required: true, index: true },
    postGroupId: { type: String, required: true, index: true },
    socialAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'SocialAccount',
      required: true,
      index: true,
    },
    platform: { type: String, enum: SOCIAL_PLATFORMS, required: true },
    status: {
      type: String,
      enum: SOCIAL_POST_STATUSES,
      default: 'draft',
      index: true,
    },
    scheduledAt: { type: Date },
    publishedAt: { type: Date },
    body: { type: String, required: true },
    mediaAssetIds: { type: [Schema.Types.ObjectId], ref: 'MediaAsset', default: [] },
    externalPostId: { type: String },
    failureReason: { type: String },
  },
  { timestamps: true },
);

socialPostSchema.index({ tenantId: 1, status: 1, scheduledAt: 1 });
socialPostSchema.index({ postGroupId: 1 });

export const SocialPost = model<ISocialPost>('SocialPost', socialPostSchema);
