export type TaskStatus =
  | 'created'
  | 'running'
  | 'staged'
  | 'validating'
  // Orchestrated (Developer -> Reviewer -> PM Tester) states — see docs/AGENT_ORCHESTRATOR.md.
  // 'reviewing'/'pm_testing' are transient (an LLM pass is in flight); the '*_changes_requested'
  // states are terminal-for-the-loop but not terminal-for-the-task — a human can re-run the
  // Developer with the notes attached, same as they'd act on a failed 'staged' validation today.
  | 'reviewing'
  | 'review_changes_requested'
  | 'pm_testing'
  | 'pm_test_changes_requested'
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
  | 'enqueued'
  // Orchestration loop — see docs/AGENT_ORCHESTRATOR.md
  | 'review_started'
  | 'review_passed'
  | 'review_changes_requested'
  | 'pm_test_started'
  | 'pm_test_passed'
  | 'pm_test_changes_requested'
  | 'iteration_limit_reached';

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
  /** Times this job was reclaimed after a worker crash (BullMQ maxStalledCount). */
  stallCount?: number;
  /** Processing attempts after explicit failures (default max 3). */
  attempts?: number;
  maxAttempts?: number;
  lastError?: string;
}

export const DEFAULT_HEADLESS_MAX_ATTEMPTS = 3;
