export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolUses?: ToolUse[];
  timestamp: number;
}

export interface ToolUse {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: string;
  status: 'pending' | 'done' | 'error';
}

export interface StagedFile {
  path: string;
  content: string;
  originalContent?: string;
  type: 'new' | 'modified';
  description: string;
  stagedAt: number;
  pendingDelete?: boolean;
}

import type { AgentSessionGit } from './git';
import type { ValidationResult } from './validation';

export interface AgentSession {
  id: string;
  files: Record<string, StagedFile>;
  createdAt: number;
  updatedAt: number;
  git?: AgentSessionGit;
  validation?: ValidationResult;
  tenantId?: string;
  userId?: string;
  status?: import('./task').TaskStatus;
  mode?: import('./task').TaskMode;
  prompt?: string;
  metadata?: {
    model?: string;
  };
}

export interface ApplyResult {
  applied: string[];
  errors: string[];
  conflicts: string[];
  mode?: 'filesystem' | 'worktree';
  branch?: string;
  blocked?: boolean;
}
