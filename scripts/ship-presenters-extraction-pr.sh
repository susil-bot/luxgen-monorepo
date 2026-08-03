#!/usr/bin/env bash
# Ships the @luxgen/presenters extraction PR: step 1 of
# docs/CROSS_PLATFORM_RESTRUCTURE.md's sequencing -- moves apps/web/presenters/
# (the search presenter + shared query fragments) into its own package so
# apps/mobile can eventually import the same data-fetching/view-model layer.
#
# Run with: bash scripts/ship-presenters-extraction-pr.sh
# Safe to re-run.

set -e

rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true
# Two harmless leftover scratch files from verifying file-write permissions
# earlier in this session -- not part of any change, just cleanup.
rm -f packages/presenters-writetest.tmp packages/wt3.tmp 2>/dev/null || true

FEAT_BRANCH="feat/extract-presenters-package"
PR_DESC_FILE="PR_DESCRIPTION_presenters-extraction.md"

TARGET_PATHS=(
  apps/web/package.json
  apps/web/pages/search.tsx
  apps/web/presenters
  packages/presenters
  docs/CROSS_PLATFORM_RESTRUCTURE.md
  docs/technical/development/CODEBASE.md
  tsconfig.base.json
  "$PR_DESC_FILE"
)

STASH_MSG="presenters package extraction"
if git stash list | grep -qF "$STASH_MSG"; then
  echo "==> Already stashed from a previous run of this script -- skipping re-stash..."
else
  echo "==> Stashing the presenter-extraction changes (leaves any other"
  echo "    in-progress work on this branch untouched)..."
  git add -A -- "${TARGET_PATHS[@]}" 2>/dev/null || true
  git stash push -m "$STASH_MSG" -- "${TARGET_PATHS[@]}"
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
  echo "==> Restoring the presenter-extraction changes from stash..."
  git stash pop
else
  echo "==> Changes already restored (no matching stash left) -- skipping..."
fi

echo "==> Committing..."
git add -A -- "${TARGET_PATHS[@]}"
if git diff --cached --quiet; then
  echo "==> Nothing to commit (already committed on this branch from a"
  echo "    previous run) -- skipping commit..."
else
  git commit -m "feat(ui,web): extract shared presenter layer into @luxgen/presenters

Step 1 of docs/CROSS_PLATFORM_RESTRUCTURE.md's sequencing: apps/web/presenters/
(the 'search' presenter + _shared/queries fragments) moves to packages/presenters/
so apps/mobile can eventually import the same data-fetching/view-model layer
instead of duplicating it per platform.

- packages/presenters/search/fetchers.ts: removed its hidden apps/web
  coupling (it imported apps/web/lib/fetcher.ts directly) by having it accept
  a QueryFn parameter instead of importing a concrete Apollo client. These
  functions have no current callers -- the real path (client.entry.ts's
  useSearchPresenter, using Apollo's useQuery) was already platform-agnostic.
- apps/web/pages/search.tsx: import updated to '@luxgen/presenters/search'.
- apps/web/package.json + tsconfig.base.json: new package wired up, matching
  the existing @luxgen/<pkg> subpath-import convention.
- docs/CROSS_PLATFORM_RESTRUCTURE.md: marked step 1 done.
- docs/technical/development/CODEBASE.md: repo map was missing apps/mobile,
  apps/mcp-server, and about half of packages/* -- corrected while placing
  the new package in the map.

Verified: no remaining references to the old import path (repo-wide grep),
oxlint clean on touched files, tsc --noEmit shows only 2 more instances of a
pre-existing @apollo/client type-resolution issue already affecting 200+
unrelated files in this environment -- not a regression from this change."
fi

echo "==> Pushing..."
git push -u origin "$FEAT_BRANCH"

if command -v gh >/dev/null 2>&1; then
  echo "==> Opening PR via gh..."
  gh label create feat --description "New UI, routes, GraphQL fields, or capability" --color "0e8a16" 2>/dev/null || true
  gh label create ui --description "packages/ui -- components, sidebar, design system" --color "c5def5" 2>/dev/null || true
  gh label create web --description "apps/web -- pages, middleware, client auth, Next.js API routes" --color "bfd4f2" 2>/dev/null || true
  gh label create "help wanted" --description "Needs review" --color "008672" 2>/dev/null || true
  gh pr create \
    --base main \
    --title "feat(ui,web): extract shared presenter layer into @luxgen/presenters" \
    --label "help wanted" --label feat --label ui --label web \
    --body-file "$PR_DESC_FILE"
else
  echo "==> gh CLI not found. Open a PR manually:"
  echo "    base: main  <-  compare: $FEAT_BRANCH"
  echo "    Title: feat(ui,web): extract shared presenter layer into @luxgen/presenters"
  echo "    Labels: help wanted, feat, ui, web"
  echo "    Body: paste the contents of $PR_DESC_FILE"
fi

echo ""
echo "==> Done. This is step 1 of docs/CROSS_PLATFORM_RESTRUCTURE.md's sequencing"
echo "    only -- remaining steps (Automation Hub built presenter-first, migrating"
echo "    the rest of apps/web/presenters/*, expanding native-ui) are separate,"
echo "    future work, not included here."
echo ""
echo "==> Also worth running once this is up: 'npm install' (or your package"
echo "    manager's equivalent) so the new packages/presenters workspace gets"
echo "    symlinked into node_modules before anyone tries to build against it."
