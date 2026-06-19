'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.GitCommandError = void 0;
exports.execGit = execGit;
exports.isGitRepository = isGitRepository;
exports.getCurrentBranch = getCurrentBranch;
exports.hasGhCli = hasGhCli;
exports.execGh = execGh;
const child_process_1 = require('child_process');
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const util_1 = require('util');
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
class GitCommandError extends Error {
  constructor(message, args, cwd) {
    super(message);
    this.args = args;
    this.cwd = cwd;
    this.name = 'GitCommandError';
  }
}
exports.GitCommandError = GitCommandError;
async function execGit(args, cwd, timeoutMs = 60000) {
  try {
    const { stdout, stderr } = await execFileAsync('git', args, {
      cwd,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf-8',
    });
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (e) {
    const err = e;
    const detail = [err.stderr, err.stdout, err.message].filter(Boolean).join('\n').trim();
    throw new GitCommandError(detail || 'git command failed', args, cwd);
  }
}
function isGitRepository(root) {
  return fs_1.default.existsSync(path_1.default.join(root, '.git'));
}
async function getCurrentBranch(root) {
  const { stdout } = await execGit(['rev-parse', '--abbrev-ref', 'HEAD'], root);
  return stdout;
}
async function hasGhCli() {
  try {
    await execFileAsync('gh', ['--version'], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
async function execGh(args, cwd) {
  const { stdout } = await execFileAsync('gh', args, {
    cwd,
    timeout: 60000,
    encoding: 'utf-8',
  });
  return stdout.trim();
}
