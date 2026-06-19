export type TaskStatus =
  | 'created'
  | 'running'
  | 'staged'
  | 'validating'
  | 'pending_review'
  | 'committed'
  | 'merged'
  | 'failed'
  | 'cancelled';

export type TaskMode = 'interactive' | 'headless';

export interface AgentTaskRecord {
  sessionId: string;
  tenantId: string;
  userId: string;
  status: TaskStatus;
  mode: TaskMode;
  prompt?: string;
  validation?: import('./validation').ValidationResult;
  metadata: {
    model?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export type AuditAction =
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

export interface AgentAuditRecord {
  sessionId: string;
  tenantId: string;
  userId: string;
  action: AuditAction;
  details: Record<string, unknown>;
  timestamp: Date;
}

export interface AgentAuthContext {
  userId: string;
  tenantId: string;
  email?: string;
  role?: string;
}

export interface HeadlessTaskJob {
  id: string;
  sessionId: string;
  tenantId: string;
  userId: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  ollamaHost: string;
  model?: string;
  enqueuedAt: number;
}
