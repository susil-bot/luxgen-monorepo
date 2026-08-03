# Template Control Core

> How industry templates relate to the core automation engine. Read this before adding a new industry vertical or a new marketplace template.

## The one-sentence model

**Templates configure the core. They never extend it.** A template is data (a pre-filled Tower flow document or a flat trigger→actions list) that wires together compounds that already exist in `packages/automation-flow/src/catalog/compounds.ts`. If a template needs a capability that isn't in the catalog, that's a signal to add a compound (engineering work, rare) — not to special-case the template (which would silently fork the engine per industry).

```
┌─────────────────────────────────────────────────────────────┐
│  CORE (fixed, versioned, industry-agnostic)                 │
│  packages/automation-flow — graph engine + compound catalog │
│  packages/agent/src/automation/bridge.ts — execution        │
│  packages/db — Automation, AutomationTemplate schemas       │
└─────────────────────────────────────────────────────────────┘
                          ▲ controls / is configured by
                          │
┌─────────────────────────────────────────────────────────────┐
│  TEMPLATE (data, per industry, cheap to add)                │
│  AutomationTemplate.flowDefinition or .actions               │
│  + industry: string[] tags for Marketplace discovery         │
└─────────────────────────────────────────────────────────────┘
```

## Two ways a template controls the core

### 1. Flat (`triggerType` + `actions[]`) — for simple trigger → action(s)

Used when there's no branching or waiting. Example (shipped in this pass): `certificate-recert-reminder` in `apps/api/src/services/marketplaceService.ts`:

```ts
{
  slug: 'certificate-recert-reminder',
  triggerType: 'CERTIFICATE_EXPIRING_SOON',
  actions: [{ type: 'SEND_EMAIL', config: { template: 'certificate_recert_reminder' } }],
  industry: ['compliance-training', 'franchise', 'healthcare'],
}
```

Installing this template (`installAutomationTemplate` mutation → `marketplaceService.installTemplate`) just copies `triggerType` + `actions` onto a new `Automation` document for that tenant. Zero new code runs — it's 100% "control by configuration."

### 2. Graph (`flowDefinition`) — for branching/waiting flows

Used when the template needs a condition or a delay. Example (shipped in this pass): `abandoned-cart-reminder`:

```
commerce.order.drafted (trigger)
        │
   core.wait.delay (wait 3600s)
        │
core.condition.field_equals (paymentStatus != PAID)
        │ true
core.notification.send_email (template: abandoned_cart)
```

This is stored as a full `TowerFlowDocument` on `AutomationTemplate.flowDefinition` (added field — see `packages/db/src/automation-template.ts`) and passed straight through to `Automation.flowDefinition` on install (`marketplaceService.installTemplate`, `apps/api/src/services/marketplaceService.ts`). Again: no new bridge code per template — the same graph engine that runs every other automation runs this one.

## Why the abandoned-cart template needed a real engine fix, not just data

Before this pass, `packages/agent/src/automation/bridge.ts` resolved a flow's condition branches **once**, against the trigger-time payload, before any `wait` step ran (`planFlowExecutionFromDefinition` — still used for read-only previews/summaries). That's correct for "branch on data known at trigger time" but wrong for "wait 60 minutes, then check if the order is *still* unpaid" — the condition would have evaluated against stale data captured a full hour earlier.

Fix: `bridge.ts` now walks the graph node-by-node (`walkFlowLive`) and calls `refreshEventPayload()` — a live Enrollment lookup — after every `wait` step, before the next `condition` is evaluated. This is a **core** change (applies to every tenant's every flow with a wait→condition pattern), not something the abandoned-cart template does on its own. That's the point: the template only had to describe *what* to check; the core had to be capable of checking it *live*. Templates should never need to work around a core limitation — if one does, fix the core.

## Adding a new industry vertical — decision tree

1. **Can existing compounds express the workflow?** (check `FLOW_COMPOUND_CATALOG` in `packages/automation-flow/src/catalog/compounds.ts`) → Yes: just add a template (marketplace seed entry + `industry` tags). No engineering beyond a `MarketplaceService.CATALOG_SEED` entry.
2. **Does it need one new trigger/condition/action, but the same execution semantics (no new infra)?** → Add a compound to the catalog (see "Adding a compound" in `docs/AUTOMATION_FLOW_SCHEMA.md`), tag it `industry: [...]`, wire a handler in `bridge.ts` if it's a new action type, then go to step 1.
3. **Does it need genuinely new infrastructure** (a new data model, a new sweep job, a new external integration)? → This is the recert-reminder case: `CERTIFICATE_EXPIRING_SOON` needed a new field on `Enrollment` (`certificateExpiresAt`) and a new cron sweep (`certificateReminderService`) because — unlike every other trigger — recertification isn't fired by a live user action. Treat this as a scoped engineering task with its own review, not a template.

## Compounds added in this pass (reference)

| Compound | Kind | Category | Industry tags | Notes |
|---|---|---|---|---|
| `learner.certificate.expiring_soon` | trigger | learner | compliance-training, franchise, healthcare | Fed by `certificateReminderService` sweep, not a live event |
| `learner.certificate.issue` | action | learner | coaching, compliance-training, franchise, healthcare | Sets `Enrollment.certificateExpiresAt` from `validityDays` config — this is the "customize per industry" knob (HIPAA might use 365, a franchise SOP might use 90) |
| `core.notification.send_email` (extended) | action | core | — | Added `abandoned_cart` and `certificate_recert_reminder` template options; email bodies live in `packages/agent/src/automation/email.ts`, not per-industry code |

None of these are industry-*exclusive* — `industry` only drives Marketplace filtering/discovery (§ below), never execution gating. A compliance-training tenant and an e-commerce tenant can both use `learner.certificate.issue` if it fits their workflow.

## `industry` tag — what it does and doesn't do

- **Does:** filter the Marketplace/Template Library UI (`automationTemplates(industry: "compliance-training")`), help new tenants find relevant starting points.
- **Doesn't:** gate execution, restrict which compounds a tenant can use in the Flow Builder, or change plan/billing logic. Gating is `planGate.ts`'s job (Pro/Business/Enterprise), and it stays orthogonal to industry.

## Where things live (quick reference)

| Concern | File |
|---|---|
| Compound catalog (the core's vocabulary) | `packages/automation-flow/src/catalog/compounds.ts` |
| `industry` field on the compound type | `packages/automation-flow/src/types.ts` (`FlowCompoundDefinition.industry`) |
| Graph execution + live payload refresh | `packages/agent/src/automation/bridge.ts` (`walkFlowLive`, `refreshEventPayload`) |
| Email templates (industry-specific copy, not industry-specific code) | `packages/agent/src/automation/email.ts` |
| Marketplace template schema (`flowDefinition`, `industry`) | `packages/db/src/automation-template.ts` |
| Marketplace template seed data | `apps/api/src/services/marketplaceService.ts` (`CATALOG_SEED`) |
| Recert sweep job | `apps/api/src/services/certificateReminderService.ts`, `apps/api/src/routes/jobs.ts` (`POST /api/jobs/certificate-reminders`) |

## Operational note

`@luxgen/automation-flow`'s `package.json` ships a compiled `dist/index.js` as `main`, while `types` points straight at `src/index.ts`. That means type-checking already sees the new catalog entries, but **the running API/agent process won't until `npm run build` (or `turbo build --filter=@luxgen/automation-flow`) runs** — the catalog is data compiled into `dist/catalog/compounds.js`. Rebuild before deploying.
