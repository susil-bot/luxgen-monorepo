import path from 'path';

export function getMonorepoRoot(): string {
  const cwd = process.cwd();
  if (cwd.endsWith('apps/web') || cwd.endsWith('apps\\web')) {
    return path.resolve(cwd, '../..');
  }
  return cwd;
}

export function getStagingDir(): string {
  const root = getMonorepoRoot();
  return path.join(root, 'apps', 'web', '.agent-staging');
}

export function getWorktreesDir(): string {
  return path.join(getMonorepoRoot(), '.agent-worktrees');
}

export function getWorktreePath(sessionId: string): string {
  return path.join(getWorktreesDir(), sanitizeSessionId(sessionId));
}

/** Throwaway worktree for squash-merging an agent branch onto base without touching repo root. */
export function getMergeWorktreePath(sessionId: string): string {
  return path.join(getWorktreesDir(), `merge-${sanitizeSessionId(sessionId)}`);
}

export function getAgentBranchName(sessionId: string): string {
  return `agent/${sanitizeSessionId(sessionId)}`;
}

export function sanitizeSessionId(sessionId: string): string {
  return sessionId.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 64);
}

export const ALLOWED_PATHS = ['apps/web/', 'apps/api/', 'packages/', 'docs/', 'scripts/'];

export const ALLOWED_COMMANDS = ['npm', 'npx', 'node'] as const;

export type AllowedCommand = (typeof ALLOWED_COMMANDS)[number];

export function isAllowedCommand(command: string): command is AllowedCommand {
  return (ALLOWED_COMMANDS as readonly string[]).includes(command);
}

const FETCH_URL_HOST_SUFFIXES = ['npmjs.com', 'github.com', 'githubusercontent.com', 'raw.githubusercontent.com'];

/** Host must match allowlist; `docs.*` subdomains allowed. Localhost blocked in production. */
export function isFetchUrlAllowed(urlString: string, deploymentMode: string): boolean {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('10.') || host.startsWith('192.168.')) {
    return deploymentMode !== 'production' && deploymentMode !== 'staging';
  }
  if (host.startsWith('docs.') || host.split('.').includes('docs')) return true;
  return FETCH_URL_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

export function isPathAllowed(relativePath: string): boolean {
  return ALLOWED_PATHS.some((allowed) => relativePath.startsWith(allowed));
}

export const SENSITIVE_FILE_PATTERNS = [
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

export function isSensitiveFile(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  return SENSITIVE_FILE_PATTERNS.some((pattern) => lower.includes(pattern));
}
