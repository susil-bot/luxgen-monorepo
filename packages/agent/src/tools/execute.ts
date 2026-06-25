import fs from 'fs';
import path from 'path';
import { isPathAllowed, isSensitiveFile } from '../config/paths';
import { getWorkspaceRoot } from '../changeset/session-store';
import {
  MAX_DIR_ENTRIES,
  MAX_FILE_SIZE,
  MAX_READ_CHARS,
  MAX_STAGED_FILES_PER_SESSION,
  TOOL_TIMEOUTS,
} from '../config/limits';
import { loadSession, saveSession, stageFile } from '../changeset/session-store';
import { AUTOMATION_SCHEMA_DOC } from '../automation/events';
import { isBinary } from './binary';
import type { StagedFile } from '../types/session';

export function listDirRecursive(dir: string, recursive: boolean, ext?: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true, encoding: 'utf-8' });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (
        recursive &&
        !['node_modules', '.next', 'dist', '.git', '.agent-staging', '.agent-worktrees'].includes(e.name)
      ) {
        try {
          const real = fs.realpathSync(full);
          if (real !== path.resolve(full)) continue;
        } catch {
          continue;
        }
        results.push(...listDirRecursive(full, true, ext));
      }
    } else {
      if (!ext || e.name.endsWith(ext)) results.push(full);
    }
    if (results.length > MAX_DIR_ENTRIES) {
      results.push(`...(truncated at ${MAX_DIR_ENTRIES} entries)`);
      break;
    }
  }
  return results;
}

export function searchInDir(
  dir: string,
  query: string,
  ext?: string,
): Array<{ file: string; line: number; text: string }> {
  const files = listDirRecursive(dir, true, ext);
  const results: Array<{ file: string; line: number; text: string }> = [];
  const lq = query.toLowerCase();
  for (const f of files.slice(0, 200)) {
    try {
      const lines = fs.readFileSync(f, 'utf-8').split('\n');
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

async function executeToolInner(name: string, input: Record<string, unknown>, sessionId: string): Promise<string> {
  const root = getWorkspaceRoot(sessionId);

  if (name === 'read_file') {
    const filePath = String(input.path ?? '');
    const absPath = path.join(root, filePath);
    if (!fs.existsSync(absPath)) return `Error: File not found: ${filePath}`;
    try {
      const stat = fs.statSync(absPath);
      if (stat.size > MAX_FILE_SIZE) {
        return `Error: File too large (${(stat.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB.`;
      }
      const buffer = fs.readFileSync(absPath);
      if (isBinary(buffer)) {
        return 'Error: Binary file — cannot display content.';
      }
      const content = buffer.toString('utf-8');
      return content.length > MAX_READ_CHARS
        ? content.slice(0, MAX_READ_CHARS) + '\n... (truncated to 8000 chars)'
        : content;
    } catch (e: unknown) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === 'EACCES') return `Error: Permission denied reading file: ${filePath}`;
      const message = e instanceof Error ? e.message : String(e);
      return `Error reading file: ${message}`;
    }
  }

  if (name === 'list_files') {
    const dirPath = String(input.path ?? '');
    const absPath = path.join(root, dirPath);
    if (!fs.existsSync(absPath)) return `Error: Directory not found: ${dirPath}`;
    try {
      const files = listDirRecursive(absPath, input.recursive === true);
      return files.map((f) => path.relative(root, f)).join('\n') || '(empty directory)';
    } catch (e: unknown) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === 'EACCES') return `Error: Permission denied listing directory: ${dirPath}`;
      const message = e instanceof Error ? e.message : String(e);
      return `Error listing files: ${message}`;
    }
  }

  if (name === 'write_file') {
    const session = loadSession(sessionId);
    const fileCount = Object.keys(session.files).length;
    if (fileCount >= MAX_STAGED_FILES_PER_SESSION) {
      return JSON.stringify({
        error: true,
        message: `Session has reached the maximum of ${MAX_STAGED_FILES_PER_SESSION} staged files. Please apply or discard before staging more.`,
        staged: false,
      });
    }

    const staged = stageFile(sessionId, {
      path: String(input.path ?? ''),
      content: String(input.content ?? ''),
      description: String(input.description ?? ''),
    });
    return JSON.stringify({ staged: true, path: input.path, type: staged.type });
  }

  if (name === 'search_code') {
    const searchRoot = input.directory ? path.join(root, String(input.directory)) : root;
    const results = searchInDir(searchRoot, String(input.query ?? ''), input.file_extension as string | undefined);
    if (results.length === 0) return 'No matches found.';
    return results.map((r) => `${path.relative(root, r.file)}:${r.line}: ${r.text}`).join('\n');
  }

  if (name === 'delete_file') {
    const session = loadSession(sessionId);
    const filePath = String(input.path ?? '');
    const reason = String(input.reason ?? '');
    const absPath = path.join(root, filePath);

    if (!fs.existsSync(absPath)) {
      return JSON.stringify({ error: true, message: `File not found: ${filePath}` });
    }

    const originalContent = fs.readFileSync(absPath, 'utf-8');
    session.files[filePath] = {
      path: filePath,
      content: '',
      originalContent,
      type: 'modified',
      description: `DELETE: ${reason}`,
      stagedAt: Date.now(),
      pendingDelete: true,
    } as StagedFile & { pendingDelete: boolean };
    session.updatedAt = Date.now();
    saveSession(session);

    return JSON.stringify({ staged: true, path: filePath, type: 'deleted' });
  }

  if (name === 'read_automation_schema') {
    return JSON.stringify(AUTOMATION_SCHEMA_DOC, null, 2);
  }

  return `Unknown tool: ${name}`;
}

export async function executeToolWithTimeout(
  name: string,
  input: Record<string, unknown>,
  sessionId: string,
): Promise<string> {
  const timeout = TOOL_TIMEOUTS[name] || 10_000;

  if (['read_file', 'write_file', 'delete_file', 'list_files'].includes(name) && input.path) {
    const filePath = String(input.path);
    if (!isPathAllowed(filePath)) {
      return `Error: Access denied. Path "${filePath}" is outside allowed directories (apps/web/, apps/api/, packages/, docs/, scripts/).`;
    }
    if (isSensitiveFile(filePath)) {
      return `Error: Access denied. "${filePath}" is a sensitive file and cannot be read or modified.`;
    }
  }

  if (name === 'search_code' && input.directory) {
    const dir = String(input.directory);
    if (!isPathAllowed(dir) && dir !== '.' && dir !== '') {
      return `Error: Access denied. Directory "${dir}" is outside allowed directories.`;
    }
  }

  return Promise.race([
    executeToolInner(name, input, sessionId),
    new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error(`Tool "${name}" timed out after ${timeout}ms`)), timeout),
    ),
  ]);
}
