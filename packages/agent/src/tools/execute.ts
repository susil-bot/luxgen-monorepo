import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import readline from 'readline';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { getAgentConfig } from '../config/agent-mode';
import {
  isPathAllowed,
  isSensitiveFile,
  isAllowedCommand,
  isFetchUrlAllowed,
  getMonorepoRoot,
} from '../config/paths';
import { getWorkspaceRoot } from '../changeset/session-store';
import {
  MAX_DIR_ENTRIES,
  MAX_FILE_SIZE,
  MAX_READ_CHARS,
  MAX_STAGED_FILES_PER_SESSION,
  TOOL_TIMEOUTS,
  DEFAULT_SEARCH_RESULTS,
  MAX_SEARCH_RESULTS,
  MAX_COMMAND_OUTPUT_CHARS,
  MAX_FETCH_URL_CHARS,
  STREAM_READ_FILE_THRESHOLD,
} from '../config/limits';
import { loadSession, saveSession, stageFile } from '../changeset/session-store';
import { AUTOMATION_SCHEMA_DOC } from '../automation/events';
import { isBinary } from './binary';
import type { StagedFile } from '../types/session';

const execFileAsync = promisify(execFile);

export interface CodeSearchMatch {
  file: string;
  line: number;
  text: string;
}

export interface CodeSearchResult {
  results: CodeSearchMatch[];
  total: number;
  hasMore: boolean;
}

const SKIP_DIR_NAMES = new Set(['node_modules', '.next', 'dist', '.git', '.agent-staging', '.agent-worktrees']);

function* walkFiles(dir: string, recursive: boolean, ext?: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true, encoding: 'utf-8' });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (recursive && !SKIP_DIR_NAMES.has(e.name)) {
        try {
          const real = fs.realpathSync(full);
          if (real !== path.resolve(full)) continue;
        } catch {
          continue;
        }
        yield* walkFiles(full, true, ext);
      }
    } else if (!ext || e.name.endsWith(ext)) {
      yield full;
      count++;
      if (count >= MAX_DIR_ENTRIES) {
        yield `...(truncated at ${MAX_DIR_ENTRIES} entries)`;
        return;
      }
    }
  }
}

export function listDirRecursive(dir: string, recursive: boolean, ext?: string): string[] {
  return [...walkFiles(dir, recursive, ext)];
}

async function searchLinesInFile(
  filePath: string,
  lq: string,
): Promise<Array<{ line: number; text: string }>> {
  const hits: Array<{ line: number; text: string }> = [];
  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return hits;
  }
  if (stat.size > MAX_FILE_SIZE) return hits;

  const scanLine = (text: string, lineNo: number) => {
    if (text.toLowerCase().includes(lq)) {
      hits.push({ line: lineNo, text: text.trim().slice(0, 120) });
    }
  };

  if (stat.size <= STREAM_READ_FILE_THRESHOLD) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    lines.forEach((text, i) => scanLine(text, i + 1));
    return hits;
  }

  const rl = readline.createInterface({ input: createReadStream(filePath, 'utf-8'), crlfDelay: Infinity });
  let lineNo = 0;
  for await (const line of rl) {
    lineNo++;
    scanLine(line, lineNo);
  }
  return hits;
}

export async function searchInDir(
  dir: string,
  query: string,
  options: { ext?: string; maxResults?: number; offset?: number } = {},
): Promise<CodeSearchResult> {
  const maxResults = Math.min(Math.max(options.maxResults ?? DEFAULT_SEARCH_RESULTS, 1), MAX_SEARCH_RESULTS);
  const offset = Math.max(options.offset ?? 0, 0);
  const lq = query.toLowerCase();
  const allMatches: CodeSearchMatch[] = [];

  for (const f of walkFiles(dir, true, options.ext)) {
    if (f.startsWith('...(truncated')) continue;
    const lineHits = await searchLinesInFile(f, lq);
    for (const hit of lineHits) {
      allMatches.push({ file: f, ...hit });
    }
    if (allMatches.length >= offset + maxResults + 1) break;
  }

  const page = allMatches.slice(offset, offset + maxResults);
  return {
    results: page,
    total: allMatches.length,
    hasMore: allMatches.length > offset + maxResults,
  };
}

function capOutput(text: string, max = MAX_COMMAND_OUTPUT_CHARS): string {
  return text.length > max ? text.slice(0, max) + '\n... (truncated)' : text;
}

async function executeToolInner(name: string, input: Record<string, unknown>, sessionId: string): Promise<string> {
  const root = getWorkspaceRoot(sessionId);
  const repoRoot = getMonorepoRoot();

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
    const maxResults =
      input.maxResults !== undefined ? Number(input.maxResults) : DEFAULT_SEARCH_RESULTS;
    const offset = input.offset !== undefined ? Number(input.offset) : 0;
    const search = await searchInDir(searchRoot, String(input.query ?? ''), {
      ext: input.file_extension as string | undefined,
      maxResults: Number.isFinite(maxResults) ? maxResults : DEFAULT_SEARCH_RESULTS,
      offset: Number.isFinite(offset) ? offset : 0,
    });
    if (search.results.length === 0) return 'No matches found.';
    const lines = search.results.map((r) => `${path.relative(root, r.file)}:${r.line}: ${r.text}`);
    const header = search.hasMore ? `\n(showing ${search.results.length} of ${search.total}+ matches; use offset to page)` : '';
    return lines.join('\n') + header;
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

  if (name === 'rename_file') {
    const fromPath = String(input.from_path ?? '');
    const toPath = String(input.to_path ?? '');
    const description = String(input.description ?? `Rename ${fromPath} → ${toPath}`);
    const absFrom = path.join(root, fromPath);

    if (!fs.existsSync(absFrom)) {
      return JSON.stringify({ error: true, message: `Source file not found: ${fromPath}` });
    }

    const content = fs.readFileSync(absFrom, 'utf-8');
    stageFile(sessionId, { path: toPath, content, description });

    const session = loadSession(sessionId);
    const originalContent = content;
    session.files[fromPath] = {
      path: fromPath,
      content: '',
      originalContent,
      type: 'modified',
      description: `RENAMED to ${toPath}: ${description}`,
      stagedAt: Date.now(),
      pendingDelete: true,
    } as StagedFile & { pendingDelete: boolean };
    session.updatedAt = Date.now();
    saveSession(session);

    return JSON.stringify({ staged: true, from: fromPath, to: toPath, type: 'rename' });
  }

  if (name === 'run_command') {
    const command = String(input.command ?? '');
    if (!isAllowedCommand(command)) {
      return `Error: Command "${command}" is not allowed. Allowed: npm, npx, node.`;
    }
    const args = Array.isArray(input.args) ? input.args.map(String) : [];
    const blocked = ['rm', 'curl', 'wget', 'sudo', 'chmod', 'push'];
    if (args.some((a) => blocked.some((b) => a.includes(b)))) {
      return 'Error: Command arguments contain blocked tokens.';
    }
    const cwdRel = input.cwd ? String(input.cwd) : '.';
    if (!isPathAllowed(cwdRel) && cwdRel !== '.' && cwdRel !== '') {
      return `Error: cwd "${cwdRel}" is outside allowed directories.`;
    }
    const cwd = path.resolve(repoRoot, cwdRel);
    try {
      const { stdout, stderr } = await execFileAsync(command, args, {
        cwd,
        timeout: TOOL_TIMEOUTS.run_command,
        maxBuffer: MAX_COMMAND_OUTPUT_CHARS * 2,
      });
      return capOutput([stdout, stderr].filter(Boolean).join('\n') || '(no output)');
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string; message?: string };
      const out = [err.stdout, err.stderr, err.message].filter(Boolean).join('\n');
      return capOutput(out || 'Command failed');
    }
  }

  if (name === 'fetch_url') {
    const url = String(input.url ?? '');
    const mode = getAgentConfig().mode;
    if (!isFetchUrlAllowed(url, mode)) {
      return `Error: URL not allowed (${mode} mode). Use https URLs on docs.*, npmjs.com, or github.com.`;
    }
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
      if (!res.ok) return `Error: HTTP ${res.status} for ${url}`;
      const text = await res.text();
      return text.length > MAX_FETCH_URL_CHARS
        ? text.slice(0, MAX_FETCH_URL_CHARS) + '\n... (truncated)'
        : text;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return `Error fetching URL: ${message}`;
    }
  }

  if (name === 'read_project_config') {
    const workspace = String(input.workspace ?? 'apps/web');
    if (!isPathAllowed(workspace.endsWith('/') ? workspace : `${workspace}/`)) {
      return `Error: workspace "${workspace}" is outside allowed directories.`;
    }
    const wsRoot = path.join(repoRoot, workspace);
    const pkgPath = path.join(wsRoot, 'package.json');
    const tsPath = path.join(wsRoot, 'tsconfig.json');
    const out: Record<string, unknown> = { workspace };
    if (fs.existsSync(pkgPath)) {
      out.packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    }
    if (fs.existsSync(tsPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsPath, 'utf-8')) as { compilerOptions?: { paths?: unknown } };
      out.tsconfigPaths = tsconfig.compilerOptions?.paths ?? {};
    }
    return JSON.stringify(out, null, 2);
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

  const pathKeys = ['path', 'from_path', 'to_path'] as const;
  for (const key of pathKeys) {
    if (!input[key]) continue;
    if (!['read_file', 'write_file', 'delete_file', 'list_files', 'rename_file'].includes(name)) continue;
    const filePath = String(input[key]);
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
