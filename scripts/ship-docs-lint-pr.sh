#!/usr/bin/env bash
# Ships the docs+lint chore PR: run this yourself with `bash scripts/ship-docs-lint-pr.sh`.
#
# Context: Claude (Cowork) already edited these 4 files directly on disk in your
# working tree (via its file tools, not git) while sitting on the
# feat/automation-hub-industry-compounds branch:
#   - docs/PAGE_FUNCTIONALITY_CHECKLIST.md (new)
#   - PR_DESCRIPTION_docs-page-checklist-and-lint-fixes.md (new, repo root)
#   - apps/web/pages/settings.tsx (modified — removed 2 unused vars)
#   - apps/web/pages/settings/profile.tsx (modified — 2 unused catch params)
#
# This script moves *only* those 4 files onto a fresh chore/ branch based on
# main (confirmed: main already has the automation fix merged as of this
# writing — commit 3171eb1), so this chore PR ships independently of the
# still-open feat/automation-hub-industry-compounds PR.
#
# Safe to re-run: it no-ops past already-completed steps where possible.

set -e

# Defensive: clear any stale lock from a previous interrupted git run.
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

CHORE_BRANCH="chore/page-checklist-and-lint-fixes"

echo "==> Stashing the 4 target files (won't touch anything else)..."
git add docs/PAGE_FUNCTIONALITY_CHECKLIST.md \
        PR_DESCRIPTION_docs-page-checklist-and-lint-fixes.md \
        apps/web/pages/settings.tsx \
        apps/web/pages/settings/profile.tsx
git stash push -m "docs+lint chore files" -- \
        docs/PAGE_FUNCTIONALITY_CHECKLIST.md \
        PR_DESCRIPTION_docs-page-checklist-and-lint-fixes.md \
        apps/web/pages/settings.tsx \
        apps/web/pages/settings/profile.tsx

echo "==> Switching to main and pulling latest..."
git checkout main
git pull --ff-only

if git rev-parse --verify "$CHORE_BRANCH" >/dev/null 2>&1; then
  echo "==> Branch $CHORE_BRANCH already exists locally, checking it out..."
  git checkout "$CHORE_BRANCH"
else
  echo "==> Creating $CHORE_BRANCH off main..."
  git checkout -b "$CHORE_BRANCH"
fi

echo "==> Restoring the 4 files from stash..."
git stash pop

echo "==> Committing..."
git add docs/PAGE_FUNCTIONALITY_CHECKLIST.md \
        PR_DESCRIPTION_docs-page-checklist-and-lint-fixes.md \
        apps/web/pages/settings.tsx \
        apps/web/pages/settings/profile.tsx
git commit -m "chore(docs,web): add page functionality checklist and fix oxlint errors

- docs/PAGE_FUNCTIONALITY_CHECKLIST.md: every apps/web + apps/mobile route,
  grouped top-level nav -> section -> page, with functionality notes and a
  trackable checklist. Flags known mock-data pages and redundant route
  surfaces (3 billing entry points, 3 user-list entry points) found while
  compiling it.
- apps/web/pages/settings/profile.tsx: rename two unused 'catch (error)'
  params to '_error' per .oxlintrc.json's caughtErrorsIgnorePattern
  convention. No behavior change.
- apps/web/pages/settings.tsx: remove unused 'setActiveTab' destructure and
  unused 'tabs' array (this page has no tab-switcher UI wired up; both were
  dead code). No behavior change.

npm run lint: 4 errors -> 0 (96 packages/ui warnings unchanged, out of
scope - see .oxlintrc.json override that downgrades that package to warn)."

echo "==> Pushing..."
git push -u origin "$CHORE_BRANCH"

if command -v gh >/dev/null 2>&1; then
  echo "==> Opening PR via gh..."
  gh label create chore --description "Docs, cursor rules, CI, deps, refactors with no behavior change" --color "fef2c0" 2>/dev/null || true
  gh label create "help wanted" --description "Needs review" --color "008672" 2>/dev/null || true
  gh label create web --description "apps/web" --color "1d76db" 2>/dev/null || true
  gh pr create \
    --base main \
    --title "chore(docs,web): page functionality checklist + oxlint error fixes" \
    --label "help wanted" --label chore --label web \
    --body-file PR_DESCRIPTION_docs-page-checklist-and-lint-fixes.md
else
  echo "==> gh CLI not found. Open a PR manually:"
  echo "    base: main  <-  compare: $CHORE_BRANCH"
  echo "    Title: chore(docs,web): page functionality checklist + oxlint error fixes"
  echo "    Labels: help wanted, chore, web"
  echo "    Body: paste the contents of PR_DESCRIPTION_docs-page-checklist-and-lint-fixes.md"
fi

echo ""
echo "==> Done. Sanity-check before merging:"
echo "    npm run lint   (should exit 0)"
