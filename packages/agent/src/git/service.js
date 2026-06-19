'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.isGitSessionActive = isGitSessionActive;
exports.ensureGitSession = ensureGitSession;
exports.getGitStatus = getGitStatus;
exports.commitStagedSession = commitStagedSession;
exports.detectMergeConflicts = detectMergeConflicts;
exports.mergeAgentBranch = mergeAgentBranch;
exports.createPullRequest = createPullRequest;
exports.cleanupGitSession = cleanupGitSession;
exports.discardGitSession = discardGitSession;
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const agent_mode_1 = require('../config/agent-mode');
const paths_1 = require('../config/paths');
const session_store_1 = require('../changeset/session-store');
const exec_1 = require('./exec');
function emptyGitMeta() {
  return {
    enabled: false,
    status: 'none',
    worktreePath: '',
    branch: '',
    baseBranch: '',
  };
}
function isGitSessionActive(sessionId) {
  return (0, session_store_1.isGitWorktreeActive)(sessionId);
}
async function ensureGitSession(sessionId) {
  const config = (0, agent_mode_1.getAgentConfig)();
  const root = (0, paths_1.getMonorepoRoot)();
  if (!config.gitEnabled || !(0, exec_1.isGitRepository)(root)) {
    return null;
  }
  const session = (0, session_store_1.loadSession)(sessionId);
  if (session.git?.enabled && fs_1.default.existsSync(session.git.worktreePath)) {
    return { sessionId, git: session.git };
  }
  const branch = (0, paths_1.getAgentBranchName)(sessionId);
  const worktreePath = (0, paths_1.getWorktreePath)(sessionId);
  let baseBranch = config.baseBranch;
  try {
    baseBranch = await (0, exec_1.getCurrentBranch)(root);
  } catch {
    baseBranch = config.baseBranch;
  }
  const worktreesDir = (0, paths_1.getWorktreesDir)();
  if (!fs_1.default.existsSync(worktreesDir)) {
    fs_1.default.mkdirSync(worktreesDir, { recursive: true });
  }
  if (fs_1.default.existsSync(worktreePath)) {
    session.git = {
      enabled: true,
      status: 'worktree_ready',
      worktreePath,
      branch,
      baseBranch,
    };
    session.updatedAt = Date.now();
    (0, session_store_1.saveSession)(session);
    return { sessionId, git: session.git };
  }
  try {
    await (0, exec_1.execGit)(['worktree', 'add', '-b', branch, worktreePath, baseBranch], root);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes('already exists')) {
      await (0, exec_1.execGit)(['worktree', 'add', worktreePath, branch], root);
    } else {
      session.git = { ...emptyGitMeta(), enabled: false, lastError: message };
      (0, session_store_1.saveSession)(session);
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
  (0, session_store_1.saveSession)(session);
  return { sessionId, git: session.git };
}
async function getGitStatus(sessionId) {
  const config = (0, agent_mode_1.getAgentConfig)();
  const root = (0, paths_1.getMonorepoRoot)();
  const session = (0, session_store_1.loadSession)(sessionId);
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
  if (!(0, exec_1.isGitRepository)(root)) {
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
  const ghAvailable = await (0, exec_1.hasGhCli)();
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
function writeStagedFilesToWorkspace(session, workspaceRoot) {
  const applied = [];
  const errors = [];
  const conflicts = [];
  for (const [filePath, staged] of Object.entries(session.files)) {
    const absPath = path_1.default.join(workspaceRoot, filePath);
    if (fs_1.default.existsSync(absPath) && staged.originalContent !== undefined && staged.type === 'modified') {
      try {
        const currentContent = fs_1.default.readFileSync(absPath, 'utf-8');
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
      const absPath = path_1.default.join(workspaceRoot, filePath);
      fs_1.default.mkdirSync(path_1.default.dirname(absPath), { recursive: true });
      fs_1.default.writeFileSync(absPath, staged.content, 'utf-8');
      applied.push(filePath);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`${filePath}: ${message}`);
    }
  }
  return { applied, errors, conflicts };
}
async function commitStagedSession(sessionId, commitMessage) {
  const session = (0, session_store_1.loadSession)(sessionId);
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
    await (0, exec_1.execGit)(['add', '-A'], git.worktreePath);
    const { stdout } = await (0, exec_1.execGit)(['commit', '-m', message], git.worktreePath);
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
    (0, session_store_1.saveSession)(session);
    return { applied, errors, conflicts, commitSha, branch: git.branch, message };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    errors.push(errMsg);
    return { applied, errors, conflicts, branch: git.branch, message };
  }
}
function defaultCommitMessage(sessionId, session) {
  const paths = Object.keys(session.files);
  const summary = paths.length === 1 ? paths[0].split('/').pop() : `${paths.length} files`;
  return `agent(${(0, paths_1.sanitizeSessionId)(sessionId)}): ${summary}`;
}
async function detectMergeConflicts(sessionId) {
  const session = (0, session_store_1.loadSession)(sessionId);
  const git = session.git;
  const root = (0, paths_1.getMonorepoRoot)();
  if (!git?.enabled || !git.branch) return [];
  try {
    const { stdout: baseSha } = await (0, exec_1.execGit)(['rev-parse', git.baseBranch], root);
    const { stdout: branchSha } = await (0, exec_1.execGit)(['rev-parse', git.branch], root);
    const { stdout: mergeTree } = await (0, exec_1.execGit)(['merge-tree', baseSha, baseSha, branchSha], root);
    const conflicts = [];
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
async function mergeAgentBranch(sessionId) {
  const session = (0, session_store_1.loadSession)(sessionId);
  const git = session.git;
  const root = (0, paths_1.getMonorepoRoot)();
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
    (0, session_store_1.saveSession)(session);
    return {
      merged: false,
      baseBranch: git.baseBranch,
      branch: git.branch,
      conflicts,
      errors: ['Merge blocked due to conflicts with base branch'],
    };
  }
  const message = `agent(${(0, paths_1.sanitizeSessionId)(sessionId)}): squash merge ${git.branch}`;
  try {
    await (0, exec_1.execGit)(['checkout', git.baseBranch], root);
    await (0, exec_1.execGit)(['merge', '--squash', git.branch], root);
    const { stdout } = await (0, exec_1.execGit)(['commit', '-m', message], root);
    const shaMatch = stdout.match(/\[[\w/-]+\s+([a-f0-9]+)\]/i);
    const commitSha = shaMatch?.[1];
    await cleanupGitSession(sessionId, { deleteBranch: true });
    session.git = { ...git, status: 'merged', commitSha };
    (0, session_store_1.saveSession)(session);
    return {
      merged: true,
      commitSha,
      baseBranch: git.baseBranch,
      branch: git.branch,
      conflicts: [],
      errors: [],
    };
  } catch (e) {
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
async function createPullRequest(sessionId, title, body) {
  const session = (0, session_store_1.loadSession)(sessionId);
  const git = session.git;
  const root = (0, paths_1.getMonorepoRoot)();
  if (!git?.enabled || git.status !== 'committed') {
    return { created: false, error: 'Commit to branch before opening a PR' };
  }
  if (!(await (0, exec_1.hasGhCli)())) {
    return { created: false, error: 'GitHub CLI (gh) not installed' };
  }
  const prTitle = title || `Agent Studio: ${git.branch}`;
  const prBody = body || `Automated changes from Agent Studio session \`${sessionId}\`.\n\nBranch: \`${git.branch}\``;
  try {
    await (0, exec_1.execGit)(['push', '-u', 'origin', git.branch], root);
    const url = await (0, exec_1.execGh)(
      ['pr', 'create', '--head', git.branch, '--base', git.baseBranch, '--title', prTitle, '--body', prBody],
      root,
    );
    session.git = { ...git, prUrl: url };
    (0, session_store_1.saveSession)(session);
    return { created: true, prUrl: url };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return { created: false, error: errMsg };
  }
}
async function cleanupGitSession(sessionId, options = {}) {
  const session = (0, session_store_1.loadSession)(sessionId);
  const git = session.git;
  const root = (0, paths_1.getMonorepoRoot)();
  if (!git?.worktreePath) return;
  try {
    if (fs_1.default.existsSync(git.worktreePath)) {
      await (0, exec_1.execGit)(['worktree', 'remove', '--force', git.worktreePath], root);
    }
  } catch {
    if (fs_1.default.existsSync(git.worktreePath)) {
      fs_1.default.rmSync(git.worktreePath, { recursive: true, force: true });
    }
  }
  if (options.deleteBranch && git.branch) {
    try {
      await (0, exec_1.execGit)(['branch', '-D', git.branch], root);
    } catch {
      // branch may already be merged/deleted
    }
  }
}
async function discardGitSession(sessionId) {
  await cleanupGitSession(sessionId, { deleteBranch: true });
  const session = (0, session_store_1.loadSession)(sessionId);
  session.files = {};
  session.git = { ...emptyGitMeta(), status: 'discarded' };
  session.updatedAt = Date.now();
  (0, session_store_1.saveSession)(session);
}
