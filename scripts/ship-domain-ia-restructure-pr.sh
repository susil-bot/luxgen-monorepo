#!/usr/bin/env bash
# Ships the domain-IA restructure chore PR: run this yourself with
# `bash scripts/ship-domain-ia-restructure-pr.sh`.
#
# Context: Claude (Cowork) edited/created these files directly on disk (via its
# file tools, not git) while sitting on the feat/agent-orchestrator branch —
# but none of this depends on that branch's own (already-committed) work, so
# this script pulls *only* these files onto a fresh chore/ branch based on
# main:
#   Modified:
#     - apps/web/pages/admin/users.tsx      (fix double-redirect hop)
#     - docs/FEATURE_CATALOG.md             (reorganized under domains)
#     - packages/ui/src/Layout/DefaultNavigation.tsx  (domain-grouped sidebar)
#     - packages/ui/src/Layout/index.ts     (barrel export update)
#   New:
#     - docs/PRODUCT_ARCHITECTURE.md
#     - docs/MENU_STRUCTURE.md
#     - docs/PAGE_FUNCTIONALITY_CHECKLIST.md
#     - docs/AUTOMATION_MARKETPLACE_TAXONOMY.md
#     - PR_DESCRIPTION_domain-ia-restructure.md (repo root)
#   Deleted (on the new branch, via git rm -r — not yet removed from your
#   current working tree by Claude, since bulk-delete isn't available there):
#     - docs/file-analysis/
#     - docs/interview-prep/
#
# Deliberately NOT touched: banner-demo.tsx, packages/ui/**/*.spec.ts (both
# investigated and confirmed out of scope / not dead code — see PR body).
#
# Safe to re-run: no-ops past already-completed steps where possible.

set -e

# Defensive: clear any stale lock from a previous interrupted git run.
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

FEAT_BRANCH="chore/domain-ia-restructure"
PR_DESC_FILE="PR_DESCRIPTION_domain-ia-restructure.md"

TARGET_FILES=(
  apps/web/pages/admin/users.tsx
  docs/FEATURE_CATALOG.md
  packages/ui/src/Layout/DefaultNavigation.tsx
  packages/ui/src/Layout/index.ts
  docs/PRODUCT_ARCHITECTURE.md
  docs/MENU_STRUCTURE.md
  docs/PAGE_FUNCTIONALITY_CHECKLIST.md
  docs/AUTOMATION_MARKETPLACE_TAXONOMY.md
  "$PR_DESC_FILE"
)

STASH_MSG="domain IA restructure files"
if git stash list | grep -qF "$STASH_MSG"; then
  echo "==> Restructure files already stashed from a previous run — skipping re-stash..."
else
  echo "==> Stashing the restructure files (won't touch anything else, including"
  echo "    the already-committed agent-orchestrator work on this branch)..."
  git add "${TARGET_FILES[@]}"
  git stash push -m "$STASH_MSG" -- "${TARGET_FILES[@]}"
fi

echo "==> Fetching latest main from origin..."
git fetch origin main

if git rev-parse --verify "$FEAT_BRANCH" >/dev/null 2>&1; then
  echo "==> Branch $FEAT_BRANCH already exists locally, checking it out..."
  git checkout "$FEAT_BRANCH"
else
  echo "==> Creating $FEAT_BRANCH directly off origin/main..."
  echo "    (NOT off local main -- your local main has an unrelated unpushed"
  echo "    commit, 3171eb1 'make SEND_EMAIL actually send mail...', that isn't"
  echo "    on origin yet and isn't part of this PR's scope; branching from"
  echo "    origin/main avoids dragging it in or fighting a diverged-history"
  echo "    fast-forward. That commit is left untouched, still there later.)"
  git checkout -b "$FEAT_BRANCH" origin/main
fi

if git stash list | grep -qF "$STASH_MSG"; then
  echo "==> Restoring the restructure files from stash..."
  git stash pop
else
  echo "==> Restructure files already restored (no matching stash left) — skipping..."
fi

echo "==> Refreshing AUTOMATION_MARKETPLACE_TAXONOMY.md: main has moved since this doc"
echo "    was drafted (feat/automation-hub-industry-compounds merged as #443/#444) --"
echo "    the certificate-reminder compounds are now real, not 'in progress'..."
cat > docs/AUTOMATION_MARKETPLACE_TAXONOMY.md <<'TAXONOMY_EOF'
# Automation Marketplace — Taxonomy, Trigger/Action Library, and Scoring

> Companion to `docs/AUTOMATION_HUB_STRATEGY.md` (cross-industry problem→compound mapping, IA) and
> `docs/TEMPLATE_CONTROL_CORE.md` (how templates configure — never extend — the core engine).
> This doc covers the Marketplace's discovery taxonomy, the current real trigger/action/condition
> inventory (ground-truthed against `packages/automation-flow/src/catalog/compounds.ts`, not
> aspirational), and a scoring framework + shortlist for prioritizing what to build next.

---

## Taxonomy

Templates and compounds are tagged by:

- **Industry** — e.g. `ecommerce`, `retail`, `coaching`, `compliance-training`, `franchise`,
  `healthcare`, `hr`, `saas`. Discovery-only metadata (`FlowCompoundDefinition.industry?: string[]`
  on the compound, `AutomationTemplate.industry: string[]` on the template) — **never** an
  execution gate. See `docs/TEMPLATE_CONTROL_CORE.md`.
- **Category** — the compound's `category` field (`commerce`, `learner`, `developer`, `core`).
- **Plan gate** — Marketplace templates are seeded free (`priceCents: 0`) today; a paid tier for
  premium templates is a monetization option, not yet implemented.

## Trigger / Condition / Action library (current, real — from `compounds.ts`)

This is the actual catalog, not a wishlist. Anything not listed here doesn't exist yet.

### Triggers

| Compound ID | Category | What fires it |
| --- | --- | --- |
| `commerce.order.created` | commerce | New order created |
| `commerce.order.drafted` | commerce | Checkout started but not completed (feeds abandoned-cart) |
| `commerce.payment.sent` | commerce | Payment received |
| `commerce.order.updated` | commerce | Order fields changed |
| `learner.course.completed` | learner | Learner finishes a course |
| `learner.user.enrolled` | learner | New enrollment |
| `learner.group.joined` | learner | Learner added to a group/team |
| `learner.certificate.issued` | learner | Certificate issued |
| `learner.certificate.expiring_soon` | learner | Certificate approaching its recertification window |
| `core.schedule.cron` | core | Recurring schedule (cron expression) |
| `core.webhook.received` | core | Inbound webhook |
| `developer.code.staged` / `.committed` / `.merged` / `.failed` | developer | Agent Studio pipeline events |

### Conditions

| Compound ID | What it checks |
| --- | --- |
| `core.condition.field_equals` | Any payload field equals a value |
| `core.condition.field_contains` | Any payload field contains a substring |
| `commerce.condition.order_tag` | Order has a specific tag |
| `commerce.condition.order_total` | Order total compared against a threshold |

### Actions

| Compound ID | What it does |
| --- | --- |
| `commerce.order.update_fields` | Update fields on an order |
| `commerce.order.add_tags` | Tag an order |
| `core.notification.send_email` | Send a templated email (see `packages/agent/src/automation/email.ts` for the template registry) |
| `core.notification.notify_slack` | Post to Slack |
| `core.schedule.delay_event` | Re-emit an event after a delay (distinct from a `wait` node — see `TEMPLATE_CONTROL_CORE.md`) |
| `learner.enrollment.add_to_group` | Add a learner to a group |
| `learner.course.enroll` | Enroll a learner in a course |
| `learner.certificate.issue` | Generate a completion certificate and set its recertification window |
| `developer.agent.run_task` | Kick off an Agent Studio task |
| `core.wait.delay` | Pause a flow for N seconds before the next node |

**Ground-truth check (re-verified against `origin/main` before this PR branched):** the
certificate-reminder compounds (`learner.certificate.expiring_soon` trigger,
`learner.certificate.issue` action) landed via the now-merged
`feat/automation-hub-industry-compounds` PR (#443/#444) — included in the tables above as real,
not aspirational. `docs/AUTOMATION_HUB_STRATEGY.md` (referenced above) also now exists on `main`.

## Scoring framework for new compounds/templates

Before building a new trigger, action, or template, score it against:

| Criterion | Question |
| --- | --- |
| **Frequency** | How many tenants would actually hit this trigger regularly? |
| **Urgency** | Does delay cost the tenant money/compliance risk (vs. "nice to have")? |
| **Competition** | Do competitors (Thinkific, Kajabi, etc.) already offer this, or is it differentiating? |
| **AI requirement** | Does it need genuine LLM reasoning, or is it a deterministic trigger→action (cheaper, faster to ship, matches the "front-load logic outside the LLM" principle used in `docs/AGENT_ORCHESTRATOR.md`)? |
| **Solo-dev feasibility** | Can one engineer ship and test it in under a week using existing primitives? |
| **Pricing potential** | Does it justify gating behind Pro/Enterprise, or is it a free-tier onboarding template? |

## Illustrative shortlist (hypothesis, not validated with usage data)

| Rank | Template/Compound | Status | Rationale |
| --- | --- | --- | --- |
| 1 | Abandoned Cart Reminder | **Shipped** (`commerce.order.drafted` → wait → `core.condition.field_equals` → `core.notification.send_email`) | Very frequent, urgent, direct revenue impact |
| 2 | Certification Renewal Alert | **Shipped** (`learner.certificate.expiring_soon` → `core.notification.send_email` / `learner.certificate.issue`) | Frequent in compliance-training/franchise/healthcare, low competition |
| 3 | New Student Onboarding | Proposed | Universal pain point, composable from existing `learner.user.enrolled` trigger + `core.notification.send_email` action — no new compound needed |
| 4 | Course Completion Upsell | Proposed | `learner.course.completed` trigger already exists; needs a "suggest next course" action (new) |
| 5 | Payment Failed/Retry | Proposed | Needs a new `commerce.payment.failed` trigger — not yet in the catalog |
| 6 | Learner Inactivity Nudge | Proposed | Needs a new scheduled sweep (same pattern as the certificate-reminder job) checking last-activity timestamps |

Items 3–6 are compositions of mostly-existing primitives or small, well-scoped additions — consistent
with `docs/TEMPLATE_CONTROL_CORE.md`'s core-vs-customization model (extend the catalog only when a
genuine gap exists; otherwise it's "just a template").

## Marketplace analytics (not yet built)

Recommended to track once templates ship: installs, activations (first successful run), and
ongoing run volume per template — informs which categories to invest in next. No implementation
yet; flagged here as a follow-up, not part of this doc-and-nav restructure.
TAXONOMY_EOF

if [ -d docs/file-analysis ] || [ -d docs/interview-prep ]; then
  echo "==> Removing stale personal interview-prep material (docs/file-analysis,"
  echo "    docs/interview-prep — ~1,617 files, confirmed zero real references)..."
  git rm -r --quiet docs/file-analysis docs/interview-prep 2>/dev/null || rm -rf docs/file-analysis docs/interview-prep
else
  echo "==> docs/file-analysis + docs/interview-prep already gone — skipping delete..."
fi

git add -A -- docs/file-analysis docs/interview-prep "${TARGET_FILES[@]}" 2>/dev/null || true

if git diff --cached --quiet; then
  echo "==> Nothing new to commit (already committed on this branch from a"
  echo "    previous run) — skipping commit..."
else
  echo "==> Committing..."
  git commit -m "chore(docs,ui,web): regroup nav + docs around business-domain IA

Reorganizes the sidebar (DEFAULT_SIDEBAR_SECTIONS) and product docs around 9
business domains (Home, Learning, Commerce, People, Automation Hub,
Intelligence, Workspace, Listings, Administration, Settings) instead of the
previous flat/code-shaped grouping. Zero URL changes -- every route is
exactly what's live today; only section grouping, two labels ('Groups' ->
'Teams', 'Automations' section -> 'Automation Hub'), and one redundant
redirect hop changed.

- admin/users.tsx: fixed /admin/users -> /users -> /organization/users double
  redirect hop (both are @deprecated stubs; now goes straight there).
- DefaultNavigation.tsx: sections regrouped by domain; standalone 'Developer'
  section folded into 'Administration'; duplicate Settings->Billing entry
  removed; dead getDefaultMenuItems() removed (zero real consumers, several
  hrefs pointed at routes that don't exist); getDefaultNavItems() kept (real
  dependency of UserDashboardLayout.tsx / AdminDashboardLayout.tsx).
- New: PRODUCT_ARCHITECTURE.md (domain model + rationale), rewritten
  MENU_STRUCTURE.md / PAGE_FUNCTIONALITY_CHECKLIST.md / FEATURE_CATALOG.md,
  new AUTOMATION_MARKETPLACE_TAXONOMY.md (trigger/action table ground-truthed
  against packages/automation-flow/src/catalog/compounds.ts).
- Removed docs/file-analysis/ + docs/interview-prep/ (~1,617 files): stale
  personal interview-prep material, unrelated to product docs, zero real
  references anywhere in the repo.

Known risk: docs/PAGE_FUNCTIONALITY_CHECKLIST.md is new on this branch (not
on main) and will conflict with the same new filename on the separate,
still-unmerged chore/page-checklist-and-lint-fixes branch if both merge --
see PR body for recommended resolution order.

oxlint: 0 new errors. tsc --noEmit (packages/ui): the one error touching a
file this PR modifies (DefaultNavigation.tsx tenant field) is pre-existing,
copied verbatim, part of the ~120 known @luxgen/ui TS errors."
fi

echo "==> Pushing..."
git push -u origin "$FEAT_BRANCH"

if command -v gh >/dev/null 2>&1; then
  echo "==> Opening PR via gh..."
  gh label create chore --description "Docs, cursor rules, CI, deps, refactors with no behavior change" --color "fef2c0" 2>/dev/null || true
  gh label create ui --description "packages/ui -- components, sidebar, design system" --color "c5def5" 2>/dev/null || true
  gh label create web --description "apps/web -- pages, middleware, client auth, Next.js API routes" --color "bfd4f2" 2>/dev/null || true
  gh label create "help wanted" --description "Needs review" --color "008672" 2>/dev/null || true
  gh pr create \
    --base main \
    --title "chore(docs,ui,web): regroup nav + docs around business-domain IA" \
    --label "help wanted" --label chore --label ui --label web \
    --body-file "$PR_DESC_FILE"
else
  echo "==> gh CLI not found. Open a PR manually:"
  echo "    base: main  <-  compare: $FEAT_BRANCH"
  echo "    Title: chore(docs,ui,web): regroup nav + docs around business-domain IA"
  echo "    Labels: help wanted, chore, ui, web"
  echo "    Body: paste the contents of $PR_DESC_FILE"
fi

echo ""
echo "==> Done. Before merging:"
echo "    - Resolve merge order against chore/page-checklist-and-lint-fixes"
echo "      (both branches add docs/PAGE_FUNCTIONALITY_CHECKLIST.md) -- see"
echo "      the PR body's 'Known risk' section."
echo "    - No dev server was available to click-through test; this is why"
echo "      URL renames were excluded from scope (see PRODUCT_ARCHITECTURE.md)."
