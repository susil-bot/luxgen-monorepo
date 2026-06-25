import { Schema, model, Document } from 'mongoose';

export type TenantSigningKeyStatus = 'active' | 'grace' | 'revoked';

export interface ITenantSigningKey extends Document {
  tenantId: string;
  keyId: string;
  secret: string;
  status: TenantSigningKeyStatus;
  expiresAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSigningKeySchema = new Schema<ITenantSigningKey>(
  {
    tenantId: { type: String, required: true, index: true },
    keyId: { type: String, required: true, unique: true },
    secret: { type: String, required: true },
    status: { type: String, enum: ['active', 'grace', 'revoked'], required: true },
    expiresAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: true },
);

tenantSigningKeySchema.index({ tenantId: 1, status: 1 });
tenantSigningKeySchema.index({ status: 1, expiresAt: 1 });

export const TenantSigningKey = model<ITenantSigningKey>('TenantSigningKey', tenantSigningKeySchema);
