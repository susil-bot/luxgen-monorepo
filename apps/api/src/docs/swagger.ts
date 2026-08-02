import path from 'path';
import fs from 'fs';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import { logger } from '../utils/logger';

/**
 * Serves the REST-surface OpenAPI spec (apps/api/openapi.yaml) at /api-docs
 * (Swagger UI) and /openapi.json (raw spec).
 *
 * This covers ONLY the hand-written Express routes (auth, tenant admin,
 * billing plan lookup, webhooks, ops/jobs) — the primary GraphQL API is
 * self-documented via introspection and is out of scope for OpenAPI.
 *
 * Path resolution has to work in three different run modes that all use
 * different working directories / dist layouts:
 *   1. `npm run dev` (ts-node-dev) — cwd is apps/api/, file runs from src/docs
 *   2. Docker runner-api — cwd is /app (repo root, see Dockerfile[.api]),
 *      compiled file lives at apps/api/dist/apps/api/src/docs/swagger.js
 *   3. `node apps/api/dist/apps/api/src/index.js` run manually from repo root
 * Rather than compute __dirname math that breaks under tsc's rootDir-at-
 * monorepo-root layout, we just try the known candidate locations in order.
 */
function resolveSpecPath(): string | null {
  const candidates = [
    path.join(process.cwd(), 'openapi.yaml'), // cwd == apps/api (local dev)
    path.join(process.cwd(), 'apps', 'api', 'openapi.yaml'), // cwd == repo root (Docker)
    path.join(__dirname, '..', '..', 'openapi.yaml'), // src/docs -> apps/api (ts-node)
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

export function mountApiDocs(app: Express): void {
  const specPath = resolveSpecPath();

  if (!specPath) {
    logger.warn('OpenAPI spec (openapi.yaml) not found — /api-docs and /openapi.json disabled');
    return;
  }

  const spec = YAML.load(specPath);

  app.get('/openapi.json', (_req, res) => res.json(spec));
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: 'LuxGen API — REST reference',
    }),
  );

  logger.info(`API docs mounted at /api-docs (spec: ${specPath})`);
}
