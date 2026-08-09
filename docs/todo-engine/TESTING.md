# Todo Engine — Testing

---

## 1. Unit (apps/api)

| Area        | Cases                                                   |
| ----------- | ------------------------------------------------------- |
| Task CRUD   | create requires title; tenant scope; reorder            |
| Status      | transitions; complete blocked when fields missing       |
| Reminders   | create absolute + preset; snooze; cancel                |
| Scheduler   | selects due window; skips already-fired; idempotent key |
| Recurrence  | next occurrence; incompleteBehavior                     |
| Conditions  | each operator; AND/OR short-circuit                     |
| Actions     | update/assign/create_task; notify mocked                |
| Automation  | match trigger; fail action → execution failed; retry    |
| Permissions | forbidden cross-tenant; missing capability              |
| TZ          | store UTC; display conversion helper                    |

Follow existing Jest style (`apps/api/src/tests/todoService.test.ts` pattern once present / couponService tests).

---

## 2. Integration

1. Create task → create reminder → job sweep → notification row + reminder status `fired` (once).
2. Complete task → automation `task.completed` → notify + create review task → execution log.
3. Required fields incomplete → `completeTask` GraphQL error → fill fields → complete OK.

Use test Mongo + mocked mail/push.

---

## 3. E2E (manual / Playwright later)

1. Open `/todo/[id]` → New task (title only) → open detail → add due + reminder.
2. Assign team/user → add 2 required fields → try complete → blocked → fill → complete.
3. Create automation “on complete → create review task” → complete → see new task + execution.
4. Confirm To Do / Done / Board / Gallery still load.

---

## 4. Non-functional checks

- Kill worker mid-job → retry does not duplicate notification.
- Wrong tenant JWT → empty list / FORBIDDEN.
- Job without `x-jobs-key` → 401.

---

## 5. Definition of done per phase

Each phase PR must list:

- Unit tests added
- Manual checklist for existing views regression
- Feature flag default (off in prod until soak)
