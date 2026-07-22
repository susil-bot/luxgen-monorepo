'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.runValidationPipeline = runValidationPipeline;
exports.getSessionValidation = getSessionValidation;
const child_process_1 = require('child_process');
const util_1 = require('util');
const paths_1 = require('../config/paths');
const session_store_1 = require('../changeset/session-store');
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
const SCOPE_CHECKS = [
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
function getChecksForSession(sessionId) {
  const session = (0, session_store_1.loadSession)(sessionId);
  const paths = Object.keys(session.files);
  const checks = [];
  const seen = new Set();
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
async function runCheck(root, check) {
  const start = Date.now();
  const cwd = `${root}/${check.cwd}`;
  try {
    const { stdout, stderr } = await execFileAsync(check.command, check.args, {
      cwd,
      timeout: 120000,
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
  } catch (e) {
    const err = e;
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
async function runValidationPipeline(sessionId) {
  const checksToRun = getChecksForSession(sessionId);
  const root = (0, paths_1.getMonorepoRoot)();
  if (checksToRun.length === 0) {
    const result = {
      passed: true,
      checks: [],
      ranAt: Date.now(),
    };
    persistValidation(sessionId, result);
    return result;
  }
  const checks = [];
  for (const check of checksToRun) {
    checks.push(await runCheck(root, check));
  }
  const result = {
    passed: checks.every((c) => c.passed),
    checks,
    ranAt: Date.now(),
  };
  persistValidation(sessionId, result);
  return result;
}
function persistValidation(sessionId, validation) {
  const session = (0, session_store_1.loadSession)(sessionId);
  session.validation = validation;
  session.updatedAt = Date.now();
  (0, session_store_1.saveSession)(session);
}
function getSessionValidation(sessionId) {
  return (0, session_store_1.loadSession)(sessionId).validation;
}
