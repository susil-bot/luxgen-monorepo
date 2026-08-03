# Automation builder gaps — `T-E0-03`

> Source: `docs/TODO-Enterprise Product Specification: Workflow Automation Builder.md`  
> Focus: §11 Data Model (L432–596), §12 GraphQL (L597–941), builder UI (overview L1–120 + live Tower)  
> Date: 2026-08-03 · Product code: **none**

Status: `wired` · `partial` · `missing`

**Naming note:** TODO says **Workflow**; codebase says **Automation** + `flowDefinition` (`TowerFlowDocument` v1). Treat as the same product surface.

---

## Summary

| Area | Wired | Partial | Missing |
| --- | ---: | ---: | ---: |
| §11 model | 2 | 4 | 5 |
| §12 GraphQL ops | 5 | 3 | 8 |
| Builder UI | 4 | 3 | 5 |

**Bottom line:** Tower builder + flat automations list are real and gated (`PlanGate` / `requireFeature('automations')`). Gaps vs TODO are mostly **lifecycle statuses** (draft/live/pause/archive + versioning), **step-level GraphQL mutations**, **test-run**, **per-workflow run detail**, and **subscriptions**.

---

## Routes (overview vs shipped)

| TODO route | Status | Actual |
| --- | --- | --- |
| `/automation/workflows` | partial | `/automations` (legacy list) + `/automations/tower` (Tower list) |
| `/automation/workflows/:id/edit` | partial | `/automations/tower/[id]` |
| `…/:id/runs` | partial | `/automations/tower/runs` (tenant-wide recent logs, not per-workflow) |
| `…/:id/analytics` | missing | — |
| `…/:id/versions` | missing | — |
| `…/:id/settings` | missing | Settings live in-builder only |
| Marketplace / Agent Studio links | partial | `/marketplace`, `/agent` exist; not deep-linked from builder exits as TODO describes |

Nav: `DefaultNavigation.tsx` → Automations → Tower, Recent Run Logs.

---

## §11 Data Model

| TODO entity / field | Status | Codebase | Path |
| --- | --- | --- | --- |
| Workflow core (id, name, tenant) | wired | `IAutomation` / GraphQL `Automation` | `packages/db/src/automation.ts`, `apps/api/src/schema/automation/typeDefs.ts` |
| `organizationId` | wired | `tenantId` | same |
| Status `DRAFT/LIVE/PAUSED/ARCHIVED` | partial | `enabled: Boolean` only (on/off) | `IAutomation.enabled` |
| `version`, `publishedAt`, `publishedBy` | missing | — | — |
| `trigger` object + conditions | partial | `triggerType` + `triggerLabel`; conditions live inside `flowDefinition` nodes | db + `@luxgen/automation-flow` |
| `steps: [WorkflowStep!]` | partial | Flat `actions[]` **and/or** `flowDefinition` graph nodes | `flowDefinition?: Mixed` |
| Step types SEND_EMAIL, DELAY, CONDITION, AI_*, … | partial | Catalog compounds + `AutomationActionType`; AI_* mostly via `RUN_AGENT_TASK`; DELAY/wait as flow nodes | `packages/automation-flow/src/catalog/compounds.ts`, `bridge.ts` |
| `settings` (notify, retry) | missing | Not on Automation model | — |
| tags / category / isTemplate | missing | Templates via marketplace `AutomationTemplate`, not on Automation row | marketplace schema |
| Analytics fields (`totalRuns`, success/fail, avg duration) | partial | `runCount`, `lastRunAt` only | `IAutomation` |
| WorkflowRun + StepRun detail | partial | `IAutomationRun` (status, durationMs, error, payload) — **no per-step run rows** | `packages/db/src/automation.ts` |
| WorkflowVersion / comments | missing | — | — |

---

## §12 GraphQL Mapping

### Queries

| TODO | Status | Actual | Notes |
| --- | --- | --- | --- |
| `workflow(id)` / GetWorkflow | partial | `automation(id)` | No version/settings/run aggregates beyond `runCount`/`lastRunAt` |
| `workflows(organizationId, filter, sort, pagination)` | partial | `automations(tenantId, limit, offset)` | No cursor connection, filter/sort enums, or `totalCount` |
| `workflowElements` | wired | `automationSchema: JSON!` | Returns compound catalog (triggers/actions/logic) |
| `workflowRuns(workflowId, pagination)` | partial | `automationRuns(tenantId, limit)` | Tenant-scoped list; **not** filtered by automationId in schema |

### Mutations

| TODO | Status | Actual |
| --- | --- | --- |
| `createWorkflow` | wired | `createAutomation` |
| `updateWorkflow` | wired | `updateAutomation` (includes whole `flowDefinition`) |
| `addWorkflowStep` / `updateWorkflowStep` / `deleteWorkflowStep` | missing | Steps mutated by rewriting `flowDefinition` client-side then `updateAutomation` |
| `publishWorkflow` | partial | `toggleAutomation(enabled: true)` — no version bump / `publishedAt` |
| `pauseWorkflow` | partial | `toggleAutomation(enabled: false)` |
| `testWorkflow` | missing | — |
| `duplicateWorkflow` | missing | — |
| `archiveWorkflow` | missing | `deleteAutomation` only (hard delete) |

### Subscriptions

| TODO | Status | Actual |
| --- | --- | --- |
| `workflowRunUpdated` | missing | — |
| `workflowEdited` (collab) | missing | — |

Web client ops: `apps/web/graphql/queries/automations.ts` — GET/CREATE/UPDATE/TOGGLE/DELETE + GET_AUTOMATION_RUNS + RUN_AGENT_TASK.

---

## Builder UI (Tower)

| Capability | Status | Path |
| --- | --- | --- |
| Visual canvas + connectors | wired | `TowerGraphCanvas`, `FlowConnector` |
| Add step picker (catalog) | wired | `AddStepPicker` + `automationSchema` / compounds |
| Config panel fields | wired | `FlowConfigFieldInput`, `TowerStepRail` |
| Persist flow | wired | `useTowerFlowPersist` → `updateAutomation` / create with `flowDefinition` |
| Enable / disable from builder | wired | `flow.meta.enabled` + save (`[id].tsx`) |
| Legacy list CRUD + toggle + runs strip | wired | `apps/web/pages/automations/index.tsx` |
| Plan gate | wired | `PlanGate feature="automations"` |
| Per-workflow run history drawer | missing | Only `/automations/tower/runs` aggregate |
| Test-run panel | missing | — |
| Publish vs save draft UX | missing | Boolean enabled only |
| Analytics / versions / settings screens | missing | — |
| Real-time run updates | missing | Poll/refetch only |

Bridge execution (not GraphQL, but relevant): `packages/agent/src/automation/bridge.ts` — live `SEND_EMAIL`, `ISSUE_CERTIFICATE`, flow wait→condition refresh; several actions still log-only stubs (skill warning).

---

## Recommended enqueue order

| Task | Why |
| --- | --- |
| `T-AUTO-01` | Document Workflow↔Automation field map; decide status enum vs `enabled` |
| `T-AUTO-02` | Highest GraphQL gap from audit: pick **one** family — prefer `automationRuns(automationId)` **or** `testWorkflow` **or** archive/duplicate |
| `T-AUTO-03` | Already largely wired — tighten AC to remaining canvas persist bugs only |
| `T-AUTO-04` | Formalize publish/pause (status or keep toggle + UX labels) |
| `T-AUTO-05` | Per-automation run history |
| `T-AUTO-06` | `testWorkflow` mutation + drawer |
| `T-AUTO-09` | Keep `wont` until runs API solid (subscriptions) |

---

## Acceptance check (`T-E0-03`)

- [x] Gap table for §11–§12 model/GraphQL and builder UI  
- [x] File paths cited  
- [x] No product code changes  
