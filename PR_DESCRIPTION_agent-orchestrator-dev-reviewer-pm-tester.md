# feat(agent): Developer -> Reviewer -> PM Tester orchestration loop for headless agent tasks

**Branch:** `feat/agent-orchestrator` (off `main`)
**Labels:** `help wanted`, `feat`, `agent`, `web`, `mongo`, `need-manual-review`
**Author:** susil-bot (with Claude, Cowork mode)

## Label: **feat**

## Why

Agent Studio's headless pipeline (`apps/agent-worker`) ran a single Developer pass, then
deterministic validation (lint/typecheck/test), then committed straight through. There was no
second opinion on code quality beyond what a linter catches, and nothing checking the result
against the original request. This adds two more roles — Reviewer and PM Tester — as a bounded
loop around the existing Developer engine, per the "controlled multi-agent workflow, not a single
monolithic prompt" design discussed for this feature.

Full architecture and design rationale: `docs/AGENT_ORCHESTRATOR.md`. Human-facing role docs:
`.agents/AGENTS.md`, `.agents/Developer.agent.md`, `.agents/Reviewer.agent.md`,
`.agents/PMTester.agent.md`.

## What changed — built by extension, not from scratch

Everything below reuses an existing Agent Studio primitive; nothing here stands up a second agent
runtime:

- **Developer, Reviewer, and PM Tester all run through the existing `runAgentLoop`** (`core/orchestrator.ts`,
  untouched) — they differ only in system prompt and tool permissions. New:
  `packages/agent/src/prompts/roles.ts` (`REVIEWER_SYSTEM_PROMPT`, `PM_TESTER_SYSTEM_PROMPT`, and a
  re-export of the existing Developer prompt for naming symmetry).
- **Reviewer and PM Tester are read-only** — `toolFilter: ['read_file', 'list_files', 'search_code']`,
  enforced in code (`core/roles.ts`), not just prompt instruction. They report issues; the
  Developer role fixes them on the next iteration.
- **Deterministic validation (existing `runValidationPipeline`) always runs before either LLM
  review role** — a failure there feeds straight back to the Developer without spending an LLM
  call on Reviewer/PM Tester for code that doesn't pass its own linter/tests yet (cost control:
  front-load logic outside the LLM).
- **Both review roles end with a strict `VERDICT: APPROVED` / `VERDICT: CHANGES_REQUESTED` line**,
  parsed by regex in `core/roles.ts`. Missing or unparseable = `CHANGES_REQUESTED`, never
  auto-approved on an ambiguous response.
- **New orchestration loop**: `packages/agent/src/core/orchestrated-task.ts`'s
  `runOrchestratedTask` — Developer -> validate -> Reviewer -> PM Tester, looping back to the
  Developer with the relevant feedback on any failure/CHANGES_REQUESTED, bounded to
  `MAX_ORCHESTRATOR_ITERATIONS` (3, `config/limits.ts`). Wired into
  `queue/worker.ts`'s `processHeadlessJob`, replacing its previous flat
  runAgentLoop->validate->commit sequence (same audit entries and automation events preserved,
  now with review/pm-test stages added).
- **State machine extended, not replaced**: `TaskStatus` gains `reviewing` /
  `review_changes_requested` / `pm_testing` / `pm_test_changes_requested` alongside the existing
  states. `AuditAction` gains matching entries. Both extended in the two places this repo tracks
  them (`packages/agent/src/types/task.ts` and the parallel Mongoose enums in
  `packages/db/src/agent-task.ts` / `agent-audit.ts` — intentionally duplicated, see that file's
  comments).
- **`AgentSession`/`AgentTask` gain an `orchestration` field** holding the latest
  `RoleReviewResult` for each role (verdict, full notes text, iteration) — persisted through the
  existing session-store/Mongo sync path (`persistence/mongo.ts` updated to read/write it).
- **UI status displays kept in sync** — found and updated all four places `TaskStatus` values were
  hardcoded: `HeadlessTaskPanel.tsx` (labels + terminal-state set), `admin/agent-tasks.tsx`
  (status filter dropdown), `api/agent/tasks/list.ts` (valid-status guard), `api/agent/tasks/stream.ts`
  (SSE terminal-status set).
- **Human approval checkpoint unchanged** — the loop converging to `pending_review` is exactly the
  same checkpoint as before this feature. Commit/merge remain explicit
  (`commitStagedSession`/`mergeAgentBranch`), still gated by `AGENT_AUTO_MERGE`. The orchestrator
  does not grant itself merge rights it didn't already have.
- **No new CI workflow.** `.github/workflows/ci.yml` already gates lint/format/build/test on the
  resulting PR once a human commits/merges; the orchestrator isn't GitHub-Actions-triggered (it's
  the existing Redis-queued worker process). Rationale in `docs/AGENT_ORCHESTRATOR.md` § "CI/CD".

## Not changed

- Interactive chat (`/agent`, `apps/web/pages/api/agent/chat.ts`) — unchanged. A human in the chat
  already plays the reviewer/tester role there; the loop is for headless tasks only.
- `runAgentLoop` itself — reused as-is by all three roles.
- Plan gating, GraphQL schema, `apps/api` — untouched.
- Auto-merge behavior/policy — still `AGENT_AUTO_MERGE` env-gated, unchanged.

## Known limitation (flagged, not fixed here)

`validation/pipeline.ts`'s `packages/agent` scope check runs bare `npx tsc --noEmit`, not the
package's tolerant build script. Verified manually while building this: `packages/agent`'s
type-check currently reports 16 pre-existing errors, **all in `packages/db/src/*` files, zero in
any file this PR adds or touches** (confirmed via `npx tsc --noEmit` in `packages/agent`, filtered
for non-`packages/db` matches — zero results). This means any orchestrated task that stages a
`packages/agent/` change will presently fail its own validation step on pre-existing, unrelated
errors — a real gap, but a separate, narrowly-scoped `fix/` PR per this repo's PR-splitting rule,
not bundled here. Documented in `docs/AGENT_ORCHESTRATOR.md` § "Known limitation".

## Test plan

- [x] `npx tsc --noEmit` in `packages/agent` — 16 errors, all pre-existing in `packages/db/*`,
      zero in any new/edited file this PR touches (manually diffed against the pre-existing
      baseline)
- [x] `npm run lint` (oxlint, repo-wide incl. `.agents/`) — 0 errors introduced by this PR (96
      pre-existing `packages/ui` warnings unchanged, out of scope)
- [ ] Manual: enqueue a headless task against a real Ollama instance, confirm it walks
      running -> staged -> validating -> reviewing -> pm_testing -> pending_review on a clean
      pass
- [ ] Manual: stage a change that fails lint on purpose, confirm the loop feeds the failure back
      to the Developer instead of calling Reviewer, and converges or hits
      `iteration_limit_reached` within 3 rounds
- [ ] Manual: confirm `HeadlessTaskPanel.tsx` renders the four new statuses with sensible
      labels/colors, and that `review_changes_requested`/`pm_test_changes_requested` correctly end
      the SSE stream (`tasks/stream.ts`)

## Checklist

- [ ] `help wanted`, `feat`, `agent`, `web`, `mongo`, `need-manual-review` labels applied
- [ ] Confirmed no GraphQL/schema changes needed (none made)
- [ ] Docs read: `docs/AGENT_ORCHESTRATOR.md`, `.agents/AGENTS.md`
