import { Schema, model, Document } from 'mongoose';

export interface IMcpToolAuditEntry extends Document {
  tenantId: string;
  keyId?: string;
  userId?: string;
  tool: string;
  success: boolean;
  durationMs: number;
  error?: string;
  timestamp: Date;
}

const mcpToolAuditSchema = new Schema<IMcpToolAuditEntry>(
  {
    tenantId: { type: String, required: true, index: true },
    keyId: { type: String, index: true },
    userId: { type: String },
    tool: { type: String, required: true },
    success: { type: Boolean, required: true },
    durationMs: { type: Number, required: true, min: 0 },
    error: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

mcpToolAuditSchema.index({ tenantId: 1, timestamp: -1 });

export const McpToolAuditEntry = model<IMcpToolAuditEntry>('McpToolAuditEntry', mcpToolAuditSchema);
