#!/usr/bin/env node
/**
 * Ensures each packages/ui/src/ComponentName/ folder matches .cursor/.rules structure.
 * Creates missing fetcher, fixture, styles, translations, spec, index, README, and main .tsx.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'src');
const SKIP = new Set(['context', 'services', 'hooks', 'utils', 'types', '__tests__', 'config']);

function toCamel(name) {
  const match = name.match(/^([A-Z]+)([A-Z][a-z].*|[a-z].*)$/);
  if (match) {
    return match[1].toLowerCase() + match[2];
  }
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function toKebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function hasFixture(dir, name) {
  return (
    fs.existsSync(path.join(dir, 'fixture.ts')) ||
    fs.existsSync(path.join(dir, 'fixture.tsx'))
  );
}

function hasSpec(dir, name) {
  return fs.readdirSync(dir).some((f) => /\.spec\.(ts|tsx|js)$/.test(f) && f.startsWith(name));
}

function findMainTsx(dir, name) {
  const direct = path.join(dir, `${name}.tsx`);
  if (fs.existsSync(direct)) return `${name}.tsx`;
  const candidates = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.tsx') && !f.includes('.spec') && !f.includes('.example'));
  return candidates[0] ?? null;
}

function readFirstExport(indexPath) {
  if (!fs.existsSync(indexPath)) return null;
  const content = fs.readFileSync(indexPath, 'utf8');
  const match = content.match(/export\s+\{\s*(\w+)/);
  return match?.[1] ?? null;
}

function templateFetcher(name) {
  const camel = toCamel(name);
  const kebab = toKebab(name);
  return `import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface ${name}Data {
  tenantTheme: TenantTheme;
}

export const fetch${name}Data = async (_tenantId?: string): Promise<${name}Data> => {
  return { tenantTheme: defaultTheme };
};

export const fetch${name}SSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetch${name}Data(tenantId);
  return {
    html: \`<div class="${kebab}"></div>\`,
    styles: \`.${kebab} { font-family: \${data.tenantTheme.fonts.primary}; }\`,
  };
};
`;
}

function templateFixture(name, propsType) {
  const camel = toCamel(name);
  const propsImport = propsType
    ? `import type { ${propsType} } from './${name}';\n\n`
    : '';
  const propsCast = propsType ? ` as ${propsType}` : '';
  return `${propsImport}import { defaultTheme } from '../theme';

export const ${camel}Fixtures = {
  default: {
    tenantTheme: defaultTheme,
  }${propsCast},
};
`;
}

function templateStyles(name) {
  const camel = toCamel(name);
  const kebab = toKebab(name);
  return `import { css } from '@emotion/css';

export const ${camel}Styles = {
  root: css\`
    .${kebab} {
      font-family: var(--font-primary);
      color: var(--color-text);
    }
  \`,
};
`;
}

function templateTranslations(name) {
  return `export const ${name}Translations = {
  en: {
    title: '${name}',
  },
} as const;

export type ${name}Translations = typeof ${name}Translations;
`;
}

function templateSpec(name, propsType) {
  const camel = toCamel(name);
  const fixtureImport = hasFixture(path.join(SRC, name), name)
    ? `import { ${camel}Fixtures } from './fixture';\n`
    : '';
  const propsSpread = hasFixture(path.join(SRC, name), name) ? `{...${camel}Fixtures.default}` : '';
  return `import React from 'react';
import { render } from '@testing-library/react';
import { ${name} } from './${name}';
${fixtureImport}
describe('${name}', () => {
  it('renders without crashing', () => {
    const { container } = render(<${name} ${propsSpread} />);
    expect(container).toBeTruthy();
  });
});
`;
}

function templateReadme(name) {
  return `# ${name}

LuxGen UI component. See \`${name}.tsx\` for props and usage.

## Structure

| File | Purpose |
| ---- | ------- |
| \`${name}.tsx\` | Main component |
| \`fetcher.ts\` | Data fetching / SSR helpers |
| \`fixture.ts\` | Test fixtures and mock data |
| \`${name}.spec.ts\` | Unit tests |
| \`styles.ts\` | Styled components and CSS-in-JS |
| \`translations.ts\` | i18n strings |
| \`index.ts\` | Public exports |

## Usage

\`\`\`tsx
import { ${name} } from '@luxgen/ui';

<${name} />
\`\`\`
`;
}

function templateMainTsx(name, firstExport) {
  if (firstExport && firstExport !== name) {
    return `/**
 * ${name} domain entry — re-exports the primary surface as \`${name}\`.
 */
export { ${firstExport} as ${name} } from './${firstExport}';
export type { ${firstExport}Props as ${name}Props } from './${firstExport}';
`;
  }
  return `import React from 'react';

export interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${name}: React.FC<${name}Props> = ({ className = '', children }) => (
  <div className={\`${toKebab(name)} \${className}\`}>{children}</div>
);
`;
}

function templateIndex(name, hasProps) {
  const camel = toCamel(name);
  return `export { ${name} } from './${name}';
${hasProps ? `export type { ${name}Props } from './${name}';\n` : ''}export { fetch${name}Data, fetch${name}SSR } from './fetcher';
export type { ${name}Data } from './fetcher';
export { ${camel}Fixtures } from './fixture';
export { ${camel}Styles } from './styles';
export { ${name}Translations } from './translations';
export type { ${name}Translations as ${name}TranslationsType } from './translations';
`;
}

function appendExports(indexPath, name) {
  let content = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
  const camel = toCamel(name);
  const additions = [];

  if (!content.includes('./fetcher')) {
    additions.push(`export { fetch${name}Data, fetch${name}SSR } from './fetcher';`);
  }
  if (!content.includes('./fixture') && !content.includes('Fixtures')) {
    additions.push(`export { ${camel}Fixtures } from './fixture';`);
  }
  if (!content.includes('./styles')) {
    additions.push(`export { ${camel}Styles } from './styles';`);
  }
  if (!content.includes('./translations')) {
    additions.push(`export { ${name}Translations } from './translations';`);
  }

  if (additions.length === 0) return false;
  const next = `${content.trimEnd()}\n${additions.join('\n')}\n`;
  fs.writeFileSync(indexPath, next);
  return true;
}

function writeIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return true;
}

const dirs = fs
  .readdirSync(SRC)
  .filter((d) => fs.statSync(path.join(SRC, d)).isDirectory() && !SKIP.has(d))
  .sort();

const created = [];

for (const name of dirs) {
  const dir = path.join(SRC, name);
  const mainFile = findMainTsx(dir, name);
  const indexPath = path.join(dir, 'index.ts');
  const firstExport = readFirstExport(indexPath);

  if (!fs.existsSync(path.join(dir, `${name}.tsx`))) {
    const mainPath = path.join(dir, `${name}.tsx`);
    if (writeIfMissing(mainPath, templateMainTsx(name, firstExport))) {
      created.push(`${name}/${name}.tsx`);
    }
  }

  const propsType = fs.existsSync(path.join(dir, `${name}.tsx`))
    ? `${name}Props`
    : firstExport
      ? `${firstExport}Props`
      : null;

  if (writeIfMissing(path.join(dir, 'fetcher.ts'), templateFetcher(name))) {
    created.push(`${name}/fetcher.ts`);
  }

  if (!hasFixture(dir, name)) {
    if (writeIfMissing(path.join(dir, 'fixture.ts'), templateFixture(name, propsType))) {
      created.push(`${name}/fixture.ts`);
    }
  } else if (!fs.existsSync(path.join(dir, 'fixture.ts')) && fs.existsSync(path.join(dir, 'fixture.tsx'))) {
    const reexport = `/** Re-export JSX fixtures from fixture.tsx per component structure rules. */\nexport * from './fixture.tsx';\n`;
    if (writeIfMissing(path.join(dir, 'fixture.ts'), reexport)) {
      created.push(`${name}/fixture.ts (re-export)`);
    }
  }

  if (fs.existsSync(path.join(dir, 'styles.js')) && !fs.existsSync(path.join(dir, 'styles.ts'))) {
    const reexport = `/** Re-export legacy styles.js as TypeScript entry. */\n// eslint-disable-next-line @typescript-eslint/no-require-imports\nmodule.exports = require('./styles.js');\n`;
    // Use TS re-export instead
    const tsReexport = `export * from './styles.js';\n`;
    if (writeIfMissing(path.join(dir, 'styles.ts'), tsReexport)) {
      created.push(`${name}/styles.ts (from styles.js)`);
    }
  } else if (writeIfMissing(path.join(dir, 'styles.ts'), templateStyles(name))) {
    created.push(`${name}/styles.ts`);
  }

  if (writeIfMissing(path.join(dir, 'translations.ts'), templateTranslations(name))) {
    created.push(`${name}/translations.ts`);
  }

  if (!hasSpec(dir, name)) {
    if (writeIfMissing(path.join(dir, `${name}.spec.ts`), templateSpec(name, propsType))) {
      created.push(`${name}/${name}.spec.ts`);
    }
  }

  if (writeIfMissing(path.join(dir, 'README.md'), templateReadme(name))) {
    created.push(`${name}/README.md`);
  }

  if (!fs.existsSync(indexPath)) {
    if (writeIfMissing(indexPath, templateIndex(name, Boolean(propsType)))) {
      created.push(`${name}/index.ts`);
    }
  } else if (appendExports(indexPath, name)) {
    created.push(`${name}/index.ts (updated exports)`);
  }
}

console.log(`Scaffolded ${created.length} files:\n`);
for (const item of created) {
  console.log(`  + ${item}`);
}
