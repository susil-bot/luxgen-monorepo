#!/usr/bin/env bash
# Smoke test LuxGen MCP HTTP health endpoint (Phase 5+).
set -euo pipefail

URL="${MCP_HTTP_URL:-http://127.0.0.1:3100/health}"

if ! curl -sf "$URL" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
  echo "✗ MCP HTTP health check failed at $URL"
  echo "  Start server: MCP_TRANSPORT=http MCP_HTTP_PORT=3100 npm run dev:mcp"
  exit 1
fi

echo "✓ MCP HTTP health OK ($URL)"
