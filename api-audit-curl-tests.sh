#!/usr/bin/env bash
# LuxGen live API audit — auth flow curl tests.
# Generated for a one-off functional audit; safe to delete after use, not meant to be committed.
#
# Usage:
#   bash api-audit-curl-tests.sh
#
# Writes full request/response evidence to api-audit-results.log in this same directory.
# Creates ONE real user in production MongoDB Atlas (see "Test email used" at the end) —
# I don't have admin credentials to delete it via the API, so please remove it from Atlas
# afterward (search Users collection for the email prefix "claude-audit-test-").

set -uo pipefail

BASE="https://luxgen-api.onrender.com"
TENANT="demo"
STAMP=$(date +%s)
EMAIL="claude-audit-test-${STAMP}@example.com"
PASSWORD="TestPass123!"
OUT="$(dirname "$0")/api-audit-results.log"

: > "$OUT"

run() {
  local name="$1"; shift
  {
    echo "### $name"
    echo "--- request: $* ---"
  } >> "$OUT"
  curl -sS -m 20 -w "\nHTTP_STATUS:%{http_code}  TIME:%{time_total}s\n" "$@" >> "$OUT" 2>&1
  echo "" >> "$OUT"
  echo "done: $name"
}

{
  echo "== LuxGen live API audit — $(date) =="
  echo "Base: $BASE   Tenant header: $TENANT   Test email: $EMAIL"
  echo
} >> "$OUT"

# ─── Registration ────────────────────────────────────────────────────────────
run "REGISTER valid" -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"firstName\":\"Claude\",\"lastName\":\"Audit\"}"

run "REGISTER duplicate email" -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"firstName\":\"Claude\",\"lastName\":\"Audit\"}"

run "REGISTER invalid email format" -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "{\"email\":\"not-an-email\",\"password\":\"$PASSWORD\",\"firstName\":\"Claude\",\"lastName\":\"Audit\"}"

run "REGISTER weak password (<6 chars)" -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "{\"email\":\"claude-audit-weakpw-${STAMP}@example.com\",\"password\":\"123\",\"firstName\":\"Claude\",\"lastName\":\"Audit\"}"

run "REGISTER missing required fields" -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "{\"email\":\"claude-audit-missing-${STAMP}@example.com\"}"

run "REGISTER malformed JSON payload" -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "{not valid json"

run "REGISTER no tenant header" -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"claude-audit-notenant-${STAMP}@example.com\",\"password\":\"$PASSWORD\",\"firstName\":\"Claude\",\"lastName\":\"Audit\"}"

# ─── Login ───────────────────────────────────────────────────────────────────
run "LOGIN valid" -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

run "LOGIN wrong password" -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"WrongPassword123\"}"

run "LOGIN unknown email" -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "{\"email\":\"no-such-user-${STAMP}@example.com\",\"password\":\"$PASSWORD\"}"

run "LOGIN missing credentials" -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "{}"

run "LOGIN malformed payload" -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "not json at all"

# Capture a real token for the protected-route + logout tests below
LOGIN_JSON=$(curl -sS -m 20 -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo "$LOGIN_JSON" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Captured token (truncated): ${TOKEN:0:24}..." >> "$OUT"
echo "Captured token (truncated): ${TOKEN:0:24}..."

# ─── Protected route (/api/auth/me) ────────────────────────────────────────
run "PROTECTED /me valid token" -X GET "$BASE/api/auth/me" -H "Authorization: Bearer $TOKEN" -H "x-tenant: $TENANT"
run "PROTECTED /me invalid token" -X GET "$BASE/api/auth/me" -H "Authorization: Bearer this.is.not.a.valid.jwt" -H "x-tenant: $TENANT"
run "PROTECTED /me missing token" -X GET "$BASE/api/auth/me" -H "x-tenant: $TENANT"

# ─── GraphQL transport (same token, different transport — mobile/web use this) ──
run "GRAPHQL currentUser with token" -X POST "$BASE/graphql" -H "Content-Type: application/json" -H "x-tenant: $TENANT" -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ currentUser { id email role tenant { subdomain } } }"}'

run "GRAPHQL currentUser without token" -X POST "$BASE/graphql" -H "Content-Type: application/json" -H "x-tenant: $TENANT" \
  -d '{"query":"{ currentUser { id email } }"}'

# ─── Logout ─────────────────────────────────────────────────────────────────
run "LOGOUT" -X POST "$BASE/api/auth/logout" -H "x-tenant: $TENANT" -H "Authorization: Bearer $TOKEN"

# ─── Not practically testable via curl alone (documented, not skipped silently) ──
{
  echo "### NOTE: not tested in this run"
  echo "- Locked/disabled account login: requires an existing deactivated user (admin action) — none available."
  echo "- Expired token: cannot forge a validly-signed-but-expired JWT without JWT_SECRET (a Render-only secret);"
  echo "  would require waiting out the real JWT_EXPIRES_IN window (7d default) to test authentically."
  echo "- Cross-tenant email uniqueness: production only has the 'demo' tenant seeded (TENANT_SUBDOMAINS=demo),"
  echo "  so registering the same email on a second tenant can't be exercised live right now. Code review shows"
  echo "  the uniqueness check in userRegistrationService.ts queries User.findOne({ email }) with NO tenant filter —"
  echo "  i.e. email is globally unique across ALL tenants, not per-tenant. Worth confirming this is intentional."
  echo
} >> "$OUT"

{
  echo "== Done. Full evidence in $OUT =="
  echo "Test email created in production (needs manual cleanup, no admin token available): $EMAIL"
} >> "$OUT"

echo
echo "== Done. Full evidence written to: $OUT =="
echo "Test email created in production — please delete manually from Atlas: $EMAIL"
