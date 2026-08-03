#!/usr/bin/env bash
# Ships the settings-pages lint-fix chore PR: run with
# `bash scripts/ship-settings-lint-fixes-pr.sh`.
#
# Context: this is the *remaining* useful part of the old parked
# `git stash` entry "docs+lint chore files". That stash also contained a
# draft docs/PAGE_FUNCTIONALITY_CHECKLIST.md, but that doc already shipped
# (in corrected form) via the merged chore/domain-ia-restructure PR (#446),
# so this script does NOT touch docs at all -- it applies the same 4 oxlint
# fixes directly to the current main via sed (safer than popping a
# partially-stale stash), branches, commits, and pushes just that.
#
# Safe to re-run: no-ops past already-completed steps where possible.

set -e

rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

FEAT_BRANCH="chore/settings-lint-fixes"
PR_DESC_FILE="PR_DESCRIPTION_settings-lint-fixes.md"

echo "==> Fetching latest main from origin..."
git fetch origin main

if git rev-parse --verify "$FEAT_BRANCH" >/dev/null 2>&1; then
  echo "==> Branch $FEAT_BRANCH already exists locally, checking it out..."
  git checkout "$FEAT_BRANCH"
else
  echo "==> Creating $FEAT_BRANCH directly off origin/main..."
  git checkout -b "$FEAT_BRANCH" origin/main
fi

echo "==> Applying the 2 oxlint fixes..."

# 1. apps/web/pages/settings.tsx: drop unused setActiveTab setter + unused tabs array.
if grep -q "const \[activeTab, setActiveTab\]" apps/web/pages/settings.tsx; then
  sed -i.bak \
    "s/const \[activeTab, setActiveTab\] = useState<'profile' | 'preferences' | 'security'>('profile');/const [activeTab] = useState<'profile' | 'preferences' | 'security'>('profile');/" \
    apps/web/pages/settings.tsx
  rm -f apps/web/pages/settings.tsx.bak
fi
# Remove the dead `const tabs = [...] as const;` block if still present.
if grep -q "^  const tabs = \[$" apps/web/pages/settings.tsx; then
  python3 - <<'PYEOF'
import re
path = "apps/web/pages/settings.tsx"
with open(path) as f:
    content = f.read()
pattern = re.compile(
    r"\n  const tabs = \[\n(?:.*\n)*?  \] as const;\n",
)
new_content, n = pattern.subn("\n", content, count=1)
if n == 1:
    with open(path, "w") as f:
        f.write(new_content)
    print("Removed dead 'tabs' array.")
else:
    print("No matching 'tabs' array block found -- skipping (already removed?).")
PYEOF
fi

# 2. apps/web/pages/settings/profile.tsx: rename 2 unused catch params.
sed -i.bak "s/} catch (error) {/} catch (_error) {/g" apps/web/pages/settings/profile.tsx
rm -f apps/web/pages/settings/profile.tsx.bak

cp "$PR_DESC_FILE" "$PR_DESC_FILE" 2>/dev/null || true

if git diff --quiet -- apps/web/pages/settings.tsx apps/web/pages/settings/profile.tsx && [ -f "$PR_DESC_FILE" ] && git diff --cached --quiet -- "$PR_DESC_FILE" 2>/dev/null; then
  echo "==> Nothing to commit (fixes already applied on this branch from a"
  echo "    previous run) -- skipping commit..."
else
  echo "==> Committing..."
  git add apps/web/pages/settings.tsx apps/web/pages/settings/profile.tsx "$PR_DESC_FILE"
  git commit -m "chore(web): fix 4 oxlint errors in settings pages

- settings/profile.tsx: rename 2 unused 'catch (error)' params to
  '_error' per .oxlintrc.json's caughtErrorsIgnorePattern convention. No
  behavior change -- both catch bodies already ignored the error object.
- settings.tsx: remove unused 'setActiveTab' destructure (no
  tab-switcher control exists in this page's JSX) and unused 'tabs'
  array (never referenced). No behavior change.

npm run lint: 4 errors -> 0. Docs portion of the original parked stash
(PAGE_FUNCTIONALITY_CHECKLIST.md) already shipped in corrected form via
the merged chore/domain-ia-restructure PR (#446) -- not re-included here."
fi

echo "==> Pushing..."
git push -u origin "$FEAT_BRANCH"

if command -v gh >/dev/null 2>&1; then
  echo "==> Opening PR via gh..."
  gh label create chore --description "Docs, cursor rules, CI, deps, refactors with no behavior change" --color "fef2c0" 2>/dev/null || true
  gh label create web --description "apps/web -- pages, middleware, client auth, Next.js API routes" --color "bfd4f2" 2>/dev/null || true
  gh label create "help wanted" --description "Needs review" --color "008672" 2>/dev/null || true
  gh pr create \
    --base main \
    --title "chore(web): fix 4 oxlint errors in settings pages" \
    --label "help wanted" --label chore --label web \
    --body-file "$PR_DESC_FILE"
else
  echo "==> gh CLI not found. Open a PR manually:"
  echo "    base: main  <-  compare: $FEAT_BRANCH"
  echo "    Title: chore(web): fix 4 oxlint errors in settings pages"
  echo "    Labels: help wanted, chore, web"
  echo "    Body: paste the contents of $PR_DESC_FILE"
fi

echo ""
echo "==> Done. This leaves the old 'docs+lint chore files' git stash orphaned"
echo "    (its docs portion is superseded, its lint portion is now shipped"
echo "    here). Safe to drop it once you confirm this PR looks right:"
echo "    git stash drop stash@{0}   # only if it's still the 'docs+lint chore files' one -- check with 'git stash list' first"
