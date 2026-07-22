import { Schema, model, Document } from 'mongoose';

export type McpApiKeyScope = 'read' | 'write';

export interface IMcpApiKey extends Document {
  tenantId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  scopes: McpApiKeyScope[];
  createdByUserId: string;
  createdAt: Date;
  revokedAt?: Date;
  lastUsedAt?: Date;
}

const mcpApiKeySchema = new Schema<IMcpApiKey>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    keyHash: { type: String, required: true, unique: true },
    keyPrefix: { type: String, required: true },
    scopes: {
      type: [String],
      enum: ['read', 'write'],
      required: true,
      validate: [(v: string[]) => v.length > 0, 'At least one scope required'],
    },
    createdByUserId: { type: String, required: true },
    revokedAt: { type: Date },
    lastUsedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

mcpApiKeySchema.index({ tenantId: 1, revokedAt: 1 });

export const McpApiKey = model<IMcpApiKey>('McpApiKey', mcpApiKeySchema);
