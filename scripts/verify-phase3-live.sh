#!/usr/bin/env bash
# Live API smoke test for Phase 3 mobile flow (login → push token → enroll).
set -euo pipefail

API="${LUXGEN_API_URL:-http://localhost:4000/graphql}"
TENANT="${LUXGEN_TENANT:-demo}"
EMAIL="${LUXGEN_TEST_EMAIL:-alex.thompson@demo.com}"
PASSWORD="${LUXGEN_TEST_PASSWORD:-password123}"

gql() {
  local query="$1"
  local token="${2:-}"
  local extra_headers="${3:-}"
  local payload
  payload=$(node -e "console.log(JSON.stringify({ query: process.argv[1] }))" "$query")
  if [ -n "$token" ]; then
    curl -sf "$API" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -H "x-tenant: $TENANT" \
      $extra_headers \
      -d "$payload"
  else
    curl -sf "$API" \
      -H "Content-Type: application/json" \
      -H "x-tenant: $TENANT" \
      -d "$payload"
  fi
}

echo "==> Login"
LOGIN_RESP=$(gql "mutation { login(input: { email: \"$EMAIL\", password: \"$PASSWORD\" }) { token user { id tenant { id } } } }")
TOKEN=$(node -e "const r=JSON.parse(process.argv[1]); if(r.errors) { console.error(r.errors); process.exit(1);} console.log(r.data.login.token)" "$LOGIN_RESP")
USER_ID=$(node -e "const r=JSON.parse(process.argv[1]); console.log(r.data.login.user.id)" "$LOGIN_RESP")
TENANT_ID=$(node -e "const r=JSON.parse(process.argv[1]); console.log(r.data.login.user.tenant.id)" "$LOGIN_RESP")
echo "    user=$USER_ID tenant=$TENANT_ID"

echo "==> Register push token"
PUSH_RESP=$(gql "mutation { registerPushToken(token: \"ExponentPushToken[phase3-smoke-test]\") }" "$TOKEN")
node -e "const r=JSON.parse(process.argv[1]); if(r.errors) { console.error(r.errors); process.exit(1);} if(r.data.registerPushToken !== true) process.exit(1)" "$PUSH_RESP"
echo "    push token registered"

echo "==> List published courses"
COURSES_RESP=$(gql "{ courses(tenantId: \"$TENANT_ID\") { id title status } }" "$TOKEN")
COURSE_ID=$(node -e "
  const r=JSON.parse(process.argv[1]);
  if(r.errors) { console.error(r.errors); process.exit(1);}
  const courses = r.data.courses || [];
  const course = courses.find(c => c.status === 'PUBLISHED') ?? courses[0];
  if (!course) { console.error('No courses in tenant'); process.exit(1); }
  console.log(course.id);
" "$COURSES_RESP")
echo "    course=$COURSE_ID"

echo "==> Enroll student"
ENROLL_RESP=$(gql "mutation { enrollStudent(courseId: \"$COURSE_ID\", studentId: \"$USER_ID\") { id title } }" "$TOKEN")
node -e "const r=JSON.parse(process.argv[1]); if(r.errors && !String(r.errors[0].message).includes('already')) { console.error(r.errors); process.exit(1);}" "$ENROLL_RESP"
echo "    enrollment ok (or already enrolled)"

echo "==> Phase 3 live API smoke test passed"
