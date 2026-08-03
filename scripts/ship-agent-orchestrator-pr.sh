#!/usr/bin/env bash
# Ships the Developer -> Reviewer -> PM Tester orchestrator feature PR.
# Run yourself: bash scripts/ship-agent-orchestrator-pr.sh
#
# Context: Claude (Cowork) edited these files directly on disk (via file tools, not git) while
# your working tree was on `main`. This script commits *only* the orchestrator-related files —
# it deliberately does NOT sweep up docs/MENU_STRUCTURE.md or scripts/ship-docs-lint-pr.sh, which
# are leftover from unrelated earlier work in the same session and don't belong in this PR.
#
# Safe to re-run.

set -e

rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

FEAT_BRANCH="feat/agent-orchestrator"

FILES=(
  AGENTS.md
  skills/ai-studio/SKILL.md
  .agents/AGENTS.md
  .agents/Developer.agent.md
  .agents/Reviewer.agent.md
  .agents/PMTester.agent.md
  docs/AGENT_ORCHESTRATOR.md
  PR_DESCRIPTION_agent-orchestrator-dev-reviewer-pm-tester.md
  packages/agent/src/types/review.ts
  packages/agent/src/types/task.ts
  packages/agent/src/types/session.ts
  packages/agent/src/prompts/roles.ts
  packages/agent/src/core/diff.ts
  packages/agent/src/core/roles.ts
  packages/agent/src/core/orchestrated-task.ts
  packages/agent/src/config/limits.ts
  packages/agent/src/persistence/mongo.ts
  packages/agent/src/queue/worker.ts
  packages/agent/src/index.ts
  packages/db/src/agent-task.ts
  packages/db/src/agent-audit.ts
  apps/web/pages/api/agent/tasks/list.ts
  apps/web/pages/api/agent/tasks/stream.ts
  apps/web/pages/admin/agent-tasks.tsx
  apps/web/components/agent/HeadlessTaskPanel.tsx
)

echo "==> Verifying current branch is main (or already the feature branch)..."
CURRENT_BRANCH="$(git branch --show-current)"

if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "$FEAT_BRANCH" ]; then
  echo "WARNING: expected to be on 'main' or '$FEAT_BRANCH', but on '$CURRENT_BRANCH'."
  echo "This script only touches the files listed above, so it should be safe regardless, but"
  echo "double-check you're not about to mix this into an unrelated branch. Ctrl+C to abort."
  read -r -p "Press Enter to continue anyway..." _
fi

if [ "$CURRENT_BRANCH" = "main" ]; then
  echo "==> Creating $FEAT_BRANCH off main..."
  git checkout -b "$FEAT_BRANCH"
elif [ "$CURRENT_BRANCH" != "$FEAT_BRANCH" ]; then
  git checkout -b "$FEAT_BRANCH"
fi

echo "==> Staging orchestrator files only..."
git add "${FILES[@]}"

echo "==> Committing..."
git commit -m "feat(agent): Developer -> Reviewer -> PM Tester orchestration loop for headless tasks

Extends the existing headless Agent Studio pipeline (apps/agent-worker) with two new roles
around the existing Developer engine (runAgentLoop, unchanged):

- Reviewer and PM Tester reuse runAgentLoop with a new system prompt each
  (prompts/roles.ts) and a read-only toolFilter (core/roles.ts) - they report issues via a
  strict 'VERDICT: APPROVED'/'VERDICT: CHANGES_REQUESTED' line, never write files themselves.
- Deterministic validation (existing runValidationPipeline) always runs before either LLM
  review role; a failure feeds back to the Developer without spending an LLM call on
  Reviewer/PM Tester for code that doesn't pass lint/typecheck/test yet.
- New core/orchestrated-task.ts's runOrchestratedTask sequences
  Developer -> validate -> Reviewer -> PM Tester, looping on any failure/CHANGES_REQUESTED,
  bounded to MAX_ORCHESTRATOR_ITERATIONS (3). Wired into queue/worker.ts's
  processHeadlessJob, replacing its previous flat sequence (same audit trail preserved, more
  entries added).
- TaskStatus/AuditAction extended (not replaced) with review/pm-test states, kept in sync
  across packages/agent/src/types/task.ts and the parallel packages/db Mongoose enums.
- AgentSession/AgentTask gain an 'orchestration' field with each role's full verdict + notes.
- Four hardcoded TaskStatus lists in the web app updated to include the new states
  (HeadlessTaskPanel, admin/agent-tasks status filter, tasks/list and tasks/stream API routes).
- pending_review remains the human approval checkpoint - commit/merge unchanged, still
  AGENT_AUTO_MERGE-gated.

Docs: docs/AGENT_ORCHESTRATOR.md (architecture + design rationale), .agents/*.md (human-facing
role docs). Known limitation (pre-existing, not introduced here, flagged not fixed): the
packages/agent validation scope check uses bare tsc instead of the tolerant build script - see
doc for detail and why it's a separate fix/ PR."

echo "==> Pushing..."
git push -u origin "$FEAT_BRANCH"

if command -v gh >/dev/null 2>&1; then
  echo "==> Opening PR via gh..."
  gh label create agent --description "packages/agent, AI Studio, automations worker" --color "5319e7" 2>/dev/null || true
  gh label create mongo --description "Mongoose models, migrations, DB queries" --color "d4c5f9" 2>/dev/null || true
  gh label create "need-manual-review" --description "Security/auth, billing, infra, or no reliable automated test" --color "e11d21" 2>/dev/null || true
  gh pr create \
    --base main \
    --title "feat(agent): Developer -> Reviewer -> PM Tester orchestration loop for headless agent tasks" \
    --label "help wanted" --label feat --label agent --label web --label mongo --label "need-manual-review" \
    --body-file PR_DESCRIPTION_agent-orchestrator-dev-reviewer-pm-tester.md
else
  echo "==> gh CLI not found. Open a PR manually:"
  echo "    base: main  <-  compare: $FEAT_BRANCH"
  echo "    Title: feat(agent): Developer -> Reviewer -> PM Tester orchestration loop for headless agent tasks"
  echo "    Labels: help wanted, feat, agent, web, mongo, need-manual-review"
  echo "    Body: paste the contents of PR_DESCRIPTION_agent-orchestrator-dev-reviewer-pm-tester.md"
fi

echo ""
echo "==> Done. Before merging:"
echo "    - Review docs/AGENT_ORCHESTRATOR.md 'Known limitation' section"
echo "    - Manually test one headless task run against a real Ollama instance if possible"
