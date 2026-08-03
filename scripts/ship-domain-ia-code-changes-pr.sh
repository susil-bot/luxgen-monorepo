#!/usr/bin/env bash
# Ships the follow-up fix PR for the 3 real code changes that the merged
# chore/domain-ia-restructure PR (#446) was supposed to include but didn't
# (checked: the actual merged diff only contains the 4 doc files + the
# docs/file-analysis + docs/interview-prep deletions -- the nav regroup,
# barrel-export fix, and admin/users.tsx redirect fix never landed).
#
# Your working tree (wherever you run this from) still has the correct
# content for these 3 files -- this script just gets them onto their own
# clean branch off the current origin/main and ships them properly.
#
# Run with: bash scripts/ship-domain-ia-code-changes-pr.sh
# Safe to re-run.

set -e

rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

FEAT_BRANCH="fix/domain-ia-nav-code-changes"
PR_DESC_FILE="PR_DESCRIPTION_domain-ia-code-changes.md"

TARGET_FILES=(
  apps/web/pages/admin/users.tsx
  docs/FEATURE_CATALOG.md
  docs/AUTOMATION_MARKETPLACE_TAXONOMY.md
  packages/ui/src/Layout/DefaultNavigation.tsx
  packages/ui/src/Layout/index.ts
  "$PR_DESC_FILE"
)

STASH_MSG="domain IA nav code changes (446 follow-up)"
if git diff --quiet -- apps/web/pages/admin/users.tsx docs/FEATURE_CATALOG.md docs/AUTOMATION_MARKETPLACE_TAXONOMY.md packages/ui/src/Layout/DefaultNavigation.tsx packages/ui/src/Layout/index.ts && [ ! -f "$PR_DESC_FILE" ]; then
  echo "==> Nothing modified in the working tree for these files -- checking"
  echo "    if there's already a matching stash to restore..."
fi

if git stash list | grep -qF "$STASH_MSG"; then
  echo "==> Already stashed from a previous run of this script -- skipping re-stash..."
else
  echo "==> Stashing the 3 real code-change files (leaves any unrelated"
  echo "    in-progress work, like the settings-lint-fixes files, untouched)..."
  git add "${TARGET_FILES[@]}" 2>/dev/null || true
  git stash push -m "$STASH_MSG" -- "${TARGET_FILES[@]}"
fi

echo "==> Fetching latest main from origin..."
git fetch origin main

if git rev-parse --verify "$FEAT_BRANCH" >/dev/null 2>&1; then
  echo "==> Branch $FEAT_BRANCH already exists locally, checking it out..."
  git checkout "$FEAT_BRANCH"
else
  echo "==> Creating $FEAT_BRANCH directly off origin/main..."
  git checkout -b "$FEAT_BRANCH" origin/main
fi

if git stash list | grep -qF "$STASH_MSG"; then
  echo "==> Restoring the files from stash..."
  git stash pop
else
  echo "==> Files already restored (no matching stash left) -- skipping..."
fi

if git diff --cached --quiet -- "${TARGET_FILES[@]}" 2>/dev/null && git diff --quiet -- apps/web/pages/admin/users.tsx docs/FEATURE_CATALOG.md docs/AUTOMATION_MARKETPLACE_TAXONOMY.md packages/ui/src/Layout/DefaultNavigation.tsx packages/ui/src/Layout/index.ts; then
  echo "==> WARNING: no diff detected against origin/main for these files."
  echo "    Either they're already committed on this branch, or something"
  echo "    went wrong restoring them. Check 'git diff origin/main -- ${TARGET_FILES[*]}'"
  echo "    manually before assuming this ran correctly."
fi

echo "==> Committing..."
git add "${TARGET_FILES[@]}"
if git diff --cached --quiet; then
  echo "==> Nothing to commit (already committed on this branch from a"
  echo "    previous run) -- skipping commit..."
else
  git commit -m "fix(ui,web): ship the domain-IA nav regroup + redirect fix (446 follow-up)

The merged chore/domain-ia-restructure PR (#446) was supposed to include the
sidebar regroup, a barrel-export fix, and a redirect bugfix alongside its 4
doc files -- checking the actual merged diff (d6ad468..8fd7d8c) shows only
the docs and the docs/file-analysis + docs/interview-prep deletions landed.
These 3 files never made it into that commit. This PR ships exactly those,
now that the docs they reference (PRODUCT_ARCHITECTURE.md etc.) are already
live on main.

- DefaultNavigation.tsx: DEFAULT_SIDEBAR_SECTIONS regrouped into the 9
  business domains; 'Groups' -> 'Teams'; 'Automations' section id fixed from
  a stray 'developer' to 'automation-hub'; standalone 'Developer' section
  folded into 'Administration'; duplicate Settings->Billing entry removed;
  dead getDefaultMenuItems() removed.
- Layout/index.ts: barrel export updated to match (getDefaultNavItems kept
  -- real dependency of UserDashboardLayout.tsx / AdminDashboardLayout.tsx).
- admin/users.tsx: fixed /admin/users -> /users -> /organization/users
  double redirect hop, now goes straight to /organization/users.
- AUTOMATION_MARKETPLACE_TAXONOMY.md: refreshed the certificate-reminder
  compound status from 'in progress, unmerged' to 'Shipped', since
  feat/automation-hub-industry-compounds (#443/#444) has since merged."
fi

echo "==> Pushing..."
git push -u origin "$FEAT_BRANCH"

if command -v gh >/dev/null 2>&1; then
  echo "==> Opening PR via gh..."
  gh label create fix --description "Broken behavior, 500s, wrong data, regressions, failed saves" --color "e11d21" 2>/dev/null || true
  gh label create ui --description "packages/ui -- components, sidebar, design system" --color "c5def5" 2>/dev/null || true
  gh label create web --description "apps/web -- pages, middleware, client auth, Next.js API routes" --color "bfd4f2" 2>/dev/null || true
  gh label create "help wanted" --description "Needs review" --color "008672" 2>/dev/null || true
  gh pr create \
    --base main \
    --title "fix(ui,web): actually ship the domain-IA nav regroup + redirect fix" \
    --label "help wanted" --label fix --label ui --label web \
    --body-file "$PR_DESC_FILE"
else
  echo "==> gh CLI not found. Open a PR manually:"
  echo "    base: main  <-  compare: $FEAT_BRANCH"
  echo "    Title: fix(ui,web): actually ship the domain-IA nav regroup + redirect fix"
  echo "    Labels: help wanted, fix, ui, web"
  echo "    Body: paste the contents of $PR_DESC_FILE"
fi

echo ""
echo "==> Done. Double-check the sidebar visually once this merges -- this is"
echo "    the PR that actually applies the regroup #446's description promised."
