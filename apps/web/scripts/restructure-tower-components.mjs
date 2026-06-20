#!/usr/bin/env node
/**
 * Restructure apps/web/components/automations/tower/* into per-component folders
 * matching packages/ui component structure (.cursor/.rules).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOWER = path.join(__dirname, '..', 'components', 'automations', 'tower');

const COMPONENTS = [
  'AddStepPicker',
  'FlowConfigFieldInput',
  'FlowConnector',
  'TowerGraphCanvas',
  'TowerRunLogsTable',
  'TowerShell',
  'TowerStepConnections',
  'TowerStepRail',
];

function toCamel(name) {
  const match = name.match(/^([A-Z]+)([A-Z][a-z].*|[a-z].*)$/);
  if (match) return match[1].toLowerCase() + match[2];
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function transformSource(source, name) {
  return source
    .replaceAll("'../../../lib/", "'../../../../lib/")
    .replaceAll("'../../../hooks/", "'../../../../hooks/")
    .replaceAll('from "./TowerFlow.module.css"', "from './styles'")
    .replaceAll("from './TowerFlow.module.css'", "from './styles'")
    .replaceAll(
      /from '\.\/([A-Z][A-Za-z]+)'/g,
      (match, imported) => (imported === name ? match : `from '../${imported}'`),
    );
}

function stylesTs() {
  return `import styles from '../TowerFlow.module.css';

export { styles };
export default styles;
`;
}

function fetcherTs(name) {
  return `import { createEmptyFlow } from '@luxgen/automation-flow';

export interface ${name}Data {
  flow: ReturnType<typeof createEmptyFlow>;
}

export async function fetch${name}Data(): Promise<${name}Data> {
  return { flow: createEmptyFlow('Tower workflow') };
}
`;
}

function fixtureTs(name, camel) {
  return `import { createEmptyFlow } from '@luxgen/automation-flow';

export const ${camel}Fixtures = {
  default: {
    flow: createEmptyFlow('Sample tower'),
  },
};
`;
}

function translationsTs(name) {
  return `export const ${name}Translations = {
  en: {
    title: '${name}',
  },
} as const;

export type ${name}Translations = typeof ${name}Translations;
`;
}

function specTs(name, camel) {
  return `import { render } from '@testing-library/react';

import { ${name} } from './${name}';
import { ${camel}Fixtures } from './fixture';

describe('${name}', () => {
  it('is defined', () => {
    expect(${name}).toBeDefined();
    expect(${camel}Fixtures.default).toBeDefined();
  });
});
`;
}

function readmeTs(name) {
  return `# ${name}

Tower automation UI component (\`apps/web/components/automations/tower/${name}/\`).

Shared styles: \`../TowerFlow.module.css\` re-exported from \`styles.ts\`.

## Usage

\`\`\`tsx
import { ${name} } from '@/components/automations/tower';
\`\`\`
`;
}

function indexTs(name, camel, exportsExtra = '') {
  const typeExport = exportsExtra.includes('Props')
    ? `export type { ${exportsExtra} } from './${name}';\n`
    : '';
  return `export { ${name}${exportsExtra && !exportsExtra.includes('Props') ? `, ${exportsExtra}` : ''} } from './${name}';
${typeExport}export { fetch${name}Data } from './fetcher';
export type { ${name}Data } from './fetcher';
export { ${camel}Fixtures } from './fixture';
export { styles as ${camel}Styles } from './styles';
export { ${name}Translations } from './translations';
`;
}

const extraExports = {
  TowerShell: 'TOWER_SUB_NAV',
  FlowConfigFieldInput: 'FlowConfigFieldInputProps',
};

for (const name of COMPONENTS) {
  const dir = path.join(TOWER, name);
  const flatFile = path.join(TOWER, `${name}.tsx`);

  if (!fs.existsSync(flatFile)) {
    console.warn(`Skip ${name}: missing ${flatFile}`);
    continue;
  }

  fs.mkdirSync(dir, { recursive: true });

  const source = transformSource(fs.readFileSync(flatFile, 'utf8'), name);
  fs.writeFileSync(path.join(dir, `${name}.tsx`), source);

  const camel = toCamel(name);
  const files = {
    'styles.ts': stylesTs(),
    'fetcher.ts': fetcherTs(name),
    'fixture.ts': fixtureTs(name, camel),
    'translations.ts': translationsTs(name),
    [`${name}.spec.ts`]: specTs(name, camel),
    'README.md': readmeTs(name),
  };

  for (const [file, content] of Object.entries(files)) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, content);
  }

  const extra = extraExports[name];
  const indexPath = path.join(dir, 'index.ts');
  if (!fs.existsSync(indexPath)) {
    if (name === 'FlowConfigFieldInput') {
      fs.writeFileSync(
        indexPath,
        `export { FlowConfigFieldInput } from './FlowConfigFieldInput';
export type { FlowConfigFieldInputProps } from './FlowConfigFieldInput';
export { fetchFlowConfigFieldInputData } from './fetcher';
export type { FlowConfigFieldInputData } from './fetcher';
export { flowConfigFieldInputFixtures } from './fixture';
export { styles as flowConfigFieldInputStyles } from './styles';
export { FlowConfigFieldInputTranslations } from './translations';
`,
      );
    } else if (name === 'TowerShell') {
      fs.writeFileSync(
        indexPath,
        `export { TowerShell, TOWER_SUB_NAV } from './TowerShell';
export { fetchTowerShellData } from './fetcher';
export type { TowerShellData } from './fetcher';
export { towerShellFixtures } from './fixture';
export { styles as towerShellStyles } from './styles';
export { TowerShellTranslations } from './translations';
`,
      );
    } else {
      fs.writeFileSync(indexPath, indexTs(name, camel));
    }
  }

  fs.unlinkSync(flatFile);
  console.log(`Restructured ${name}/`);
}

const barrel = `${COMPONENTS.map((name) => `export * from './${name}';`).join('\n')}
`;

fs.writeFileSync(path.join(TOWER, 'index.ts'), barrel);
console.log('Wrote tower/index.ts barrel');
