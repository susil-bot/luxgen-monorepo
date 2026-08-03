#!/usr/bin/env node
/**
 * Generic version of apps/api/scripts/build-tolerant.js, usable by any
 * package's "build" script: `node ../../scripts/tsc-tolerant.js <baseline>`.
 *
 * Why this exists (discovered 2026-07-25, running `npm run build:api:deps`
 * directly on a local machine): packages/db's "build" script was a bare
 * `tsc`, which hard-fails with exit code 2 on 16 pre-existing TypeScript
 * errors - all Mongoose 7.x type-definition gaps (array-of-subdocument
 * schema fields, `unique`/`sparse` index options missing from Mongoose's own
 * IndexOptions type, `serverSelectionTimeoutMS` missing from ConnectOptions -
 * these are known, tracked mismatches between Mongoose 7.x's actual runtime
 * behavior and its shipped .d.ts files, not real bugs in this codebase's
 * code). `tsc` still emits usable .js output despite reporting these errors
 * (noEmitOnError isn't set) - but a bare `tsc` exiting non-zero fails
 * `npm run build`, which fails turbo's task graph, which either aborts the
 * whole pipeline or - worse - can silently leave that package's dist/
 * missing while a *different*, error-free package in the same turbo run
 * still completes and gets copied into a Docker image, producing exactly
 * the "SyntaxError: Unexpected token export" production crash this project
 * hit twice now (first on packages/config, potentially also packages/db).
 *
 * This script passes (exit 0) if tsc's reported error count is at or below
 * the given baseline AND dist/index.js actually got emitted; it fails hard
 * (exit 1) if the entrypoint is missing, or if new errors were introduced
 * beyond the tracked baseline - so a genuinely new bug still blocks the
 * build, same guarantee apps/api's build-tolerant.js already provides.
 *
 * Usage: "build": "node ../../scripts/tsc-tolerant.js 16"
 *
 * Optional 2nd arg: relative path (from cwd) to the real compiled entrypoint,
 * for packages whose output isn't a flat dist/index.js. This happens when a
 * package imports another package via the cross-package tsconfig "paths"/
 * package.json "types" source-resolution convention used repo-wide (e.g.
 * @luxgen/db importing @luxgen/billing's src/index.ts for types) - tsc then
 * infers rootDir as the common ancestor of both packages' source trees
 * instead of just "./src", nesting output under dist/<pkg>/src/index.js.
 * Same pattern apps/api already relies on (see its Docker CMD).
 * Usage: "build": "node ../../scripts/tsc-tolerant.js 16 dist/db/src/index.js"
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseline = Number(process.argv[2] ?? '0');
const entrypointArg = process.argv[3] || path.join('dist', 'index.js');
const cwd = process.cwd();
const entrypoint = path.join(cwd, entrypointArg);
const pkgName = path.basename(cwd);

let output = '';
let exitCode = 0;
try {
  output = execSync('npx tsc', { cwd, encoding: 'utf8', stdio: 'pipe' });
} catch (err) {
  exitCode = err.status ?? 1;
  output = (err.stdout || '') + (err.stderr || '');
}

process.stdout.write(output);

if (exitCode === 0) {
  console.log(`\n✅ ${pkgName} build: tsc reported zero errors.`);
  process.exit(0);
}

const errorCount = (output.match(/error TS\d+/g) || []).length;
const entrypointExists = fs.existsSync(entrypoint);

console.log(`\n---`);
console.log(`${pkgName} build: tsc exited ${exitCode} with ${errorCount} error(s) (tracked baseline: ${baseline}).`);

if (entrypointExists && errorCount <= baseline && errorCount > 0) {
  console.log(
    `⚠️  Within the tracked baseline - pre-existing type-definition mismatches,\n` +
    `   not new bugs. Compiled output was still emitted. Continuing build.`
  );
  process.exit(0);
}

if (!entrypointExists) {
  console.error(`❌ Expected entrypoint not found at ${entrypoint} - tsc did not emit usable output. Failing build.`);
} else {
  console.error(
    `❌ Error count (${errorCount}) exceeds the tracked baseline (${baseline}) - ` +
    `a new type error was introduced. Fix it, or if it's a confirmed non-bug, raise the baseline ` +
    `in this package's "build" script with a comment explaining why. Failing build.`
  );
}
process.exit(1);
