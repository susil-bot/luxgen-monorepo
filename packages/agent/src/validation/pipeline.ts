import { execFile } from 'child_process';
import { promisify } from 'util';
import { getMonorepoRoot } from '../config/paths';
import { loadSession, saveSession } from '../changeset/session-store';
import type { ValidationCheckName, ValidationCheckResult, ValidationResult } from '../types/validation';

const execFileAsync = promisify(execFile);

interface ScopeCheck {
  name: ValidationCheckName;
  scope: string;
  cwd: string;
  command: string;
  args: string[];
}

const SCOPE_CHECKS: Array<{ prefix: string; checks: ScopeCheck[] }> = [
  {
    prefix: 'apps/web/',
    checks: [
      {
        name: 'lint',
        scope: 'apps/web',
        cwd: 'apps/web',
        command: 'npx',
        args: ['next', 'lint', '--dir', 'pages', '--dir', 'components'],
      },
      {
        name: 'typecheck',
        scope: 'apps/web',
        cwd: 'apps/web',
        command: 'npx',
        args: ['tsc', '--noEmit'],
      },
    ],
  },
  {
    prefix: 'apps/api/',
    checks: [
      {
        name: 'typecheck',
        scope: 'apps/api',
        cwd: 'apps/api',
        command: 'npx',
        args: ['tsc', '--noEmit'],
      },
      {
        name: 'test',
        scope: 'apps/api',
        cwd: 'apps/api',
        command: 'npm',
        args: ['test', '--', '--passWithNoTests', '--watchAll=false'],
      },
    ],
  },
  {
    prefix: 'packages/ui/',
    checks: [
      {
        name: 'typecheck',
        scope: 'packages/ui',
        cwd: 'packages/ui',
        command: 'npx',
        args: ['tsc', '--noEmit'],
      },
    ],
  },
  {
    prefix: 'packages/agent/',
    checks: [
      {
        name: 'typecheck',
        scope: 'packages/agent',
        cwd: 'packages/agent',
        command: 'npx',
        args: ['tsc', '--noEmit'],
      },
    ],
  },
];

function getChecksForSession(sessionId: string): ScopeCheck[] {
  const session = loadSession(sessionId);
  const paths = Object.keys(session.files);
  const checks: ScopeCheck[] = [];
  const seen = new Set<string>();

  for (const filePath of paths) {
    for (const group of SCOPE_CHECKS) {
      if (!filePath.startsWith(group.prefix)) continue;
      for (const check of group.checks) {
        const key = `${check.scope}:${check.name}`;
        if (!seen.has(key)) {
          seen.add(key);
          checks.push(check);
        }
      }
    }
  }

  return checks;
}

async function runCheck(root: string, check: ScopeCheck): Promise<ValidationCheckResult> {
  const start = Date.now();
  const cwd = `${root}/${check.cwd}`;
  try {
    const { stdout, stderr } = await execFileAsync(check.command, check.args, {
      cwd,
      timeout: 120_000,
      maxBuffer: 512 * 1024,
      encoding: 'utf-8',
    });
    const output = (stdout + '\n' + stderr).trim().slice(0, 4000);
    return {
      name: check.name,
      scope: check.scope,
      passed: true,
      output: output || 'OK',
      durationMs: Date.now() - start,
    };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    const output = [err.stdout, err.stderr, err.message].filter(Boolean).join('\n').trim().slice(0, 4000);
    return {
      name: check.name,
      scope: check.scope,
      passed: false,
      output: output || 'Check failed',
      durationMs: Date.now() - start,
    };
  }
}

export async function runValidationPipeline(sessionId: string): Promise<ValidationResult> {
  const checksToRun = getChecksForSession(sessionId);
  const root = getMonorepoRoot();

  if (checksToRun.length === 0) {
    const result: ValidationResult = {
      passed: true,
      checks: [],
      ranAt: Date.now(),
    };
    persistValidation(sessionId, result);
    return result;
  }

  const checks: ValidationCheckResult[] = [];
  for (const check of checksToRun) {
    checks.push(await runCheck(root, check));
  }

  const result: ValidationResult = {
    passed: checks.every((c) => c.passed),
    checks,
    ranAt: Date.now(),
  };

  persistValidation(sessionId, result);
  return result;
}

function persistValidation(sessionId: string, validation: ValidationResult): void {
  const session = loadSession(sessionId);
  session.validation = validation;
  session.updatedAt = Date.now();
  saveSession(session);
}

export function getSessionValidation(sessionId: string): ValidationResult | undefined {
  return loadSession(sessionId).validation;
}
