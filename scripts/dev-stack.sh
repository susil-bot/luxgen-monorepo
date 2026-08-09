#!/usr/bin/env bash
# Start the minimal dev stack for a LuxGen developer role.
# All roles share the same GraphQL API + MongoDB; only the client app differs.
#
# Usage (from repo root):
#   ./scripts/dev-stack.sh web
#   ./scripts/dev-stack.sh admin
#   ./scripts/dev-stack.sh mobile
#   ./scripts/dev-stack.sh api
#
# Or via Make: make dev-stack-web

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ROLE="${1:-}"

print_usage() {
  cat <<'EOF'
LuxGen role-based dev stacks (shared backend: apps/api + MongoDB)

  web     API + Next.js web (learner/marketing routes)
  admin   API + Next.js web (commerce/admin: /admin, /orders, /products)
  mobile  API + Expo app (apps/mobile — requires feat/mobile-foundation merged)
  api     API only (GraphQL at :4000)

Examples:
  make dev-stack-web
  make dev-stack-admin
  npm run dev:stack:mobile

Prerequisites: Docker (MongoDB). Redis/Ollama start with infra but are optional for most UI work.
EOF
}

ensure_infra() {
  if docker compose ps mongodb 2>/dev/null | grep -qE 'Up|running'; then
    return 0
  fi
  echo "► MongoDB not running — starting dev infra (MongoDB, Redis, Ollama)..."
  docker compose up mongodb redis ollama -d
  echo "  MongoDB: localhost:27017"
}

ensure_web_env() {
  if [[ ! -f apps/web/.env.local ]]; then
    cp apps/web/.env.example apps/web/.env.local
    echo "  Created apps/web/.env.local"
  fi
  if [[ ! -f apps/api/.env ]]; then
    cp apps/api/.env.example apps/api/.env
    echo "  Created apps/api/.env"
  fi
}

# apps/api's dev server (ts-node-dev --transpile-only) loads workspace packages
# (@luxgen/db, @luxgen/billing, etc.) through their compiled dist/ output via each
# package's package.json "main" field -- plain Node require() resolution, not
# webpack/tsconfig-paths. Unlike `next dev` (which resolves @luxgen/ui etc. straight
# from source), a stale or missing dist/ silently ships old code: e.g. a newly added
# model export resolves to `undefined` at runtime with no build-time warning, because
# dev mode's turbo pipeline has no dependsOn and never rebuilds dependencies. dist/ is
# gitignored, so a fresh clone or a newly pulled branch always needs this once.
# Several of these packages' own "build" scripts intentionally exit non-zero even when
# they've emitted usable output (tracked pre-existing Mongoose/type-error baselines,
# see scripts/tsc-tolerant.js) -- `|| true` so that known, tracked drift never blocks
# local dev from starting; a genuinely broken package still shows its errors above.
build_api_deps() {
  echo "► Building @luxgen/api's workspace dependencies (dist/ is gitignored, always stale on a fresh pull)..."
  npx turbo run build --filter=@luxgen/api^... || true
}

ensure_mobile_env() {
  if [[ ! -d apps/mobile ]]; then
    echo "✗ apps/mobile not found. Merge PR #39 (feat/mobile-foundation) or checkout that branch."
    exit 1
  fi
  if [[ ! -f apps/mobile/.env.local ]]; then
    cp apps/mobile/.env.example apps/mobile/.env.local
    echo "  Created apps/mobile/.env.local"
  fi
}

print_urls() {
  local role="$1"
  echo ""
  echo "► Stack ready ($role)"
  echo "  GraphQL:  http://localhost:4000/graphql"
  case "$role" in
    web)
      echo "  Web:      http://demo.localhost:3000"
      echo "  Learn:    http://demo.localhost:3000/learn"
      echo "  Login:    http://demo.localhost:3000/login"
      ;;
    admin)
      echo "  Web:      http://demo.localhost:3000"
      echo "  Orders:   http://demo.localhost:3000/orders"
      echo "  Customers:http://demo.localhost:3000/admin/customers"
      echo "  Products: http://demo.localhost:3000/products"
      ;;
    mobile)
      echo "  Expo:     scan QR in terminal (iOS Simulator: press i)"
      echo "  API URL:  see apps/mobile/.env.local (EXPO_PUBLIC_GRAPHQL_URL)"
      ;;
    api)
      echo "  API only — point any client at http://localhost:4000/graphql"
      ;;
  esac
  echo "  Demo:     alex.thompson@demo.com / password123 · tenant demo"
  echo ""
}

if [[ -z "$ROLE" ]]; then
  print_usage
  exit 1
fi

ensure_infra
ensure_web_env
build_api_deps

case "$ROLE" in
  web|admin)
    print_urls "$ROLE"
    exec npx turbo run dev --filter=@luxgen/api --filter=@luxgen/web
    ;;
  mobile)
    ensure_mobile_env
    print_urls mobile
    exec npx turbo run dev --filter=@luxgen/api --filter=@luxgen/mobile
    ;;
  api|backend)
    print_urls api
    exec npx turbo run dev --filter=@luxgen/api
    ;;
  help|-h|--help)
    print_usage
    exit 0
    ;;
  *)
    echo "Unknown role: $ROLE"
    print_usage
    exit 1
    ;;
esac
