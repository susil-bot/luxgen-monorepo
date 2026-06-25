import fs from 'fs';
import path from 'path';
import type { AgentSession, ApplyResult, StagedFile } from '../types/session';
import { getMonorepoRoot, getStagingDir } from '../config/paths';
import { syncSessionToMongo } from '../persistence/mongo';

export function getWorkspaceRoot(sessionId: string): string {
  const session = loadSession(sessionId);
  if (session.git?.enabled && session.git.worktreePath && fs.existsSync(session.git.worktreePath)) {
    return session.git.worktreePath;
  }
  return getMonorepoRoot();
}

export function isGitWorktreeActive(sessionId: string): boolean {
  const session = loadSession(sessionId);
  return Boolean(session.git?.enabled && session.git.worktreePath && fs.existsSync(session.git.worktreePath));
}

export function getSessionPath(sessionId: string): string {
  return path.join(getStagingDir(), `${sessionId}.json`);
}

export function loadSession(sessionId: string): AgentSession {
  const file = getSessionPath(sessionId);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as AgentSession;
  }
  return { id: sessionId, files: {}, createdAt: Date.now(), updatedAt: Date.now() };
}

export function saveSession(session: AgentSession): void {
  const dir = getStagingDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = getSessionPath(session.id);
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(session, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
  void syncSessionToMongo(session).catch(() => {});
}

export const MAX_SESSION_MESSAGES = 50;

export function saveSessionMessages(
  sessionId: string,
  turns: Array<{ role: 'user' | 'assistant'; content: string }>,
): void {
  if (turns.length === 0) return;
  const session = loadSession(sessionId);
  const now = Date.now();
  const appended = turns.map((m, i) => ({
    role: m.role,
    content: m.content,
    timestamp: now + i,
  }));
  session.messages = [...(session.messages ?? []), ...appended].slice(-MAX_SESSION_MESSAGES);
  session.updatedAt = Date.now();
  saveSession(session);
}

export function stageFile(
  sessionId: string,
  staged: Omit<StagedFile, 'stagedAt' | 'type' | 'originalContent'>,
): StagedFile {
  const session = loadSession(sessionId);
  const root = getWorkspaceRoot(sessionId);
  const absPath = path.join(root, staged.path);

  let originalContent: string | undefined;
  if (fs.existsSync(absPath)) {
    originalContent = fs.readFileSync(absPath, 'utf-8');
  }

  const file: StagedFile = {
    ...staged,
    originalContent,
    type: originalContent !== undefined ? 'modified' : 'new',
    stagedAt: Date.now(),
  };

  session.files[staged.path] = file;
  session.updatedAt = Date.now();
  saveSession(session);
  return file;
}

export function applySession(sessionId: string): ApplyResult {
  const session = loadSession(sessionId);
  const root = getWorkspaceRoot(sessionId);
  const useGit = isGitWorktreeActive(sessionId);
  const applied: string[] = [];
  const errors: string[] = [];
  const conflicts: string[] = [];

  for (const [filePath, staged] of Object.entries(session.files)) {
    const absPath = path.join(root, filePath);
    if (fs.existsSync(absPath) && staged.originalContent !== undefined && staged.type === 'modified') {
      try {
        const currentContent = fs.readFileSync(absPath, 'utf-8');
        if (currentContent !== staged.originalContent) {
          conflicts.push(filePath);
        }
      } catch {
        // proceed with apply
      }
    }
  }

  if (conflicts.length > 0 && !useGit) {
    return {
      applied: [],
      errors: [],
      conflicts,
      blocked: true,
      mode: 'filesystem',
    };
  }

  for (const [filePath, staged] of Object.entries(session.files)) {
    try {
      const absPath = path.join(root, filePath);
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

  session.files = {};
  session.updatedAt = Date.now();
  saveSession(session);

  return {
    applied,
    errors,
    conflicts,
    mode: useGit ? 'worktree' : 'filesystem',
    branch: useGit ? session.git?.branch : undefined,
  };
}

export function discardSession(sessionId: string): void {
  const session = loadSession(sessionId);
  session.files = {};
  session.updatedAt = Date.now();
  saveSession(session);
}

/** Delete all session JSON files older than `maxAgeMs` (default 7 days). */
export function pruneOldSessions(maxAgeMs = 7 * 24 * 60 * 60 * 1000): number {
  const dir = getStagingDir();
  if (!fs.existsSync(dir)) return 0;

  const now = Date.now();
  let pruned = 0;

  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.json')) continue;
    const filePath = path.join(dir, name);
    try {
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        pruned++;
      }
    } catch {
      // skip unreadable files
    }
  }

  return pruned;
}
