'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getWorkspaceRoot = getWorkspaceRoot;
exports.isGitWorktreeActive = isGitWorktreeActive;
exports.getSessionPath = getSessionPath;
exports.loadSession = loadSession;
exports.saveSession = saveSession;
exports.stageFile = stageFile;
exports.applySession = applySession;
exports.discardSession = discardSession;
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const paths_1 = require('../config/paths');
const mongo_1 = require('../persistence/mongo');
function getWorkspaceRoot(sessionId) {
  const session = loadSession(sessionId);
  if (session.git?.enabled && session.git.worktreePath && fs_1.default.existsSync(session.git.worktreePath)) {
    return session.git.worktreePath;
  }
  return (0, paths_1.getMonorepoRoot)();
}
function isGitWorktreeActive(sessionId) {
  const session = loadSession(sessionId);
  return Boolean(session.git?.enabled && session.git.worktreePath && fs_1.default.existsSync(session.git.worktreePath));
}
function getSessionPath(sessionId) {
  return path_1.default.join((0, paths_1.getStagingDir)(), `${sessionId}.json`);
}
function loadSession(sessionId) {
  const file = getSessionPath(sessionId);
  if (fs_1.default.existsSync(file)) {
    return JSON.parse(fs_1.default.readFileSync(file, 'utf-8'));
  }
  return { id: sessionId, files: {}, createdAt: Date.now(), updatedAt: Date.now() };
}
function saveSession(session) {
  const dir = (0, paths_1.getStagingDir)();
  if (!fs_1.default.existsSync(dir)) fs_1.default.mkdirSync(dir, { recursive: true });
  const filePath = getSessionPath(session.id);
  const tmpPath = filePath + '.tmp';
  fs_1.default.writeFileSync(tmpPath, JSON.stringify(session, null, 2), 'utf-8');
  fs_1.default.renameSync(tmpPath, filePath);
  void (0, mongo_1.syncSessionToMongo)(session).catch(() => {});
}
function stageFile(sessionId, staged) {
  const session = loadSession(sessionId);
  const root = getWorkspaceRoot(sessionId);
  const absPath = path_1.default.join(root, staged.path);
  let originalContent;
  if (fs_1.default.existsSync(absPath)) {
    originalContent = fs_1.default.readFileSync(absPath, 'utf-8');
  }
  const file = {
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
function applySession(sessionId) {
  const session = loadSession(sessionId);
  const root = getWorkspaceRoot(sessionId);
  const useGit = isGitWorktreeActive(sessionId);
  const applied = [];
  const errors = [];
  const conflicts = [];
  for (const [filePath, staged] of Object.entries(session.files)) {
    const absPath = path_1.default.join(root, filePath);
    if (fs_1.default.existsSync(absPath) && staged.originalContent !== undefined && staged.type === 'modified') {
      try {
        const currentContent = fs_1.default.readFileSync(absPath, 'utf-8');
        if (currentContent !== staged.originalContent) {
          conflicts.push(filePath);
        }
      } catch {
        // proceed with apply
      }
    }
  }
  for (const [filePath, staged] of Object.entries(session.files)) {
    try {
      const absPath = path_1.default.join(root, filePath);
      fs_1.default.mkdirSync(path_1.default.dirname(absPath), { recursive: true });
      fs_1.default.writeFileSync(absPath, staged.content, 'utf-8');
      applied.push(filePath);
    } catch (e) {
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
function discardSession(sessionId) {
  const session = loadSession(sessionId);
  session.files = {};
  session.updatedAt = Date.now();
  saveSession(session);
}
