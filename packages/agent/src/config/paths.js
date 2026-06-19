'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.SENSITIVE_FILE_PATTERNS = exports.ALLOWED_PATHS = void 0;
exports.getMonorepoRoot = getMonorepoRoot;
exports.getStagingDir = getStagingDir;
exports.getWorktreesDir = getWorktreesDir;
exports.getWorktreePath = getWorktreePath;
exports.getAgentBranchName = getAgentBranchName;
exports.sanitizeSessionId = sanitizeSessionId;
exports.isPathAllowed = isPathAllowed;
exports.isSensitiveFile = isSensitiveFile;
const path_1 = __importDefault(require('path'));
function getMonorepoRoot() {
  const cwd = process.cwd();
  if (cwd.endsWith('apps/web') || cwd.endsWith('apps\\web')) {
    return path_1.default.resolve(cwd, '../..');
  }
  return cwd;
}
function getStagingDir() {
  const root = getMonorepoRoot();
  return path_1.default.join(root, 'apps', 'web', '.agent-staging');
}
function getWorktreesDir() {
  return path_1.default.join(getMonorepoRoot(), '.agent-worktrees');
}
function getWorktreePath(sessionId) {
  return path_1.default.join(getWorktreesDir(), sanitizeSessionId(sessionId));
}
function getAgentBranchName(sessionId) {
  return `agent/${sanitizeSessionId(sessionId)}`;
}
function sanitizeSessionId(sessionId) {
  return sessionId.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 64);
}
exports.ALLOWED_PATHS = ['apps/web/', 'apps/api/', 'packages/', 'docs/', 'scripts/'];
function isPathAllowed(relativePath) {
  return exports.ALLOWED_PATHS.some((allowed) => relativePath.startsWith(allowed));
}
exports.SENSITIVE_FILE_PATTERNS = [
  '.env',
  '.pem',
  '.key',
  'credentials',
  'id_rsa',
  'id_dsa',
  'secret',
  'password',
  'token',
  '.gitconfig',
  '.netrc',
];
function isSensitiveFile(filePath) {
  const lower = filePath.toLowerCase();
  return exports.SENSITIVE_FILE_PATTERNS.some((pattern) => lower.includes(pattern));
}
