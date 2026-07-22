'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.listDirRecursive = listDirRecursive;
exports.searchInDir = searchInDir;
exports.executeToolWithTimeout = executeToolWithTimeout;
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const paths_1 = require('../config/paths');
const session_store_1 = require('../changeset/session-store');
const limits_1 = require('../config/limits');
const session_store_2 = require('../changeset/session-store');
const binary_1 = require('./binary');
function listDirRecursive(dir, recursive, ext) {
  if (!fs_1.default.existsSync(dir)) return [];
  const results = [];
  const entries = fs_1.default.readdirSync(dir, { withFileTypes: true, encoding: 'utf-8' });
  for (const e of entries) {
    const full = path_1.default.join(dir, e.name);
    if (e.isDirectory()) {
      if (
        recursive &&
        !['node_modules', '.next', 'dist', '.git', '.agent-staging', '.agent-worktrees'].includes(e.name)
      ) {
        try {
          const real = fs_1.default.realpathSync(full);
          if (real !== path_1.default.resolve(full)) continue;
        } catch {
          continue;
        }
        results.push(...listDirRecursive(full, true, ext));
      }
    } else {
      if (!ext || e.name.endsWith(ext)) results.push(full);
    }
    if (results.length > limits_1.MAX_DIR_ENTRIES) {
      results.push(`...(truncated at ${limits_1.MAX_DIR_ENTRIES} entries)`);
      break;
    }
  }
  return results;
}
function searchInDir(dir, query, ext) {
  const files = listDirRecursive(dir, true, ext);
  const results = [];
  const lq = query.toLowerCase();
  for (const f of files.slice(0, 200)) {
    try {
      const lines = fs_1.default.readFileSync(f, 'utf-8').split('\n');
      lines.forEach((text, i) => {
        if (text.toLowerCase().includes(lq)) {
          results.push({ file: f, line: i + 1, text: text.trim().slice(0, 120) });
        }
      });
    } catch {
      // skip unreadable files
    }
    if (results.length > 50) break;
  }
  return results.slice(0, 50);
}
async function executeToolInner(name, input, sessionId) {
  const root = (0, session_store_1.getWorkspaceRoot)(sessionId);
  if (name === 'read_file') {
    const filePath = String(input.path ?? '');
    const absPath = path_1.default.join(root, filePath);
    if (!fs_1.default.existsSync(absPath)) return `Error: File not found: ${filePath}`;
    try {
      const stat = fs_1.default.statSync(absPath);
      if (stat.size > limits_1.MAX_FILE_SIZE) {
        return `Error: File too large (${(stat.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed: ${(limits_1.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB.`;
      }
      const buffer = fs_1.default.readFileSync(absPath);
      if ((0, binary_1.isBinary)(buffer)) {
        return 'Error: Binary file — cannot display content.';
      }
      const content = buffer.toString('utf-8');
      return content.length > limits_1.MAX_READ_CHARS
        ? content.slice(0, limits_1.MAX_READ_CHARS) + '\n... (truncated to 8000 chars)'
        : content;
    } catch (e) {
      const err = e;
      if (err.code === 'EACCES') return `Error: Permission denied reading file: ${filePath}`;
      const message = e instanceof Error ? e.message : String(e);
      return `Error reading file: ${message}`;
    }
  }
  if (name === 'list_files') {
    const dirPath = String(input.path ?? '');
    const absPath = path_1.default.join(root, dirPath);
    if (!fs_1.default.existsSync(absPath)) return `Error: Directory not found: ${dirPath}`;
    try {
      const files = listDirRecursive(absPath, input.recursive === true);
      return files.map((f) => path_1.default.relative(root, f)).join('\n') || '(empty directory)';
    } catch (e) {
      const err = e;
      if (err.code === 'EACCES') return `Error: Permission denied listing directory: ${dirPath}`;
      const message = e instanceof Error ? e.message : String(e);
      return `Error listing files: ${message}`;
    }
  }
  if (name === 'write_file') {
    const session = (0, session_store_2.loadSession)(sessionId);
    const fileCount = Object.keys(session.files).length;
    if (fileCount >= limits_1.MAX_STAGED_FILES_PER_SESSION) {
      return JSON.stringify({
        error: true,
        message: `Session has reached the maximum of ${limits_1.MAX_STAGED_FILES_PER_SESSION} staged files. Please apply or discard before staging more.`,
        staged: false,
      });
    }
    const staged = (0, session_store_2.stageFile)(sessionId, {
      path: String(input.path ?? ''),
      content: String(input.content ?? ''),
      description: String(input.description ?? ''),
    });
    return JSON.stringify({ staged: true, path: input.path, type: staged.type });
  }
  if (name === 'search_code') {
    const searchRoot = input.directory ? path_1.default.join(root, String(input.directory)) : root;
    const results = searchInDir(searchRoot, String(input.query ?? ''), input.file_extension);
    if (results.length === 0) return 'No matches found.';
    return results.map((r) => `${path_1.default.relative(root, r.file)}:${r.line}: ${r.text}`).join('\n');
  }
  return `Unknown tool: ${name}`;
}
async function executeToolWithTimeout(name, input, sessionId) {
  const timeout = limits_1.TOOL_TIMEOUTS[name] || 10000;
  if (['read_file', 'write_file'].includes(name) && input.path) {
    const filePath = String(input.path);
    if (!(0, paths_1.isPathAllowed)(filePath)) {
      return `Error: Access denied. Path "${filePath}" is outside allowed directories (apps/web/, apps/api/, packages/, docs/, scripts/).`;
    }
    if ((0, paths_1.isSensitiveFile)(filePath)) {
      return `Error: Access denied. "${filePath}" is a sensitive file and cannot be read or modified.`;
    }
  }
  return Promise.race([
    executeToolInner(name, input, sessionId),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Tool "${name}" timed out after ${timeout}ms`)), timeout),
    ),
  ]);
}
