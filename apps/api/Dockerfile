# ── Stage 1: Install all dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json turbo.json tsconfig.base.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages ./packages
COPY apps/api ./apps/api

RUN npm ci

# ── Stage 2: Build workspace dependencies (packages only) ─────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build @luxgen/db, billing, agent, etc. Skip @luxgen/api tsc (pre-existing TS debt).
# Runtime uses tsx for transpile-only execution — same as local `ts-node-dev`.
RUN npx turbo run build --filter=@luxgen/api^...

# ── Stage 3: Production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache curl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiuser

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=apiuser:nodejs /app/package*.json ./
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/apps/api ./apps/api
COPY --from=builder --chown=apiuser:nodejs /app/packages ./packages

RUN npm install tsx --no-save

USER apiuser

WORKDIR /app/apps/api

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -fs http://localhost:4000/health || exit 1

CMD ["npx", "tsx", "src/index.ts"]
