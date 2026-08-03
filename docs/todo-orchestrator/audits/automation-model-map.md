# Automation model map — `T-AUTO-01`

> TODO §11 (`Workflow`…) ↔ shipped `@luxgen/db` + `@luxgen/automation-flow`  
> Related: [`automation-gaps.md`](./automation-gaps.md), [`docs/AUTOMATION_FLOW_SCHEMA.md`](../../AUTOMATION_FLOW_SCHEMA.md)  
> Date: 2026-08-03

**Decision:** Keep dual representation. Do **not** rename `Automation` → `Workflow` or add DRAFT/LIVE/ARCHIVED enum in this task. Tower `flowDefinition` is canonical for graph; flat fields remain for list UI + `getAutomationsByTrigger` + bridge fallback.

---

## Entity map

| TODO (§11) | Shipped | Notes |
| --- | --- | --- |
| `Workflow` | `IAutomation` / GraphQL `Automation` | Same product surface |
| `organizationId` | `tenantId` | Always required; never drop |
| `name` | `name` + `flowDefinition.meta.name` | Synced on save |
| `description` | `flowDefinition.meta.description` only | Not a top-level Mongo field |
| `status` DRAFT/LIVE/PAUSED/ARCHIVED | `Automation.status` + mirrored `enabled` | `live` ⇔ `enabled`; soft archive via `archiveAutomation` |
| `version` / `publishedAt` / `publishedBy` | — | Deferred (`T-AUTO-04`) |
| `trigger` | `triggerType` + `triggerLabel` + entry node in `flowDefinition` | Synced via `flowToLegacyAutomation` |
| `steps[]` | `flowDefinition.nodes` + `edges` | Flat `actions[]` = action nodes only |
| `settings` (notify/retry) | — | Deferred (`T-AUTO-11`) |
| `tags` / `category` / `isTemplate` | Marketplace `AutomationTemplate` | Not on Automation row |
| `totalRuns` | `runCount` | No success/fail counters on parent |
| `successfulRuns` / `failedRuns` / `averageDuration` | Derive later from `AutomationRun` | Deferred analytics |
| `WorkflowRun` | `IAutomationRun` | status: running/success/error |
| `StepRun` | — | Deferred (`T-AUTO-05` deepen) |
| `WorkflowVersion` / comments | — | Out of scope |

---

## Step / trigger vocabulary

| TODO StepType / TriggerType | Shipped |
| --- | --- |
| SEND_EMAIL | `SEND_EMAIL` action + `core.notification.send_email` |
| ASSIGN_COURSE | `ENROLL_IN_COURSE` |
| GENERATE_CERTIFICATE | `ISSUE_CERTIFICATE` |
| WEBHOOK | `CALL_WEBHOOK` |
| CONDITION / DELAY / BRANCH | `condition` / `wait` node kinds (not flat actions) |
| AI_TASK… | `RUN_AGENT_TASK` (+ agent compounds) |
| NEW_LEARNER | `USER_ENROLLED` |
| NEW_SALE | `ORDER_CREATED` / `PAYMENT_SENT` |
| COURSE_COMPLETE | `COURSE_COMPLETED` |
| SCHEDULE / WEBHOOK | same names |

Full compound registry: `packages/automation-flow/src/catalog/compounds.ts`.

---

## Persistence contract (builder must not break)

```
TowerFlowDocument  ──flowToLegacyAutomation──►  name, enabled, triggerType, triggerLabel, actions[]
        │                                              │
        └────────── stored as flowDefinition ──────────┘
```

| Layer | Behavior |
| --- | --- |
| Web Tower save | `towerFlowToMutationInput` validates + dual-writes |
| API create/update | `applyFlowDefinitionSync` re-derives flat fields when `flowDefinition` parses |
| Bridge runtime | Prefer `planFlowExecution(flowDefinition)`; else flat `actions[]` |
| Tenant | `tenantId` on Automation + AutomationRun — never taken from flow JSON |

---

## Explicit non-goals (this task)

- No status enum migration  
- No StepRun collection  
- No GraphQL rename to `workflow`  
- No settings/retry schema  

Those stay on `T-AUTO-02` / `T-AUTO-04` / `T-AUTO-05` / `T-AUTO-11`.

---

## Acceptance

- [x] Documented mapping of TODO entities → existing models  
- [x] Code only where dual-write could drift (API sync on flowDefinition)  
- [x] `tenantId` preserved on create/update  
