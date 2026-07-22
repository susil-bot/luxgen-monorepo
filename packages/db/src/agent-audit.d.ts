import { Document } from 'mongoose';
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
export declare const AgentAuditEntry: import('mongoose').Model<
  IAgentAuditEntry,
  {},
  {},
  {},
  Document<unknown, {}, IAgentAuditEntry> &
    IAgentAuditEntry & {
      _id: import('mongoose').Types.ObjectId;
    },
  any
>;
