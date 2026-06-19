#!/bin/sh
set -e

cd /app

echo "► [web] Installing dependencies..."
npm install --prefer-offline --no-audit --fund=false

echo "► [web] Waiting for API..."
until curl -sf "${API_URL:-http://api:4000}/health" >/dev/null 2>&1; do
  echo "  API not ready — retrying in 2s..."
  sleep 2
done
echo "✓ [web] API is ready"

echo "► [web] Starting Next.js dev server..."
exec npm run dev:web
