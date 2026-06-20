#!/usr/bin/env sh
# Build validation — used by Husky pre-push and GitHub Actions CI.
# API deps and web production build must both pass (REQUIRE_WEB_BUILD=1 in CI).
set -e

export NEXT_PUBLIC_GRAPHQL_URL="${NEXT_PUBLIC_GRAPHQL_URL:-http://localhost:4000/graphql}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:4000}"
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
export API_URL="${API_URL:-http://localhost:4000}"

echo "► Building API workspace dependencies..."
npm run build:api:deps

echo "► Building web app..."
if npm run build:web; then
  echo "✓ Web build passed"
else
  echo "✗ Web build failed"
  if [ "${CI:-}" = "true" ] || [ "${REQUIRE_WEB_BUILD:-}" = "1" ]; then
    exit 1
  fi
fi

echo "✓ Build validation passed"
