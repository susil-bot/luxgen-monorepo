# Agent task card — min-token contract

> Used by the Developer → Reviewer → PM Tester orchestrator (`docs/AGENT_ORCHESTRATOR.md`).
> **Goal:** one vertical slice per job, ≤3 orchestrator iterations, no full-spec ingestion.

## Hard rules (token budget)

1. **Do not read an entire `docs/TODO-*.md`.** Only the `source` line range on the task card.
2. **Read at most:** this card + `AGENTS.md` skill row + listed `touch` paths + source slice.
3. **One PR type only:** `feat/` or `fix/` — never mix (`.cursor/rules/pr-workflow.mdc`).
4. **Full CRUD chain required** when the task says wire: UI field → GraphQL → service → model.
5. If scope > one screen **or** > ~400 LOC staged, **stop** and open a follow-up task — do not expand.
6. Prefer existing pages/routes over inventing parallel URLs; match `DefaultNavigation.tsx`.

## Prompt template (paste as headless `messages[0].content`)

```text
TASK {{id}} | {{priority}} | SLA {{sla}}
TITLE: {{title}}
SKILL: skills/{{skill}}/SKILL.md
SOURCE: {{source_file}} L{{start}}-L{{end}}   # read ONLY this range
TOUCH: {{touch}}
DEPS: {{deps}}   # must be done or skip
DO NOT: read other TODO docs; broaden scope; invent demo users; raw hex / bg-gray-*

ACCEPTANCE (PM Tester grades these only):
{{acceptance_bullets}}

DONE WHEN: all AC met + lint/typecheck/test green + VERDICT APPROVED from Reviewer and PM Tester.
```

## Status vocabulary

| Status | Meaning |
| --- | --- |
| `todo` | Ready to enqueue |
| `blocked` | Waiting on `deps` or missing source doc |
| `doing` | Headless job running |
| `review` | `pending_review` — human commit/merge |
| `done` | Merged to `main` |
| `wont` | Explicitly deferred |

## SLA units

| Label | Meaning |
| --- | --- |
| `S` | ≤1 orchestrated run (~30–60 min wall) |
| `M` | ≤2 runs / one feature PR |
| `L` | Split before enqueue — never run as one job |

Update `docs/todo-orchestrator/queue.yaml` status when a task moves.
