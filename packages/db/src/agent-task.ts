import { Schema, model, Document } from 'mongoose';

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
  messages?: Array<{ role: string; content: string; timestamp: number }>;
  metadata: {
    model?: string;
    toolCallCount?: number;
    iterationCount?: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
  };
}

const agentTaskSchema = new Schema<IAgentTask>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: [
        'created',
        'running',
        'staged',
        'validating',
        'pending_review',
        'committed',
        'merged',
        'failed',
        'cancelled',
      ],
      default: 'created',
    },
    mode: { type: String, enum: ['interactive', 'headless'], default: 'interactive' },
    prompt: { type: String },
    files: { type: Schema.Types.Mixed, default: {} },
    git: { type: Schema.Types.Mixed },
    validation: { type: Schema.Types.Mixed },
    messages: { type: Schema.Types.Mixed },
    metadata: {
      model: String,
      toolCallCount: Number,
      iterationCount: Number,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      completedAt: Date,
    },
  },
  { timestamps: false },
);

agentTaskSchema.index({ tenantId: 1, 'metadata.updatedAt': -1 });

export const AgentTask = model<IAgentTask>('AgentTask', agentTaskSchema);
