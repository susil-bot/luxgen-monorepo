#!/usr/bin/env bash
# Phase 3 verification: API push service tests + mobile typecheck + optional live smoke test.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> API push notification unit tests"
npm run test --workspace=@luxgen/api -- pushNotification

echo "==> Mobile TypeScript check"
npm run lint --workspace=@luxgen/mobile

if curl -sf "${LUXGEN_API_URL:-http://localhost:4000/graphql}" \
  -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' >/dev/null 2>&1; then
  echo "==> Live API smoke test (login → push token → enroll)"
  bash "$ROOT/scripts/verify-phase3-live.sh"
else
  echo "==> Skipping live API smoke test (API not running on :4000)"
fi

echo "==> Phase 3 checks passed"
