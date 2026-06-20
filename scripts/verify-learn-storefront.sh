#!/usr/bin/env bash
# Learner storefront smoke test: public browse + authenticated enroll.
set -euo pipefail

API="${LUXGEN_API_URL:-http://localhost:4000/graphql}"
WEB="${LUXGEN_WEB_URL:-http://demo.localhost:3000}"
TENANT="${LUXGEN_TENANT:-demo}"
EMAIL="${LUXGEN_TEST_EMAIL:-alex.thompson@demo.com}"
PASSWORD="${LUXGEN_TEST_PASSWORD:-password123}"

gql() {
  local query="$1"
  local token="${2:-}"
  local payload
  payload=$(node -e "console.log(JSON.stringify({ query: process.argv[1] }))" "$query")
  if [ -n "$token" ]; then
    curl -sf "$API" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -H "x-tenant: $TENANT" \
      -d "$payload"
  else
    curl -sf "$API" \
      -H "Content-Type: application/json" \
      -H "x-tenant: $TENANT" \
      -d "$payload"
  fi
}

echo "==> Public tenant lookup"
TENANT_RESP=$(gql "{ tenantBySubdomain(subdomain: \"$TENANT\") { id name } }")
TENANT_ID=$(node -e "
  const r=JSON.parse(process.argv[1]);
  if(r.errors) { console.error(r.errors); process.exit(1);}
  console.log(r.data.tenantBySubdomain.id);
" "$TENANT_RESP")
echo "    tenant=$TENANT_ID"

echo "==> Public course catalog (anonymous)"
COURSES_RESP=$(gql "{ courses(tenantId: \"$TENANT_ID\") { id title status } }")
PUBLISHED=$(node -e "
  const r=JSON.parse(process.argv[1]);
  if(r.errors) { console.error(r.errors); process.exit(1);}
  const list = r.data.courses || [];
  console.log(list.filter(c => c.status === 'PUBLISHED').length);
" "$COURSES_RESP")
echo "    published courses visible: $PUBLISHED"

echo "==> Web /learn page"
curl -sf -o /dev/null -w "    HTTP %{http_code}\n" "$WEB/learn" || curl -sf -o /dev/null -w "    HTTP %{http_code}\n" "http://localhost:3000/learn"

echo "==> Login + enroll"
LOGIN_RESP=$(gql "mutation { login(input: { email: \"$EMAIL\", password: \"$PASSWORD\" }) { token user { id } } }")
TOKEN=$(node -e "const r=JSON.parse(process.argv[1]); if(r.errors){console.error(r.errors);process.exit(1)} console.log(r.data.login.token)" "$LOGIN_RESP")
USER_ID=$(node -e "const r=JSON.parse(process.argv[1]); console.log(r.data.login.user.id)" "$LOGIN_RESP")

AUTH_COURSES=$(gql "{ courses(tenantId: \"$TENANT_ID\") { id title status } }" "$TOKEN")
COURSE_ID=$(node -e "
  const r=JSON.parse(process.argv[1]);
  if(r.errors) { console.error(r.errors); process.exit(1);}
  const list = r.data.courses || [];
  const course = list.find(c => c.status === 'PUBLISHED') ?? list[0];
  if (!course) { console.error('No courses in tenant'); process.exit(1); }
  console.log(course.id);
" "$AUTH_COURSES")

gql "mutation { enrollStudent(courseId: \"$COURSE_ID\", studentId: \"$USER_ID\") { id } }" "$TOKEN" >/dev/null
echo "    enrollment ok"

echo "==> Learner storefront smoke test passed"
