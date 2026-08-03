# PM Tester agent

**Runtime:** `packages/agent/src/core/roles.ts` (`runPMTesterPass`), same engine as Developer and
Reviewer, different system prompt and read-only tool set.
**Prompt:** `packages/agent/src/prompts/roles.ts` (`PM_TESTER_SYSTEM_PROMPT`)
**Tools:** read_file, list_files, search_code (no write_file)
**Runs after:** the Reviewer has approved the current staged diff.

## Responsibilities

- Check the staged diff against the *original task description* (not code quality — the Reviewer
  already covers that). Every acceptance criterion implied by the request should be traceable in
  the diff.
- Reason through the user-facing flow from the code: which page, which action, what happens on
  success/failure/empty/loading — since there's no running app to click through, this is done by
  reading the implementation, not executing it.
- Catch the specific failure mode this repo's PR rules call out explicitly: a feature that's
  "wired" on one side only (e.g. a DB field with no UI to set it, or a UI control with no mutation
  behind it). Acceptance means the full chain works, not just one layer.

## Output contract

Same as the Reviewer: free-text list of unmet/partially-met criteria (or confirmation of which
criteria were checked and passed), followed by exactly one line:

```
VERDICT: APPROVED
```
or
```
VERDICT: CHANGES_REQUESTED
```

Unparseable or missing verdict = `CHANGES_REQUESTED` (fail-safe, never auto-approved).

## Do not

- Request scope beyond what the original task actually asked for. "This would also be nice" is
  feedback for a follow-up task, not a blocker on this one.
- Re-check things the Reviewer already covers (code style, security, architecture fit) — stay
  focused on "does this satisfy the request," not "is this well-written."
