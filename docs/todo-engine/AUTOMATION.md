# Todo Engine — Automation

> Deterministic engine first; AI is a authoring/assist layer on top ([ARCHITECTURE.md](./ARCHITECTURE.md) Phase 5–7).

---

## 1. Reuse vs new

| Existing                                                          | Reuse how                                                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `@luxgen/agent` `emitAutomationEvent` + LMS/commerce `Automation` | Optional **bridge** when a task event should start a Tower workflow                             |
| `@luxgen/automation-flow` compounds                               | Inspiration for condition/action shapes; not required to store Todo rules as Tower graphs in v1 |
| `/api/jobs` + sweep services                                      | Time triggers (`due_soon`, reminders, recurrence)                                               |
| Redis / agent-worker                                              | Async action execution                                                                          |

**v1 decision:** First-class **`TaskAutomation`** documents evaluated by `taskAutomationService`, not stored as Tower `flowDefinition`. Keeps Todo UX simple and avoids forcing Pro automations plan for basic “notify on complete”.

---

## 2. Pipeline

```
Domain event / scheduler tick
        ↓
Match TaskAutomations (tenant + trigger type)
        ↓
Evaluate condition tree (AND/OR)
        ↓
Create TaskAutomationExecution (status=running)
        ↓
Enqueue actions with idempotencyKey
        ↓
Executor runs actions (sync short / queue long)
        ↓
Record step results → completed|failed
        ↓
ActivityEvent + optional Notification
```

---

## 3. Triggers (initial)

- `task.created` / `task.updated` / `task.assigned`
- `task.status_changed` (with from/to)
- `task.completed`
- `task.due_soon` / `task.overdue`
- `task.reminder_triggered`
- `task.field_completed` / `task.fields_incomplete` (scheduler or on save)
- `scheduled_time` (cron expression on automation — Phase 8)

Extensibility: register handlers in a map; **no** core Task service edits per new trigger — only emit events.

---

## 4. Conditions

Operators: `eq`, `neq`, `contains`, `gt`, `lt`, `empty`, `not_empty`, `changed`, `changed_from`, `changed_to`.

Groups: `AND` / `OR` nested.

Examples:

- `status eq COMPLETED` AND `teamId eq <finance>`
- `priority eq CRITICAL` AND `assigneeId empty`

---

## 5. Actions (initial)

| Action                                    | Sync/Async | Notes                           |
| ----------------------------------------- | ---------- | ------------------------------- |
| `update_task`                             | sync       | field patch                     |
| `assign_task`                             | sync       |                                 |
| `set_status` / `set_priority` / `set_due` | sync       |                                 |
| `create_task` / `create_subtask`          | sync       | same tenant/list                |
| `add_comment`                             | sync       |                                 |
| `add_label`                               | sync       | when labels exist               |
| `notify_user` / `notify_team`             | async      | in-app + email/push             |
| `send_email`                              | async      | reuse existing mail path if any |
| `webhook`                                 | async      | signed                          |
| `request_approval`                        | Phase 8    |                                 |

AI actions (`summarize`, `draft_report`) are **async + confirm** in Phase 7 — never as silent side effects of Phase 5 rules unless flagged `allowAiActions`.

---

## 6. Idempotency

Key format:

```
{tenantId}:{automationId}:{taskId}:{trigger}:{occurrenceBucket}
```

Examples:

- Status change: `...:status_changed:COMPLETED:evt_<eventId>`
- Reminder: `...:reminder:<reminderId>:<fireAtISO>`

Unique index prevents double execution on retry.

---

## 7. Escalation

Implement as **automations**, not hardcoded if/else:

- Overdue → notify assignee
- Overdue > 24h → notify manager
- Overdue > 72h → create escalation task

Scheduler emits `task.overdue` with `overdueHours`; conditions filter.

---

## 8. Execution log (UX)

Surface: automation detail → Executions tab.

Show: trigger payload, condition pass/fail, each action ✓/✗, duration, error, retry button.

---

## 9. Test mode

`testTaskAutomation` runs against a sample task **without** external side effects (or with sandbox flag): evaluate conditions, simulate actions, return dry-run execution record (`status: tested`).

---

## 10. AI authoring (Phase 7)

1. User NL prompt → draft trigger/conditions/actions JSON.
2. UI preview (editable).
3. User Save → `createTaskAutomation`.
4. Never auto-enable without explicit Active toggle.
