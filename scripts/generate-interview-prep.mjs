#!/usr/bin/env node
/**
 * Walk apps/ + packages/ and emit brief junior Q&A docs/file-analysis/*.md
 * Run: node scripts/generate-interview-prep.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'file-analysis');
const SCAN = [path.join(ROOT, 'apps'), path.join(ROOT, 'packages')];
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.turbo', 'coverage', '__tests__']);
const EXT = new Set(['.ts', '.tsx', '.js']);

/** Hand-curated brief Q&A — do not overwrite on regenerate */
const HAND_ENRICHED = new Set([
  'apps-web-pages-_app-tsx',
  'apps-web-components-auth-AuthGuard-tsx',
  'apps-web-lib-session-ts',
  'apps-api-src-app-ts',
  'packages-ui-src-NavBar-NavBar-tsx',
  'packages-db-src-tenant-ts',
  'apps-web-lib-use-sidebar-sections-ts',
  'apps-api-src-context-ts',
  'apps-web-graphql-client-ts',
]);

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (EXT.has(path.extname(ent.name))) acc.push(full);
  }
  return acc;
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function slug(p) {
  return rel(p).replace(/[/.]/g, '-').replace(/^-+|-+$/g, '');
}

function findLine(lines, patterns) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (patterns.some((p) => (typeof p === 'string' ? line.includes(p) : p.test(line)))) return i + 1;
  }
  return null;
}

function extractExports(content, lines) {
  const exports = [];
  const re = /export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|enum|type|interface)\s+(\w+)/g;
  let m;
  while ((m = re.exec(content))) {
    const line = content.slice(0, m.index).split('\n').length;
    exports.push({ name: m[1], line });
  }
  const re2 = /export\s*\{([^}]+)\}/g;
  while ((m = re2.exec(content))) {
    const line = content.slice(0, m.index).split('\n').length;
    m[1].split(',').forEach((part) => {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name) exports.push({ name, line });
    });
  }
  const seen = new Set();
  return exports.filter((e) => {
    if (seen.has(e.name)) return false;
    seen.add(e.name);
    return true;
  });
}

function extractFunctions(content) {
  const fns = [];
  const patterns = [
    /export\s+(?:async\s+)?function\s+(\w+)/g,
    /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
    /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?function/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(content))) {
      const line = content.slice(0, m.index).split('\n').length;
      fns.push({ name: m[1], line });
    }
  }
  const seen = new Set();
  return fns.filter((f) => {
    if (seen.has(f.name)) return false;
    seen.add(f.name);
    return true;
  });
}

function inferPurpose(filePath, content) {
  const r = rel(filePath);
  if (r.includes('/pages/api/')) return 'Next.js API route handler';
  if (r.includes('/pages/') && r.endsWith('.tsx')) return 'Next.js page component';
  if (r.includes('/schema/') && r.includes('resolvers')) return 'GraphQL resolver';
  if (r.includes('/schema/') && r.includes('typeDefs')) return 'GraphQL type definitions';
  if (r.includes('/middleware/')) return 'Express middleware';
  if (r.includes('/routes/')) return 'Express REST route';
  if (r.includes('packages/db/src/') && !r.includes('tenant-config')) return 'Mongoose model or DB helper';
  if (r.includes('packages/ui/src/')) return 'Shared UI component or hook';
  if (r.includes('/hooks/') || /^use[A-Z]/.test(path.basename(r))) return 'React custom hook';
  if (r.includes('/graphql/queries/')) return 'GraphQL query/mutation document';
  if (content.includes('model<') || content.includes('mongoose.models')) return 'Database model';
  if (content.includes('ApolloServer')) return 'GraphQL server setup';
  if (content.includes('createContext') && content.includes('Provider')) return 'React context provider';
  return 'Application module';
}

function juniorQuestions(filePath, content, purpose, exports, fns) {
  const r = rel(filePath);
  const base = path.basename(filePath);
  const qs = [];

  qs.push({
    q: 'What does this file do?',
    a: purpose + (exports[0] ? `. Main exports: ${exports.slice(0, 3).map((e) => `\`${e.name}\``).join(', ')}.` : '.'),
  });

  if (exports.length > 0) {
    const e = exports[0];
    qs.push({
      q: `What is \`${e.name}\`?`,
      a: `Exported symbol — open source at **${r}:${e.line}** and read the function body.`,
    });
  }

  if (fns.length > 0 && (!exports[0] || fns[0].name !== exports[0].name)) {
    const f = fns[0];
    qs.push({
      q: `What does \`${f.name}\` do?`,
      a: `See **${r}:${f.line}** — check parameters, return value, and side effects.`,
    });
  }

  if (r.includes('Auth') || r.includes('session')) {
    qs.push({
      q: 'How does this relate to login/session?',
      a: 'Part of auth flow — see `apps/web/lib/session.ts` and [15-junior-qa-mern.md](../interview-prep/15-junior-qa-mern.md).',
    });
  } else if (r.includes('tenant') || r.includes('Tenant')) {
    qs.push({
      q: 'How does multi-tenancy apply here?',
      a: 'Tenant scope via subdomain or `tenantId` — see [15-junior-qa-mern.md](../interview-prep/15-junior-qa-mern.md#12-what-is-multi-tenancy-in-luxgen).',
    });
  } else if (r.includes('/middleware/')) {
    qs.push({
      q: 'When does this middleware run?',
      a: 'In Express pipeline before routes — order matters. See `apps/api/src/app.ts`.',
    });
  } else if (r.includes('/pages/') && r.endsWith('.tsx')) {
    qs.push({
      q: 'What URL maps to this page?',
      a: `File-based routing: \`pages/\` path → URL (e.g. \`dashboard.tsx\` → \`/dashboard\`).`,
    });
  } else if (fns.some((f) => f.name.startsWith('use'))) {
    const hook = fns.find((f) => f.name.startsWith('use'));
    qs.push({
      q: 'What hooks does this file use?',
      a: `Custom hook \`${hook?.name}\` at line ${hook?.line} — list \`useEffect\` deps to explain re-renders.`,
    });
  } else if (r.includes('resolver')) {
    qs.push({
      q: 'What is GraphQL context here?',
      a: 'Resolvers receive `(parent, args, context)` — use `context.user` and `context.tenantId` for auth.',
    });
  } else {
    qs.push({
      q: 'What breaks if we delete this file?',
      a: `Search imports: \`rg "${base.replace(/\.[^.]+$/, '')}" apps packages --glob '*.{ts,tsx}'\`.`,
    });
  }

  if (exports.length > 1) {
    const e = exports[1];
    qs.push({
      q: `What is \`${e.name}\`?`,
      a: `Second export at **${r}:${e.line}**.`,
    });
  }

  return qs.slice(0, 6);
}

function buildMd(filePath, content) {
  const lines = content.split('\n');
  const lineCount = lines.length;
  const fileRel = rel(filePath);
  const base = path.basename(filePath);
  const purpose = inferPurpose(filePath, content);
  const exports = extractExports(content, lines);
  const fns = extractFunctions(content);
  const questions = juniorQuestions(filePath, content, purpose, exports, fns);

  const exportLines =
    exports.length > 0
      ? exports.map((e) => `- \`${e.name}\` — line ${e.line}`).join('\n')
      : '- _(none)_';

  const qaBlocks = questions
    .map(
      (item, i) => `--------------------------------------------------------------------------------------------------------------------------------------------
**[${i}] ${item.q}**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** ${item.a}
`,
    )
    .join('\n');

  return `# ${base} — Brief + Junior Q&A

**Path:** \`${fileRel}\` (${lineCount} lines)  
**Role:** ${purpose}

## Exports

${exportLines}

---

## Junior Q&A

${qaBlocks}
**More:** [14-junior-qa-react.md](../interview-prep/14-junior-qa-react.md) · [15-junior-qa-mern.md](../interview-prep/15-junior-qa-mern.md)

---
_Auto-generated by \`scripts/generate-interview-prep.mjs\`. Hand-enriched ★ files are skipped._
`;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const files = SCAN.flatMap((d) => walk(d)).sort();
  const manifest = [];
  let skipped = 0;

  for (const file of files) {
    const s = slug(file);
    if (HAND_ENRICHED.has(s)) {
      skipped++;
      const content = fs.readFileSync(file, 'utf8');
      manifest.push({ path: rel(file), doc: `file-analysis/${s}.md`, lines: content.split('\n').length, hand: true });
      continue;
    }
    const content = fs.readFileSync(file, 'utf8');
    const outFile = path.join(OUT, `${s}.md`);
    fs.writeFileSync(outFile, buildMd(file, content));
    manifest.push({ path: rel(file), doc: `file-analysis/${s}.md`, lines: content.split('\n').length, hand: false });
  }

  const index = `# File Analysis Index

> **${manifest.length}** source files · Brief junior Q&A format · Generated ${new Date().toISOString().slice(0, 10)}

Re-generate: \`node scripts/generate-interview-prep.mjs\`

**Study:** [14-junior-qa-react.md](../interview-prep/14-junior-qa-react.md) · [15-junior-qa-mern.md](../interview-prep/15-junior-qa-mern.md) · [16-junior-qa-javascript.md](../interview-prep/16-junior-qa-javascript.md)

★ = hand-enriched (not overwritten by generator)

## By area

| Area | Files |
|------|-------|
| apps/web | ${manifest.filter((m) => m.path.startsWith('apps/web')).length} |
| apps/api | ${manifest.filter((m) => m.path.startsWith('apps/api')).length} |
| apps/mobile | ${manifest.filter((m) => m.path.startsWith('apps/mobile')).length} |
| apps/other | ${manifest.filter((m) => m.path.startsWith('apps/') && !m.path.startsWith('apps/web') && !m.path.startsWith('apps/api') && !m.path.startsWith('apps/mobile')).length} |
| packages/ui | ${manifest.filter((m) => m.path.startsWith('packages/ui')).length} |
| packages/other | ${manifest.filter((m) => m.path.startsWith('packages/') && !m.path.startsWith('packages/ui')).length} |

## All files

| Source | Lines | Analysis |
|--------|-------|----------|
${manifest.map((m) => `| \`${m.path}\` | ${m.lines} | [${path.basename(m.doc, '.md')}](${m.doc})${m.hand ? ' ★' : ''} |`).join('\n')}
`;

  fs.writeFileSync(path.join(OUT, 'INDEX.md'), index);
  console.log(`Wrote ${manifest.length - skipped} analyses (${skipped} hand-enriched skipped) + INDEX.md`);
}

main();
