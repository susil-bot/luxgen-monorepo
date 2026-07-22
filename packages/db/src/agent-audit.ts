import { Schema, model, Document } from 'mongoose';

export type AgentAuditAction =
  | 'created'
  | 'run_started'
  | 'staged'
  | 'validated'
  | 'approved'
  | 'committed'
  | 'merged'
  | 'discarded'
  | 'failed'
  | 'enqueued';

export interface IAgentAuditEntry extends Document {
  sessionId: string;
  tenantId: string;
  userId: string;
  action: AgentAuditAction;
  details: Record<string, unknown>;
  timestamp: Date;
}

const agentAuditSchema = new Schema<IAgentAuditEntry>(
  {
    sessionId: { type: String, required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    action: {
      type: String,
      enum: [
        'created',
        'run_started',
        'staged',
        'validated',
        'approved',
        'committed',
        'merged',
        'discarded',
        'failed',
        'enqueued',
      ],
      required: true,
    },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

agentAuditSchema.index({ sessionId: 1, timestamp: -1 });

export const AgentAuditEntry = model<IAgentAuditEntry>('AgentAuditEntry', agentAuditSchema);
