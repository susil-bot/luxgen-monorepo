/**
 * Export merged GraphQL SDL to apps/api/schema.graphql
 * Run: npm run schema:export --workspace=@luxgen/api
 * Or:  node --import tsx apps/api/src/scripts/export-schema-graphql.ts (from repo root via ts-node)
 */
import fs from 'fs';
import path from 'path';
import { printSchema } from 'graphql';
import { schema } from '../schema';

const outPath = path.resolve(__dirname, '../../schema.graphql');
const sdl = `# LuxGen GraphQL Schema (auto-generated)
# Do not edit by hand — update typeDefs in src/schema/* and re-run:
#   npm run schema:export --workspace=@luxgen/api
#
# Generated: ${new Date().toISOString()}

${printSchema(schema)}
`;

fs.writeFileSync(outPath, sdl, 'utf8');
console.log(`Wrote ${outPath} (${sdl.split('\n').length} lines)`);
