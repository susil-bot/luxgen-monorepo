#!/bin/sh
set -e

cd /app

echo "► [api] Installing dependencies (skipped on subsequent starts if lockfile unchanged)..."
npm install --prefer-offline --no-audit --fund=false

echo "► [api] Waiting for MongoDB..."
until node scripts/docker/wait-for-mongo.js; do
  echo "  MongoDB not ready — retrying in 2s..."
  sleep 2
done
echo "✓ [api] MongoDB is ready"

echo "► [api] Starting dev server (auto-seeds when database volume is empty)..."
exec npm run dev:api
