import { Schema, model, Document } from 'mongoose';

/** External social platform a tenant can connect (MARKETING_PLATFORM_STRATEGY §5/§7). */
export type SocialPlatform = 'linkedin' | 'x' | 'instagram' | 'facebook' | 'youtube' | 'tiktok';

export const SOCIAL_PLATFORMS: SocialPlatform[] = ['linkedin', 'x', 'instagram', 'facebook', 'youtube', 'tiktok'];

export type SocialAccountStatus = 'connected' | 'expired' | 'revoked';

export const SOCIAL_ACCOUNT_STATUSES: SocialAccountStatus[] = ['connected', 'expired', 'revoked'];

export interface ISocialAccount extends Document {
  /** Tenant isolation — one connected external account per tenant. */
  tenantId: string;
  platform: SocialPlatform;
  /** Platform-side account id (e.g. LinkedIn org id / X user id). */
  externalAccountId: string;
  displayName: string;
  /**
   * AES-256-encrypted at rest (key from env secret — never stored alongside the data in Mongo).
   * Never returned in any GraphQL response.
   */
  encryptedAccessToken: string;
  encryptedRefreshToken?: string;
  tokenExpiresAt?: Date;
  status: SocialAccountStatus;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const socialAccountSchema = new Schema<ISocialAccount>(
  {
    tenantId: { type: String, required: true, index: true },
    platform: { type: String, enum: SOCIAL_PLATFORMS, required: true },
    externalAccountId: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    encryptedAccessToken: { type: String, required: true },
    encryptedRefreshToken: { type: String },
    tokenExpiresAt: { type: Date },
    status: {
      type: String,
      enum: SOCIAL_ACCOUNT_STATUSES,
      default: 'connected',
      index: true,
    },
    scopes: { type: [String], default: [] },
  },
  { timestamps: true },
);

socialAccountSchema.index({ tenantId: 1, platform: 1 });
socialAccountSchema.index({ tenantId: 1, externalAccountId: 1 }, { unique: true });

export const SocialAccount = model<ISocialAccount>('SocialAccount', socialAccountSchema);
