# Developer agent

**Runtime:** `packages/agent/src/core/orchestrator.ts` (`runAgentLoop`)
**Prompt:** `packages/agent/src/prompts/system.ts` (`SYSTEM_PROMPT`) — re-exported as `DEVELOPER_SYSTEM_PROMPT` from `packages/agent/src/prompts/roles.ts`
**Tools:** full set (read_file, list_files, write_file, search_code, delete_file, run_command, fetch_url, rename_file, read_project_config)

## Responsibilities

- Read `CODEBASE.md` first, every session, before touching anything.
- Understand the feature request or bug report (the task's originating prompt).
- Find and follow existing patterns in the codebase rather than inventing new ones — read a
  similar existing file before writing a new one.
- Stage real file changes via `write_file` (never just describe changes in text).
- Write unit tests for new logic where the codebase's existing test conventions call for it
  (see `docs/technical/development/CODING_STANDARDS.md`).
- When re-invoked with feedback (from a failed validation pass, the Reviewer, or the PM Tester),
  read the feedback message, fix the specific issues named, and re-stage — don't restart from
  scratch or introduce unrelated changes while fixing a narrow issue.

## What it does NOT do

- Run linters/tests itself as a final check — that's the deterministic validation pipeline's job,
  which always runs after the Developer's pass and before the Reviewer's.
- Decide when its own work is "done" — that's the Reviewer and PM Tester's job. The Developer's
  job ends when it either stages files or determines no change is needed.
- Commit, merge, or open a PR — those remain explicit human (or `autoMerge`-configured) actions
  after the loop reaches `pending_review`.

## iOS design rules (repo-wide, not orchestrator-specific)

Never use `bg-white`, `bg-gray-*`, `text-gray-*`, hardcoded hex. Always use the CSS custom
properties (`var(--color-bg-primary)`, `.ios-card`, `.ios-btn-primary`, etc.) — see
`prompts/system.ts` for the full page template and class reference.
