# ci: dedupe/scope workflow triggers, pin presubmit action, add EC2 OIDC deploy

**Branch:** `chore/optimize-github-actions` (based on `origin/main` @ `7158218`)
**Author:** susil-bot

## Why

Audited all four workflows under `.github/workflows/` for waste and gaps, per
the process-optimization framework (map current state → find waste → design
future state):

**Before**

| Workflow | Trigger | Waste found |
|---|---|---|
| `ci.yml` | every push/PR to main, any path | 4 jobs (lint, format, build, test), each its own `npm ci` — no `paths` filter, so a docs-only PR still runs the full pipeline. No `timeout-minutes` on any job. |
| `web-build.yml` | every push/PR to main, any path | Fully duplicates `ci.yml`'s install, on every push regardless of whether `apps/web` changed. Missing the `concurrency` group `ci.yml` and `e2e.yml` both have, so repeated pushes to one PR could pile up parallel runs. |
| `presubmit.yml` | PR open/sync/reopen | Third-party action (`presubmit/ai-reviewer`) pinned to a movable tag (`@v0.2.5`) while running with `pull-requests:write` + `issues:write` on `pull_request_target`. |
| `e2e.yml` | PR touching e2e paths | `if: false` stub, correctly costs nothing today — left untouched. |
| — | — | No deploy workflow existed at all for the AWS free-tier EC2 target discussed in `docs/AWS_FREE_TIER_RUNBOOK.md`. |

Repo is **public**, so Actions minutes themselves are unlimited/free — the
fixes below are about fast feedback and not tying up GitHub's shared
concurrent-job limit, not a per-minute bill. Tests stay `continue-on-error:
true` (unchanged) per explicit request.

## What changed

- **`ci.yml`**: added `paths-ignore` for `**.md` / `docs/**`, and
  `timeout-minutes` on all four jobs (10–15 min) so a hang doesn't run to
  GitHub's 6-hour default ceiling.
- **`web-build.yml`**: scoped to `paths` that can actually affect the web
  build (`apps/web/**` + the packages it transpiles: `ui`, `auth`, `agent`,
  `design-tokens`, `storefront`, `automation-flow`, plus root
  `package.json`/`package-lock.json`/`turbo.json`), added the missing
  `concurrency` group, added `timeout-minutes`. Kept `continue-on-error:
  true` — this build has the known-flaky path fixed in the earlier
  `chore/aws-free-tier-phase1` PR, and shouldn't block merges on its own.
- **`presubmit.yml`**: pinned `presubmit/ai-reviewer` to its `v0.2.5` commit
  SHA (`5f1290b6142b14b44cd2e8e3ffda84cd0a22e94f`, verified against the
  GitHub release page) instead of the tag.
- **`deploy-ec2.yml`** (new): deploys to the free-tier EC2 box via GitHub
  OIDC → short-lived, least-privilege IAM role → SSM `Send-Command`. Zero
  stored AWS credentials — no SSH key, no long-lived access key in repo
  secrets. Runs after `CI` succeeds on `main`, or manually via
  `workflow_dispatch`. Gated behind a `production` environment (optional
  manual-approval point).
- **`docs/deployment/GITHUB_ACTIONS_OIDC_SETUP.md`** (new): the one-time AWS
  console steps required before `deploy-ec2.yml` will actually run — OIDC
  identity provider, IAM role + trust policy scoped to `main` only,
  least-privilege permissions policy, and the three repo variables to set.

## Not changed (left as-is)

- `e2e.yml` — explicit `if: false` review-only stub, not touched.
- Test job's `continue-on-error: true` — kept non-blocking per request.
- Turborepo remote caching — not wired up (declined for now); revisit later
  since it's the highest-leverage remaining speed win for this monorepo.

## Before you merge

1. `deploy-ec2.yml` will fail until `GITHUB_ACTIONS_OIDC_SETUP.md`'s steps
   are done in the AWS console (OIDC provider + role + repo variables) —
   this PR is safe to merge before that; the workflow just won't have
   anything to assume yet.
2. Sanity-check the `paths` list in `web-build.yml` against any packages
   added to `apps/web`'s `transpilePackages` after this PR.

## Checklist

- [ ] Confirm `AWS_DEPLOY_ROLE_ARN` / `AWS_REGION` / `EC2_INSTANCE_TAG` repo
      variables are not needed before merge (they're only needed before
      `deploy-ec2.yml`'s first real run)
- [ ] Push a trivial docs-only change and confirm `ci.yml`/`web-build.yml`
      correctly skip
- [ ] Push an `apps/web` change and confirm `web-build.yml` still triggers
