# Multi-stage build for luxgen-monorepo
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY tsconfig.base.json ./

# Copy package.json files for all packages
COPY packages/ ./packages/
COPY apps/ ./apps/

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Build all packages for a specific tenant (defaults to "demo", which is
# branded as LuxGen). `npm run build` alone is interactive and will hang
# here - always build with an explicit tenant id.
ARG TENANT=demo

# --- API builder --------------------------------------------------------
# Separate builder stage per app: `docker build --target runner-api` only
# ever executes this stage (plus `deps`), never `builder-web`. That means a
# broken apps/web page (or any web-only dependency) can never block shipping
# apps/api, and vice versa - Docker's BuildKit skips stages that aren't
# ancestors of the requested --target. Previously api and web shared one
# builder stage, so a single failing page in web aborted the api image too.
FROM base AS builder-api
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG TENANT

# V8 auto-limits its heap based on detected system memory and, on a small
# instance like a free-tier t3.micro (916MB usable RAM), sets a ceiling far
# below what's actually available once swap is counted - tsc compiling
# apps/api (by far the heaviest package here: Express, Apollo, Mongoose,
# Stripe types, GraphQL tooling all type-checked together) hits that ceiling
# and crashes with "JavaScript heap out of memory" well before the OS itself
# runs out of RAM+swap. Raising --max-old-space-size explicitly tells V8 it's
# allowed to use more before giving up. 768MB leaves headroom under this
# instance's ~1.9GB RAM+swap total for npm/turbo's own overhead; tune this
# value down if a future EC2 size ever runs with less swap configured.
ENV NODE_OPTIONS="--max-old-space-size=768"

# Scope the build to apps/api plus its real dependency graph instead of the
# whole monorepo - packages/mcp-core, packages/mcp-server,
# packages/agent-worker, packages/mobile, packages/native-ui are not
# dependencies of apps/api and don't need to compile to ship this image.
# (mcp-core in particular has a real, separately-tracked TypeScript error
# against the MCP SDK's newer request-handler types as of 2026-07-22.)
# --concurrency=1: run one package's build at a time instead of turbo's
# default parallelism. On a 1-vCPU/1GB free-tier instance, launching several
# tsc processes at once fights over the same tiny RAM budget and tips into
# swap, which is far slower overall than compiling packages one after
# another. This trades wall-clock time for staying inside available memory.
RUN node scripts/select-tenant.js ${TENANT} && \
    npx turbo run build --filter=@luxgen/api... --concurrency=1

# Defense-in-depth: `turbo run build --filter=@luxgen/api...` is supposed to
# build every workspace package apps/api depends on (all declared in its
# package.json "dependencies" - config, core, utils, auth, db, billing,
# agent, automation-flow, storefront), since turbo's dependency graph is
# derived from those exact declarations and each package.json's "main" now
# correctly points at "dist/index.js" (see docs/DEPLOYMENT_ISSUES_AND_STANDARD_WORKFLOW.md
# Part 1/6). In production this was observed to silently produce an image
# missing packages/config/dist entirely - `docker run --entrypoint sh` into
# the built image confirmed the symlink and package.json were both correct,
# but dist/ simply wasn't there, causing `require("@luxgen/config")` to fall
# through to a raw .ts file and crash at container start with
# "SyntaxError: Unexpected token 'export'". Root cause not fully isolated
# under deploy time pressure (2026-07-25) - rather than block on that,
# guarantee correctness directly: explicitly (re)build any of these packages
# whose dist/index.js is missing after the turbo step. Cheap and a no-op
# when turbo already did its job; only actually compiles anything on the
# packages where it silently didn't.
# @luxgen/db's real entrypoint is nested at dist/db/src/index.js, not
# dist/index.js - it's the one package that imports another package
# (@luxgen/billing) via the repo's source-level cross-package type
# resolution, which makes tsc infer rootDir as the common ancestor of both
# packages' src trees instead of just "./src" (see packages/db/tsconfig.json
# and scripts/tsc-tolerant.js for the full explanation). package.json's
# "main" already points at this real path; this loop's existence check has
# to agree with it or it will "fix" a package that was never actually broken.
RUN for pkg in config core utils auth db billing agent automation-flow storefront; do \
      if [ "$pkg" = "db" ]; then entry="packages/$pkg/dist/db/src/index.js"; baseline=16; extra="dist/db/src/index.js"; \
      elif [ "$pkg" = "agent" ]; then entry="packages/$pkg/dist/agent/src/index.js"; baseline=16; extra="dist/agent/src/index.js"; \
      else entry="packages/$pkg/dist/index.js"; baseline=0; extra=""; fi; \
      if [ -f "packages/$pkg/package.json" ] && [ ! -f "$entry" ]; then \
        echo "==> $entry missing after turbo build - building it directly"; \
        (cd "packages/$pkg" && node ../../scripts/tsc-tolerant.js "$baseline" $extra); \
      fi; \
    done

# --- Web builder ---------------------------------------------------------
FROM base AS builder-web
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG TENANT

# Next.js inlines NEXT_PUBLIC_* variables into the client bundle at BUILD
# time, not at container start - setting these later via docker-compose
# `environment:` or SSM has no effect on already-built pages. They must be
# passed as --build-arg when the image is built.
#
# NEXT_PUBLIC_BASE_URL, not NEXT_PUBLIC_APP_URL: the only place in the web
# app that reads a "base URL" env var is lib/tenant.ts's getTenantUrl()
# (process.env.NEXT_PUBLIC_BASE_URL), used by the tenant switcher to build
# subdomain links. NEXT_PUBLIC_APP_URL was never actually read anywhere -
# this was a naming mismatch, not an intentionally-unused placeholder.
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_GRAPHQL_URL=${NEXT_PUBLIC_GRAPHQL_URL}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

RUN node scripts/select-tenant.js ${TENANT} && \
    npx turbo run build --filter=@luxgen/web...

# --- API production image -------------------------------------------------
FROM base AS runner-api
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# apps/api/dist is plain tsc output (not bundled like Next.js standalone), so
# it needs its runtime deps - express, apollo-server-express, mongoose,
# jsonwebtoken, etc. - copied in alongside it.
COPY --from=builder-api /app/apps/api/dist ./apps/api/dist
COPY --from=builder-api /app/apps/api/package.json ./apps/api/
COPY --from=builder-api /app/packages ./packages
COPY --from=deps /app/node_modules ./node_modules

USER nextjs

EXPOSE 4000
ENV PORT=4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Path is apps/api/dist/apps/api/src/index.js, not apps/api/dist/index.js:
# apps/api's tsconfig has rootDir pinned to the monorepo root (it also
# compiles in shared packages/*/src via path aliases), so tsc mirrors that
# full path under dist/ instead of flattening to dist/index.js.
CMD ["node", "apps/api/dist/apps/api/src/index.js"]

# --- Web production image -------------------------------------------------
FROM base AS runner-web
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js standalone output bundles its own trimmed node_modules - no need
# to copy the full install here like the API image does above.
COPY --from=builder-web /app/apps/web/.next/standalone ./
COPY --from=builder-web /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder-web /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "apps/web/server.js"]
