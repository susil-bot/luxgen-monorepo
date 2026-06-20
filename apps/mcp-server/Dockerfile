# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json turbo.json tsconfig.base.json ./
COPY apps/mcp-server/package*.json ./apps/mcp-server/
COPY packages ./packages
COPY apps/mcp-server ./apps/mcp-server

RUN npm ci

# ── Stage 2: Build MCP packages ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx turbo run build --filter=@luxgen/mcp-server^... --filter=@luxgen/mcp-server

# ── Stage 3: Production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache curl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 mcpuser

WORKDIR /app

ENV NODE_ENV=production
ENV MCP_TRANSPORT=http
ENV MCP_HTTP_PORT=3100
ENV MCP_HTTP_HOST=0.0.0.0

COPY --from=builder --chown=mcpuser:nodejs /app/package*.json ./
COPY --from=builder --chown=mcpuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=mcpuser:nodejs /app/apps/mcp-server ./apps/mcp-server
COPY --from=builder --chown=mcpuser:nodejs /app/packages/mcp-core ./packages/mcp-core
COPY --from=builder --chown=mcpuser:nodejs /app/packages/automation-flow ./packages/automation-flow

USER mcpuser

EXPOSE 3100

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -fs http://localhost:3100/health || exit 1

CMD ["node", "apps/mcp-server/dist/index.js"]
