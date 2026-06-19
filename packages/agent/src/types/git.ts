export type GitSessionStatus = 'none' | 'worktree_ready' | 'committed' | 'merged' | 'discarded';

export interface AgentSessionGit {
  enabled: boolean;
  status: GitSessionStatus;
  worktreePath: string;
  branch: string;
  baseBranch: string;
  commitSha?: string;
  prUrl?: string;
  mergeConflicts?: string[];
  lastError?: string;
}

export interface GitSessionInfo {
  sessionId: string;
  git: AgentSessionGit;
}

export interface CommitResult {
  applied: string[];
  errors: string[];
  conflicts: string[];
  commitSha?: string;
  branch: string;
  message: string;
}

export interface MergeResult {
  merged: boolean;
  commitSha?: string;
  baseBranch: string;
  branch: string;
  conflicts: string[];
  errors: string[];
}

export interface PullRequestResult {
  created: boolean;
  prUrl?: string;
  error?: string;
}

export interface GitStatusResult {
  available: boolean;
  gitEnabled: boolean;
  reason?: string;
  session?: AgentSessionGit;
  currentBranch?: string;
  hasStagedFiles: boolean;
  canCommit: boolean;
  canMerge: boolean;
  canCreatePr: boolean;
}
