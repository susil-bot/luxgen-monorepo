#!/usr/bin/env node
/**
 * Walk apps/ + packages/ and emit docs/file-analysis/*.md for every .ts/.tsx/.js source file.
 * Run: node scripts/generate-interview-prep.mjs
 * Re-run after repo changes to refresh the living notebook index.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'file-analysis');
const SCAN = [path.join(ROOT, 'apps'), path.join(ROOT, 'packages')];
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.turbo', 'coverage', '__tests__']);
const EXT = new Set(['.ts', '.tsx', '.js']);

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

function extractExports(content) {
  const exports = [];
  const re = /export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|enum|type|interface)\s+(\w+)/g;
  let m;
  while ((m = re.exec(content))) exports.push(m[1]);
  const re2 = /export\s*\{([^}]+)\}/g;
  while ((m = re2.exec(content))) {
    m[1].split(',').forEach((part) => {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name) exports.push(name);
    });
  }
  if (/export\s+default/.test(content) && !exports.includes('default')) exports.push('default');
  return [...new Set(exports)];
}

function extractImports(content) {
  const imports = [];
  const re = /import\s+(?:type\s+)?(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content))) imports.push(m[1]);
  return imports;
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
    while ((m = re.exec(content))) fns.push(m[1]);
  }
  return [...new Set(fns)];
}

function inferPurpose(filePath, content) {
  const r = rel(filePath);
  if (r.includes('/pages/api/')) return 'Next.js API route (serverless handler)';
  if (r.includes('/pages/') && r.endsWith('.tsx')) return 'Next.js page route (SSR/CSR)';
  if (r.includes('/schema/') && r.includes('resolvers')) return 'GraphQL resolver module';
  if (r.includes('/schema/') && r.includes('typeDefs')) return 'GraphQL type definitions';
  if (r.includes('/middleware/')) return 'Express middleware';
  if (r.includes('/routes/')) return 'Express REST route module';
  if (r.includes('packages/db/src/') && !r.includes('tenant-config')) return 'Mongoose model or DB utility';
  if (r.includes('packages/ui/src/')) return 'Shared UI component or design-system module';
  if (r.includes('/hooks/') || /^use[A-Z]/.test(path.basename(r))) return 'React custom hook';
  if (r.includes('/graphql/queries/')) return 'Apollo GraphQL operation document';
  if (content.includes('model<') || content.includes('mongoose.models')) return 'Database model registration';
  if (content.includes('ApolloServer') || content.includes('apollo-server')) return 'GraphQL server setup';
  if (content.includes('createContext') && content.includes('Provider')) return 'React context provider';
  return 'Application module';
}

function inferPattern(filePath, content) {
  if (content.includes('Provider') && content.includes('createContext')) return 'React Context Provider';
  if (content.includes('getServerSideProps')) return 'Next.js SSR data fetching';
  if (content.includes('useQuery') || content.includes('useMutation')) return 'Apollo Client data layer';
  if (content.includes('model<') || content.includes('Schema(')) return 'Repository / Active Record (Mongoose)';
  if (content.includes('middleware')) return 'Middleware / Pipeline';
  if (content.includes('Router') || content.includes('express()')) return 'Router / MVC Controller';
  if (filePath.includes('/fixture')) return 'Test fixture / Storybook data';
  return 'Module / Utility';
}

function interviewQuestions(filePath, exports, fns) {
  const r = rel(filePath);
  const qs = [];
  if (r.includes('Auth') || r.includes('session')) {
    qs.push('How does this module prevent fabricated users on 401/expired JWT?');
    qs.push('What happens on cross-tab logout?');
  }
  if (r.includes('Sidebar') || r.includes('NavBar')) {
    qs.push('How do you avoid duplicate navigation callbacks (onNavigate vs onItemClick)?');
  }
  if (r.includes('Tenant') || r.includes('tenant')) {
    qs.push('How is tenant resolved: subdomain, header, or JWT claim?');
  }
  if (fns.some((f) => f.startsWith('use'))) {
    qs.push('What triggers re-renders when this hook runs?');
    qs.push('What belongs in the useEffect dependency array?');
  }
  if (exports.length === 0) qs.push('Why is this file side-effect only?');
  qs.push(`Walk me through ${exports[0] ?? path.basename(r)} line by line.`);
  qs.push('What would break if we removed this file?');
  qs.push('How would you unit test this module?');
  return qs.slice(0, 8);
}

function buildMd(filePath, content) {
  const lines = content.split('\n');
  const lineCount = lines.length;
  const exports = extractExports(content);
  const imports = extractImports(content);
  const fns = extractFunctions(content);
  const purpose = inferPurpose(filePath, content);
  const pattern = inferPattern(filePath, content);

  const fnBlocks = fns.slice(0, 15).map((name) => {
    const idx = lines.findIndex((l) => l.includes(name) && (l.includes('function') || l.includes('const')));
    const start = idx >= 0 ? idx + 1 : '?';
    return `### \`${name}\`\n\n- **Approx. line:** ${start}\n- **Role:** Implementation detail — open source file for full signature.\n- **Interview:** "What are inputs, outputs, and side effects of \`${name}\`?"\n`;
  }).join('\n');

  return `# ${path.basename(filePath)}

## File Path

\`${rel(filePath)}\`

## Purpose

${purpose}

## Stats

| Metric | Value |
|--------|-------|
| Lines | ${lineCount} |
| Exports | ${exports.length} |
| Functions (detected) | ${fns.length} |

## Imports (external / workspace)

${imports.slice(0, 20).map((i) => `- \`${i}\``).join('\n') || '- _(none detected)_'}
${imports.length > 20 ? `\n_…and ${imports.length - 20} more_` : ''}

## Exports

${exports.map((e) => `- \`${e}\``).join('\n') || '- _(none detected)_'}

## Design Pattern

${pattern}

## Dependencies

- **Runtime:** Derived from import graph above.
- **Workspace packages:** ${[...new Set(imports.filter((i) => i.startsWith('@luxgen/')))] .join(', ') || 'none'}

## Function-Level Notes

${fnBlocks || '_No named functions detected (types-only or re-export barrel)._'}

## Interview Questions

${interviewQuestions(filePath, exports, fns).map((q) => `- ${q}`).join('\n')}

## Possible Improvements

- Add explicit unit tests if missing.
- Document edge cases in JSDoc on public exports.
- Avoid circular imports with sibling modules.

## Senior-Level Discussion

- **Why this way?** Colocated with feature domain (\`${rel(filePath).split('/').slice(0, 3).join('/')}\`).
- **Tradeoff:** Monorepo shared package vs app-local — weigh bundle size and coupling.
- **Production concern:** Verify error boundaries, auth gates, and tenant scoping on every data path.

## Real-World Usage

Search repo for imports of this file:

\`\`\`bash
rg "${path.basename(filePath, path.extname(filePath))}" apps packages --glob '*.{ts,tsx}'
\`\`\`

## Related Concepts

- See [03-react.md](../interview-prep/03-react.md) for React patterns.
- See [05-node.md](../interview-prep/05-node.md) for API/middleware patterns.
- See [06-mongodb.md](../interview-prep/06-mongodb.md) for Mongoose models.

---
_Auto-generated by \`scripts/generate-interview-prep.mjs\`. Enrich manually for hot-path files._
`;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const files = SCAN.flatMap((d) => walk(d)).sort();
  const manifest = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const outFile = path.join(OUT, `${slug(file)}.md`);
    fs.writeFileSync(outFile, buildMd(file, content));
    manifest.push({ path: rel(file), doc: `file-analysis/${slug(file)}.md`, lines: content.split('\n').length });
  }

  const index = `# File Analysis Index

> **${manifest.length}** source files · Generated ${new Date().toISOString().slice(0, 10)}

Re-generate: \`node scripts/generate-interview-prep.mjs\`

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
${manifest.map((m) => `| \`${m.path}\` | ${m.lines} | [${path.basename(m.doc, '.md')}](${m.doc}) |`).join('\n')}
`;

  fs.writeFileSync(path.join(OUT, 'INDEX.md'), index);
  console.log(`Wrote ${manifest.length} file analyses + INDEX.md`);
}

main();
