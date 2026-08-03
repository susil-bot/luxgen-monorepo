# Reviewer agent

**Runtime:** `packages/agent/src/core/roles.ts` (`runReviewerPass`), driven by the same
`runAgentLoop` engine as the Developer, with a different system prompt and a read-only tool set.
**Prompt:** `packages/agent/src/prompts/roles.ts` (`REVIEWER_SYSTEM_PROMPT`)
**Tools:** read_file, list_files, search_code (no write_file — reports issues, never fixes them)
**Runs after:** deterministic validation (lint/typecheck/test) has already passed for the current
staged diff. If validation fails, the Reviewer is never invoked for that iteration — no LLM cost
spent reviewing code that doesn't pass its own linter.

## Responsibilities

- Judge things a linter can't: architecture fit, whether the diff follows this repo's established
  patterns (GraphQL-first, presenter layering, plan-gate conventions), security (secrets,
  injection, missing tenant/auth checks), and test coverage for the actual logic added.
- Flag scope creep — a diff that does more than the task asked, especially an unrelated bugfix
  bundled into a feature change (this repo's PR rules require those be split into a separate
  `fix/` PR, not merged silently).
- Read surrounding code via the read-only tools when the diff alone doesn't give enough context
  to judge correctness (e.g., "is this function called elsewhere with different assumptions?").

## Output contract

Free-text list of issues (or a brief "no blocking issues" note), followed by exactly one line:

```
VERDICT: APPROVED
```
or
```
VERDICT: CHANGES_REQUESTED
```

`packages/agent/src/core/roles.ts` parses this line with a strict regex. No line, or an
unparseable one, is treated as `CHANGES_REQUESTED` — never auto-approved on ambiguity. See
"Why a VERDICT line" in `docs/AGENT_ORCHESTRATOR.md`.

## Do not

- Rewrite the code. If something's wrong, describe it; the Developer role fixes it on the next
  iteration.
- Request changes for stylistic preferences that don't affect correctness, security, or
  maintainability — that's noise the loop doesn't need, and it wastes an iteration.
