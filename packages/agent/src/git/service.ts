import fs from 'fs';
import path from 'path';
import { getAgentConfig } from '../config/agent-mode';
import {
  getAgentBranchName,
  getMergeWorktreePath,
  getMonorepoRoot,
  getWorktreePath,
  getWorktreesDir,
  sanitizeSessionId,
} from '../config/paths';
import { loadSession, saveSession, isGitWorktreeActive } from '../changeset/session-store';
import type { AgentSession } from '../types/session';
import type {
  AgentSessionGit,
  CommitResult,
  GitSessionInfo,
  GitStatusResult,
  MergeResult,
  PullRequestResult,
} from '../types/git';
import { execGh, execGit, getCurrentBranch, hasGhCli, isGitRepository } from './exec';

function emptyGitMeta(): AgentSessionGit {
  return {
    enabled: false,
    status: 'none',
    worktreePath: '',
    branch: '',
    baseBranch: '',
  };
}

export function isGitSessionActive(sessionId: string): boolean {
  return isGitWorktreeActive(sessionId);
}

export async function ensureGitSession(sessionId: string): Promise<GitSessionInfo | null> {
  const config = getAgentConfig();
  const root = getMonorepoRoot();

  if (!config.gitEnabled || !isGitRepository(root)) {
    return null;
  }

  const session = loadSession(sessionId);

  if (session.git?.enabled && fs.existsSync(session.git.worktreePath)) {
    return { sessionId, git: session.git };
  }

  const branch = getAgentBranchName(sessionId);
  const worktreePath = getWorktreePath(sessionId);
  let baseBranch = config.baseBranch;

  try {
    baseBranch = await getCurrentBranch(root);
  } catch {
    baseBranch = config.baseBranch;
  }

  const worktreesDir = getWorktreesDir();
  if (!fs.existsSync(worktreesDir)) {
    fs.mkdirSync(worktreesDir, { recursive: true });
  }

  if (fs.existsSync(worktreePath)) {
    session.git = {
      enabled: true,
      status: 'worktree_ready',
      worktreePath,
      branch,
      baseBranch,
    };
    session.updatedAt = Date.now();
    saveSession(session);
    return { sessionId, git: session.git };
  }

  try {
    await execGit(['worktree', 'add', '-b', branch, worktreePath, baseBranch], root);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes('already exists')) {
      await execGit(['worktree', 'add', worktreePath, branch], root);
    } else {
      session.git = { ...emptyGitMeta(), enabled: false, lastError: message };
      saveSession(session);
      return null;
    }
  }

  session.git = {
    enabled: true,
    status: 'worktree_ready',
    worktreePath,
    branch,
    baseBranch,
  };
  session.updatedAt = Date.now();
  saveSession(session);

  return { sessionId, git: session.git };
}

export async function getGitStatus(sessionId: string): Promise<GitStatusResult> {
  const config = getAgentConfig();
  const root = getMonorepoRoot();
  const session = loadSession(sessionId);
  const hasStagedFiles = Object.keys(session.files).length > 0;

  if (!config.gitEnabled) {
    return {
      available: false,
      gitEnabled: false,
      reason: 'Git worktrees disabled (AGENT_DEPLOYMENT_MODE=local)',
      hasStagedFiles,
      canCommit: false,
      canMerge: false,
      canCreatePr: false,
    };
  }

  if (!isGitRepository(root)) {
    return {
      available: false,
      gitEnabled: true,
      reason: 'Not a git repository — using filesystem apply',
      hasStagedFiles,
      canCommit: false,
      canMerge: false,
      canCreatePr: false,
    };
  }

  const git = session.git;
  const ghAvailable = await hasGhCli();

  return {
    available: Boolean(git?.enabled),
    gitEnabled: true,
    session: git,
    currentBranch: git?.branch,
    hasStagedFiles,
    canCommit: Boolean(git?.enabled && hasStagedFiles && git.status === 'worktree_ready'),
    canMerge: Boolean(git?.enabled && git.status === 'committed'),
    canCreatePr: Boolean(git?.enabled && git.status === 'committed' && ghAvailable),
  };
}

function writeStagedFilesToWorkspace(
  session: AgentSession,
  workspaceRoot: string,
): {
  applied: string[];
  errors: string[];
  conflicts: string[];
} {
  const applied: string[] = [];
  const errors: string[] = [];
  const conflicts: string[] = [];

  for (const [filePath, staged] of Object.entries(session.files)) {
    const absPath = path.join(workspaceRoot, filePath);
    if (fs.existsSync(absPath) && staged.originalContent !== undefined && staged.type === 'modified') {
      try {
        const currentContent = fs.readFileSync(absPath, 'utf-8');
        if (currentContent !== staged.originalContent) {
          conflicts.push(filePath);
        }
      } catch {
        // proceed
      }
    }
  }

  for (const [filePath, staged] of Object.entries(session.files)) {
    try {
      const absPath = path.join(workspaceRoot, filePath);
      if (staged.pendingDelete) {
        if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
      } else {
        fs.mkdirSync(path.dirname(absPath), { recursive: true });
        fs.writeFileSync(absPath, staged.content, 'utf-8');
      }
      applied.push(filePath);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`${filePath}: ${message}`);
    }
  }

  return { applied, errors, conflicts };
}

export async function commitStagedSession(sessionId: string, commitMessage?: string): Promise<CommitResult> {
  const session = loadSession(sessionId);
  const git = session.git;

  if (!git?.enabled || !git.worktreePath) {
    throw new Error('Git session not initialized. Call ensureGitSession first.');
  }

  const message = commitMessage || defaultCommitMessage(sessionId, session);
  const { applied, errors, conflicts } = writeStagedFilesToWorkspace(session, git.worktreePath);

  if (applied.length === 0) {
    return {
      applied,
      errors: errors.length ? errors : ['No staged files to commit'],
      conflicts,
      branch: git.branch,
      message,
    };
  }

  try {
    await execGit(['add', '-A'], git.worktreePath);
    const { stdout } = await execGit(['commit', '-m', message], git.worktreePath);
    const shaMatch = stdout.match(/\[[\w/-]+\s+([a-f0-9]+)\]/i);
    const commitSha = shaMatch?.[1];

    session.files = {};
    session.git = {
      ...git,
      status: 'committed',
      commitSha,
      mergeConflicts: conflicts.length ? conflicts : undefined,
    };
    session.updatedAt = Date.now();
    saveSession(session);

    return { applied, errors, conflicts, commitSha, branch: git.branch, message };
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    errors.push(errMsg);
    return { applied, errors, conflicts, branch: git.branch, message };
  }
}

function defaultCommitMessage(sessionId: string, session: AgentSession): string {
  const paths = Object.keys(session.files);
  const summary = paths.length === 1 ? paths[0].split('/').pop() : `${paths.length} files`;
  return `agent(${sanitizeSessionId(sessionId)}): ${summary}`;
}

export async function detectMergeConflicts(sessionId: string): Promise<string[]> {
  const session = loadSession(sessionId);
  const git = session.git;
  const root = getMonorepoRoot();

  if (!git?.enabled || !git.branch) return [];

  try {
    const { stdout: baseSha } = await execGit(['rev-parse', git.baseBranch], root);
    const { stdout: branchSha } = await execGit(['rev-parse', git.branch], root);
    const { stdout: mergeTree } = await execGit(['merge-tree', baseSha, baseSha, branchSha], root);
    const conflicts: string[] = [];
    const conflictBlocks = mergeTree.split('<<<<<<<');
    if (conflictBlocks.length <= 1) return [];

    for (const block of conflictBlocks.slice(1)) {
      const pathMatch = block.match(/\.merge_file_[a-f0-9]+\n(.*?)\n=======/s);
      if (pathMatch) conflicts.push(pathMatch[1].trim());
    }
    return conflicts.length ? conflicts : ['merge conflict detected'];
  } catch {
    return [];
  }
}

async function removeMergeWorktree(sessionId: string, root: string): Promise<void> {
  const mergePath = getMergeWorktreePath(sessionId);
  if (!fs.existsSync(mergePath)) return;

  try {
    await execGit(['worktree', 'remove', '--force', mergePath], root);
  } catch {
    if (fs.existsSync(mergePath)) {
      fs.rmSync(mergePath, { recursive: true, force: true });
    }
  }
}

export async function mergeAgentBranch(sessionId: string): Promise<MergeResult> {
  const session = loadSession(sessionId);
  const git = session.git;
  const root = getMonorepoRoot();

  if (!git?.enabled || git.status !== 'committed') {
    return {
      merged: false,
      baseBranch: git?.baseBranch || '',
      branch: git?.branch || '',
      conflicts: [],
      errors: ['Session must be committed before merge'],
    };
  }

  const conflicts = await detectMergeConflicts(sessionId);
  if (conflicts.length > 0) {
    session.git = { ...git, mergeConflicts: conflicts };
    saveSession(session);
    return {
      merged: false,
      baseBranch: git.baseBranch,
      branch: git.branch,
      conflicts,
      errors: ['Merge blocked due to conflicts with base branch'],
    };
  }

  const message = `agent(${sanitizeSessionId(sessionId)}): squash merge ${git.branch}`;
  const mergeWorktreePath = getMergeWorktreePath(sessionId);
  const worktreesDir = getWorktreesDir();

  try {
    if (!fs.existsSync(worktreesDir)) {
      fs.mkdirSync(worktreesDir, { recursive: true });
    }

    await removeMergeWorktree(sessionId, root);

    const { stdout: baseSha } = await execGit(['rev-parse', git.baseBranch], root);
    // Detached worktree: base branch may already be checked out at repo root.
    await execGit(['worktree', 'add', '--detach', mergeWorktreePath, baseSha.trim()], root);

    let commitSha: string | undefined;
    try {
      await execGit(['merge', '--squash', git.branch], mergeWorktreePath);
      const { stdout } = await execGit(['commit', '-m', message], mergeWorktreePath);
      const shaMatch = stdout.match(/\[[\w/-]+\s+([a-f0-9]+)\]/i);
      commitSha = shaMatch?.[1];
      if (!commitSha) {
        const { stdout: headSha } = await execGit(['rev-parse', 'HEAD'], mergeWorktreePath);
        commitSha = headSha.trim();
      }
      await execGit(['branch', '-f', git.baseBranch, commitSha], root);
    } finally {
      await removeMergeWorktree(sessionId, root);
    }

    await cleanupGitSession(sessionId, { deleteBranch: true });

    session.git = { ...git, status: 'merged', commitSha };
    saveSession(session);

    return {
      merged: true,
      commitSha,
      baseBranch: git.baseBranch,
      branch: git.branch,
      conflicts: [],
      errors: [],
    };
  } catch (e: unknown) {
    await removeMergeWorktree(sessionId, root);
    const errMsg = e instanceof Error ? e.message : String(e);
    return {
      merged: false,
      baseBranch: git.baseBranch,
      branch: git.branch,
      conflicts,
      errors: [errMsg],
    };
  }
}

export async function createPullRequest(sessionId: string, title?: string, body?: string): Promise<PullRequestResult> {
  const session = loadSession(sessionId);
  const git = session.git;
  const root = getMonorepoRoot();

  if (!git?.enabled || git.status !== 'committed') {
    return { created: false, error: 'Commit to branch before opening a PR' };
  }

  if (!(await hasGhCli())) {
    return { created: false, error: 'GitHub CLI (gh) not installed' };
  }

  const prTitle = title || `Agent Studio: ${git.branch}`;
  const prBody = body || `Automated changes from Agent Studio session \`${sessionId}\`.\n\nBranch: \`${git.branch}\``;

  try {
    await execGit(['push', '-u', 'origin', git.branch], root);
    const url = await execGh(
      ['pr', 'create', '--head', git.branch, '--base', git.baseBranch, '--title', prTitle, '--body', prBody],
      root,
    );

    session.git = { ...git, prUrl: url };
    saveSession(session);

    return { created: true, prUrl: url };
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return { created: false, error: errMsg };
  }
}

export async function cleanupGitSession(sessionId: string, options: { deleteBranch?: boolean } = {}): Promise<void> {
  const session = loadSession(sessionId);
  const git = session.git;
  const root = getMonorepoRoot();

  if (!git?.worktreePath) return;

  try {
    if (fs.existsSync(git.worktreePath)) {
      await execGit(['worktree', 'remove', '--force', git.worktreePath], root);
    }
  } catch {
    if (fs.existsSync(git.worktreePath)) {
      fs.rmSync(git.worktreePath, { recursive: true, force: true });
    }
  }

  if (options.deleteBranch && git.branch) {
    try {
      await execGit(['branch', '-D', git.branch], root);
    } catch {
      // branch may already be merged/deleted
    }
  }
}

export async function discardGitSession(sessionId: string): Promise<void> {
  await cleanupGitSession(sessionId, { deleteBranch: true });
  const session = loadSession(sessionId);
  session.files = {};
  session.git = { ...emptyGitMeta(), status: 'discarded' };
  session.updatedAt = Date.now();
  saveSession(session);
}
