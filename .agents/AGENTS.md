# Agent roles — Developer, Reviewer, PM Tester

This directory documents the three roles in LuxGen's orchestrated Agent Studio pipeline for
human readers (contributors, reviewers of agent-authored PRs). It is the human-facing mirror of
the machine-facing prompts actually sent to the model — see
`packages/agent/src/prompts/system.ts` (Developer) and `packages/agent/src/prompts/roles.ts`
(Reviewer, PM Tester). If you edit a role's behavior, update both the prompt file and the
matching `.agents/*.agent.md` file here so they don't drift.

Full architecture, state machine, and design rationale: `docs/AGENT_ORCHESTRATOR.md`.

## The three roles

| Role | File | Prompt source | Tools |
| --- | --- | --- | --- |
| Developer | `Developer.agent.md` | `prompts/system.ts` (`SYSTEM_PROMPT`) | read_file, list_files, write_file, search_code, delete_file, run_command, fetch_url, rename_file |
| Reviewer | `Reviewer.agent.md` | `prompts/roles.ts` (`REVIEWER_SYSTEM_PROMPT`) | read_file, list_files, search_code (read-only) |
| PM Tester | `PMTester.agent.md` | `prompts/roles.ts` (`PM_TESTER_SYSTEM_PROMPT`) | read_file, list_files, search_code (read-only) |

## The loop, in one paragraph

A headless task runs Developer -> deterministic validation (lint/typecheck/test, zero LLM cost)
-> Reviewer -> PM Tester, in that order. Any deterministic failure or CHANGES_REQUESTED verdict
sends the issue back to the Developer as the next message and restarts the loop, bounded to
`MAX_ORCHESTRATOR_ITERATIONS` (3) full passes. Only when validation passes AND both Reviewer and
PM Tester return `VERDICT: APPROVED` does the task reach `pending_review` — the same
human-approval checkpoint that existed before this pipeline (a human still explicitly commits and
merges; the orchestrator never does either automatically unless `AGENT_AUTO_MERGE=true`).

## Why three roles instead of one bigger prompt

A single "do everything" prompt conflates three different failure modes: code that doesn't work,
code that works but is poorly written or insecure, and code that works and is well-written but
doesn't actually satisfy what was asked. Splitting them means each role's system prompt can be
short and specific, each role's LLM response is graded to a strict binary verdict (see "Why a
VERDICT line" in the architecture doc) instead of buried in a wall of mixed commentary, and a
human reading the audit log can see exactly which stage caught which class of problem.

## Do not

- Give Reviewer or PM Tester the `write_file` tool. They report; the Developer fixes. This is
  enforced in code (`READ_ONLY_TOOLS` in `packages/agent/src/core/roles.ts`), not just prompt
  instruction — don't relax that as a shortcut.
- Skip the deterministic validation pass "to save time" before Reviewer runs. It's the whole
  point of front-loading logic outside the LLM — see `docs/AGENT_ORCHESTRATOR.md`.
- Auto-merge on convergence. `pending_review` is a checkpoint for a human, not a formality.
- Raise `MAX_ORCHESTRATOR_ITERATIONS` casually. If tasks routinely need more than 3 rounds, that's
  a signal the task scope is too large for one orchestrated run, not that the limit is wrong.
