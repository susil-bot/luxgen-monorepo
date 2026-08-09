# Todo Engine — Database

> Companion to [ARCHITECTURE.md](./ARCHITECTURE.md). MongoDB / Mongoose under `packages/db`.

---

## 1. Current schema

### `TodoList`

| Field         | Type    | Notes   |
| ------------- | ------- | ------- |
| `tenantId`    | string  | indexed |
| `name`        | string  |         |
| `createdById` | string? |         |
| timestamps    |         |         |

### `Task` (today)

| Field         | Type             | Notes    |
| ------------- | ---------------- | -------- |
| `tenantId`    | string           | indexed  |
| `todoListId`  | string           | indexed  |
| `title`       | string           | required |
| `notes`       | string?          |          |
| `status`      | `TODO` \| `DONE` |          |
| `sortOrder`   | number           |          |
| `dueDate`     | Date?            |          |
| `createdById` | string?          |          |
| timestamps    |                  |          |

Index: `{ tenantId, todoListId, status, sortOrder }`.

### Related but separate

- **`ProjectItem`** — sprint board; do not store Todo engine data here.
- **`ActivityEvent`** — generic activity; use for task audit or introduce `TaskActivity`.
- **`Automation` / `AutomationRun`** — LMS/commerce workflows; optional bridge later.

---

## 2. Target entities (conceptual)

All include `tenantId` + timestamps unless noted.

### Phase 1 — Task enhancement

Extend `Task`:

| Field         | Type                                          | Notes                                                                                                                                                   |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`      | enum                                          | Expand: `DRAFT`, `OPEN`, `IN_PROGRESS`, `BLOCKED`, `READY_FOR_REVIEW`, `COMPLETED`, `CANCELLED`, `ARCHIVED` — migrate `TODO`→`OPEN`, `DONE`→`COMPLETED` |
| `priority`    | `P0`–`P3` or `LOW`/`MEDIUM`/`HIGH`/`CRITICAL` | Align with ProjectItem or product copy                                                                                                                  |
| `teamId`      | ObjectId/string?                              | Org group / custom team                                                                                                                                 |
| `assigneeId`  | ObjectId?                                     | User                                                                                                                                                    |
| `followerIds` | ObjectId[]                                    |                                                                                                                                                         |
| `startDate`   | Date?                                         |                                                                                                                                                         |
| `dueDate`     | Date?                                         | existing                                                                                                                                                |
| `timezone`    | string?                                       | IANA; fallback user prefs                                                                                                                               |
| `completedAt` | Date?                                         |                                                                                                                                                         |
| `templateId`  | ObjectId?                                     | Phase 3                                                                                                                                                 |

### Phase 2 — Reminder

**`TaskReminder`**

| Field            | Type                                                |
| ---------------- | --------------------------------------------------- |
| `tenantId`       | string                                              |
| `taskId`         | ObjectId                                            |
| `fireAt`         | Date (UTC)                                          |
| `offsetPreset`   | enum? (`M5`,`M15`,`H1`,`D1`,… ) or null if absolute |
| `channelPrefs`   | string[] (`in_app`,`email`,`push`,…)                |
| `status`         | `scheduled` \| `fired` \| `snoozed` \| `cancelled`  |
| `snoozeUntil`    | Date?                                               |
| `lastFiredAt`    | Date?                                               |
| `idempotencyKey` | string unique per fire                              |

Index: `{ tenantId, status, fireAt }`, `{ taskId }`.

### Phase 3 — Required information

**`TaskTemplate`** — team-scoped blueprint  
**`TaskFieldDefinition`** — name, type, required, validation, visibility rules  
**`TaskFieldValue`** — taskId + fieldDefinitionId + value JSON

Types: text, number, currency, date, datetime, select, multi, person, team, file, url, checkbox, richtext.

Completion rule: all `required` (and conditional-required) values present before status → `COMPLETED`.

### Phase 4 — Recurrence

**`TaskRecurrenceRule`**

| Field                 | Notes                                 |
| --------------------- | ------------------------------------- |
| `taskId` / `seriesId` | series root                           |
| `rrule` or structured | daily/weekly/monthly/yearly/custom    |
| `nextFireAt`          | UTC                                   |
| `incompleteBehavior`  | create_anyway / skip / after_complete |
| `timezone`            |                                       |

Prevent duplicates via unique `(seriesId, occurrenceKey)`.

### Phase 5 — Task automation

**`TaskAutomation`** — name, enabled, trigger, condition tree, actions[]  
**`TaskAutomationExecution`** — automationId, taskId, status, startedAt, finishedAt, steps[], error  
**`TaskAutomationJob`** — queue state, attempts, idempotencyKey

Unique: `{ tenantId, idempotencyKey }`.

### Phase 8 — Dependencies / comments / attachments

**`TaskDependency`** — `{ blockerId, blockedId }`  
**`TaskComment`**, **`TaskAttachment`**  
Or fold comments into `ActivityEvent` with `subjectType: TASK`.

### Notifications

**`Notification`** — userId, tenantId, category, payload, readAt  
**`NotificationPreference`** — per-channel toggles

---

## 3. Indexes (critical)

```
Task: { tenantId, dueDate }, { tenantId, assigneeId, status }, { tenantId, status, dueDate }
TaskReminder: { tenantId, status, fireAt }
TaskAutomationExecution: { tenantId, automationId, createdAt }
TaskFieldValue: { taskId, fieldDefinitionId } unique
```

---

## 4. Migration notes

- Additive only in early phases.
- Dual-read status aliases during enum expansion.
- Soft-delete / archive preferred over hard delete for compliance (optional `deletedAt`).
- No cross-tenant `$or` queries without tenant predicate.
