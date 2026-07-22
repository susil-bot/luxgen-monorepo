import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export class GitCommandError extends Error {
  constructor(
    message: string,
    public readonly args: string[],
    public readonly cwd: string,
  ) {
    super(message);
    this.name = 'GitCommandError';
  }
}

export async function execGit(
  args: string[],
  cwd: string,
  timeoutMs = 60_000,
): Promise<{ stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await execFileAsync('git', args, {
      cwd,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf-8',
    });
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    const detail = [err.stderr, err.stdout, err.message].filter(Boolean).join('\n').trim();
    throw new GitCommandError(detail || 'git command failed', args, cwd);
  }
}

export function isGitRepository(root: string): boolean {
  return fs.existsSync(path.join(root, '.git'));
}

export async function getCurrentBranch(root: string): Promise<string> {
  const { stdout } = await execGit(['rev-parse', '--abbrev-ref', 'HEAD'], root);
  return stdout;
}

export async function hasGhCli(): Promise<boolean> {
  try {
    await execFileAsync('gh', ['--version'], { timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}

export async function execGh(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync('gh', args, {
    cwd,
    timeout: 60_000,
    encoding: 'utf-8',
  });
  return stdout.trim();
}
