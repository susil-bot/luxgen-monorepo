import { Document } from 'mongoose';
export type AgentTaskStatus =
  | 'created'
  | 'running'
  | 'staged'
  | 'validating'
  | 'pending_review'
  | 'committed'
  | 'merged'
  | 'failed'
  | 'cancelled';
export type AgentTaskMode = 'interactive' | 'headless';
export interface IAgentTask extends Document {
  sessionId: string;
  tenantId: string;
  userId: string;
  status: AgentTaskStatus;
  mode: AgentTaskMode;
  prompt?: string;
  files: Record<string, unknown>;
  git?: Record<string, unknown>;
  validation?: Record<string, unknown>;
  metadata: {
    model?: string;
    toolCallCount?: number;
    iterationCount?: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
  };
}
export declare const AgentTask: import('mongoose').Model<
  IAgentTask,
  {},
  {},
  {},
  Document<unknown, {}, IAgentTask> &
    IAgentTask & {
      _id: import('mongoose').Types.ObjectId;
    },
  any
>;
