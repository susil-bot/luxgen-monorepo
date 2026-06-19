#!/usr/bin/env sh
# Full validate — lint + build. Used in CI.
set -e

echo "► Linting..."
npm run lint

"$(dirname "$0")/validate-build.sh"

echo "✓ Full validation passed"
