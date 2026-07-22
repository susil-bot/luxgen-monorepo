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

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build all packages for a specific tenant (defaults to "demo", which is
# branded as LuxGen). `npm run build` alone is interactive and will hang
# here - always build with an explicit tenant id.
ARG TENANT=demo

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

RUN node scripts/select-tenant.js ${TENANT} && npx turbo run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy API server
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Copy shared packages
COPY --from=builder /app/packages ./packages

# The web app's standalone output above bundles its own trimmed
# node_modules, but the API (apps/api/dist, plain tsc output, not bundled)
# still needs its runtime deps - express, apollo-server-express, mongoose,
# jsonwebtoken, etc. Copy the full install over the top so both processes
# can resolve their requires; this must come AFTER the standalone copy or
# it gets overwritten by the trimmed version.
COPY --from=deps /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000
EXPOSE 4000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "apps/web/server.js"]
