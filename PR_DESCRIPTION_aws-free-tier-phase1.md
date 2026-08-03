# fix(web): resolve tenant subdomains on production custom domains, not just localhost

**Branch:** `chore/aws-free-tier-phase1` (based on `origin/main` @ `7158218`)
**Author:** susil-bot

## Why

`docs/deployment/FREE_TIER_CLOUD.md` (Step 7) documents deploying `apps/web` to Vercel
behind a wildcard DNS record (`*.yourdomain.com`) for multi-tenant subdomain routing.
`apps/web/middleware.ts` only ever matched `*.localhost` hostnames — so once actually
deployed to a real domain, the root-path → `/dashboard` redirect and the `?tenant=`
query-param rewrite silently never fired. The server side
(`apps/api/src/middleware/tenantRouting.ts`) already handled both local and production
hostnames correctly; the web app's edge middleware did not, so the two were inconsistent.

## What changed

- `apps/web/middleware.ts`: extracted subdomain resolution into `extractSubdomain()`,
  mirroring `extractSubdomain`/`extractCustomDomain` from
  `apps/api/src/middleware/tenantRouting.ts` — handles `*.localhost` (dev) and any
  production custom domain (3+ label hostnames), and explicitly excludes
  `*.vercel.app` / `*.netlify.app` so Vercel preview deploy URLs are never misrouted
  as a tenant subdomain.
- `apps/web/lib/vitest-auto/41-middleware-tenant.auto.test.ts`: new test file following
  the repo's existing `vitest-auto` convention (see `32-tenant-host.auto.test.ts`) —
  this code path had zero test coverage before.
- `docs/deployment/FREE_TIER_CLOUD.md`: updated Step 7 to state that `middleware.ts`
  already handles this, instead of telling the reader to go configure it themselves.

## How this was found

Audited the repo's actual free-tier deployment path
(`docs/deployment/FREE_TIER_CLOUD.md` + `deploy/platforms/*`) against the real code on
`origin/main` — confirmed `/health`, `/api/billing/webhook`, `/api/jobs/listing-reminders`
(with `JOBS_API_KEY`/`x-jobs-key` auth), Redis wiring (`apps/api/src/lib/redis.ts`), and
`docs/deployment/ENV_PRODUCTION.md` are all real and correct. The subdomain middleware gap
was the one concrete piece of the documented deployment flow that doesn't actually work as
written.

## Testing

- Added unit coverage for `extractSubdomain()` covering: local `*.localhost` subdomains,
  bare `localhost`/`127.0.0.1`, `www`/apex exclusion, production wildcard-DNS subdomains,
  and Vercel/Netlify preview-URL exclusion.
- Not run in this environment (no network/npm-install access in the sandbox this was
  prepared in) — please run `npm test` (root, via `turbo run test` → the `web-auto` vitest
  project) before merging.

## Checklist

- [ ] `npm test` passes (`web-auto` vitest project picks up the new test file)
- [ ] `npm run build --workspace=@luxgen/web` succeeds
- [ ] Manually verify on a preview deploy: a subdomain of the preview's `*.vercel.app`
      host is **not** treated as a tenant (should fall through to `NextResponse.next()`)
