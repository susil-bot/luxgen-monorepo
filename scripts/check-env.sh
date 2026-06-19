#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# check-env.sh — Validates required environment variables
# Usage: sh scripts/check-env.sh [web|api|staging|prod]
#
# Automatically loads the matching .env file:
#   web     → apps/web/.env.local
#   api     → apps/api/.env
#   staging → .env.staging
#   prod    → .env.production
# ─────────────────────────────────────────────────────────────────────────────

TARGET="${1:-web}"
ERRORS=0

load_env() {
  env_file="$1"
  if [ -f "$env_file" ]; then
    set -a
    . "$env_file" 2>/dev/null || true
    set +a
    echo "  (loaded $env_file)"
  else
    echo "  ⚠  $env_file not found — checking shell environment only"
  fi
}

check_var() {
  var_name="$1"
  required="$2"
  eval "val=\"\${${var_name}}\""
  if [ -z "$val" ]; then
    if [ "$required" = "required" ]; then
      echo "  ✗ MISSING (required): $var_name"
      ERRORS=$((ERRORS + 1))
    else
      echo "  ○ not set (optional): $var_name"
    fi
  else
    case "$var_name" in
      *SECRET*|*PASSWORD*|*KEY*)
        echo "  ✓ $var_name=****"
        ;;
      *)
        echo "  ✓ $var_name=$val"
        ;;
    esac
  fi
}

echo ""
echo "Checking environment: $TARGET"
echo "─────────────────────────────"

case "$TARGET" in
  web)
    load_env "apps/web/.env.local"
    echo ""
    check_var "NODE_ENV"             required
    check_var "API_URL"              required
    check_var "NEXT_PUBLIC_API_URL"  required
    check_var "NEXT_PUBLIC_APP_URL"  required
    check_var "OLLAMA_HOST"          optional
    check_var "OLLAMA_MODEL"         optional
    ;;
  api)
    load_env "apps/api/.env"
    echo ""
    check_var "NODE_ENV"    required
    check_var "PORT"        required
    check_var "MONGODB_URI" required
    check_var "REDIS_URL"   required
    check_var "JWT_SECRET"  required
    check_var "CORS_ORIGIN" required
    ;;
  staging)
    load_env ".env.staging"
    echo ""
    check_var "NODE_ENV"             required
    check_var "MONGO_ROOT_USERNAME"  required
    check_var "MONGO_ROOT_PASSWORD"  required
    check_var "JWT_SECRET"           required
    check_var "CORS_ORIGIN"          required
    check_var "NEXT_PUBLIC_API_URL"  required
    check_var "NEXT_PUBLIC_APP_URL"  required
    check_var "OLLAMA_MODEL"         optional
    ;;
  prod)
    load_env ".env.production"
    echo ""
    check_var "NODE_ENV"             required
    check_var "MONGO_ROOT_USERNAME"  required
    check_var "MONGO_ROOT_PASSWORD"  required
    check_var "JWT_SECRET"           required
    check_var "CORS_ORIGIN"          required
    check_var "NEXT_PUBLIC_API_URL"  required
    check_var "NEXT_PUBLIC_APP_URL"  required
    ;;
  *)
    echo "Unknown target: $TARGET"
    echo "Usage: sh scripts/check-env.sh [web|api|staging|prod]"
    exit 1
    ;;
esac

echo ""
if [ $ERRORS -gt 0 ]; then
  echo "✗ $ERRORS required variable(s) missing. See .env.example files."
  exit 1
else
  echo "✓ All required variables present."
fi
echo ""
