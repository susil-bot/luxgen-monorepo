# Skill: Automations & Workflows

**Domain:** Automation rules, triggers, actions, marketplace install, usage limits.  
**Docs:** [FEATURE_CATALOG.md](../../docs/FEATURE_CATALOG.md) §4–5, [AGENT_STUDIO_ARCHITECTURE.md](../../docs/AGENT_STUDIO_ARCHITECTURE.md), [TOWER_BUILDER.md](../../docs/TOWER_BUILDER.md), [TEMPLATE_CONTROL_CORE.md](../../docs/TEMPLATE_CONTROL_CORE.md), [AUTOMATION_HUB_STRATEGY.md](../../docs/AUTOMATION_HUB_STRATEGY.md)

---

## Key paths

| Layer          | Path                                           |
| -------------- | ---------------------------------------------- |
| Flow graph API | `packages/automation-flow/src/graph.ts`        |
| Tower UI       | `apps/web/pages/automations/tower/`            |
| GraphQL        | `apps/api/src/schema/automation/`              |
| Service        | `apps/api/src/services/automationService.ts`   |
| Models         | `packages/db/src/automation.ts`                |
| Bridge         | `packages/agent/src/automation/bridge.ts`      |
| Events         | `packages/agent/src/automation/events.ts`      |
| Web UI         | `apps/web/pages/automations/`                  |
| Queries        | `apps/web/graphql/queries/automations.ts`      |
| Marketplace    | `schema/marketplace/`, `marketplaceService.ts` |

---

## Business goal

Reduce manual ops (enrollment follow-ups, merge notifications) and drive **Pro** upgrades via plan gate `automations`.

---

## Plan gate

- **Pro+** required for create/toggle/run
- Check: `@luxgen/billing` `assertFeature(plan, 'automations')`
- Web: automations page should respect tenant plan (or show upgrade CTA)

---

## Adding a trigger

1. Add to `AutomationTriggerType` in `@luxgen/db` (type union + Mongoose enum array — both places) and GraphQL enum in `apps/api/src/schema/automation/typeDefs.ts`
2. Also register a `FlowCompoundDefinition` (kind: `trigger`) in `packages/automation-flow/src/catalog/compounds.ts` with `legacyTriggerType` set — this is what makes it selectable in the Tower builder, not just usable via the legacy flat API. Tag `industry: string[]` if it's vertical-specific (see "Industry tagging" below).
3. Emit via `emitAutomationEvent({ tenantId, triggerType, payload })` — either directly, or add a small typed wrapper next to the existing `emitCommerceAutomationEvent`/`emitAgentAutomationEvent`/`emitCertificateExpiringSoonEvent` in `packages/agent/src/automation/bridge.ts` (that's where these live today, not `events.ts` — `events.ts` only holds the channel/type definitions).
4. **If the trigger isn't fired by a live user action** (e.g. a recertification deadline, unlike enrollment/order/completion events which fire from real request handlers), it needs a sweep job, not just an emit call. Follow `certificateReminderService.ts` + `apps/api/src/routes/jobs.ts` (`POST /api/jobs/<name>-reminders`, `x-jobs-key` auth) — the same shape as the pre-existing `listingReminderService`. Don't invent a new job-auth pattern.
5. Usage limiting is automatic — `emitAutomationEvent` itself calls `assertMonthlyAutomationRunsAllowed`/`incrementAutomationRuns`. Don't re-implement this in a wrapper.

---

## Adding an action

1. Extend action type enum + config shape in DB/GraphQL (`packages/db/src/automation.ts`, `apps/api/src/schema/automation/typeDefs.ts`)
2. Register the matching `FlowCompoundDefinition` (kind: `action`) in the catalog with `legacyActionType` set, same as triggers above.
3. Implement a real handler in `bridge.ts` `executeAction()` — **do not add a new action type to the shared log-only `console.log` case** (`NOTIFY_SLACK`/`CALL_WEBHOOK`/`TAG_USER`/etc.) unless it's genuinely fine to ship as a stub; `SEND_EMAIL` and `ISSUE_CERTIFICATE` both sat in that group silently doing nothing for real until this was caught and fixed (see `fix/automation-send-email-and-live-condition-eval`). Give every new action its own `case` with real behavior before merging.
4. Update automations UI labels if needed.

---

## Industry tagging (compounds and templates)

`industry: string[]` on a `FlowCompoundDefinition` or `AutomationTemplate` is **discovery metadata
only** — it filters the Marketplace/Template Library, and nothing else. Never gate execution or
Flow Builder access on it; plan gating (`Pro`/`Business`/`Enterprise`) is the only access control
and stays orthogonal to industry. Full model: [TEMPLATE_CONTROL_CORE.md](../../docs/TEMPLATE_CONTROL_CORE.md).

Before adding a new industry vertical, check whether existing compounds already express the
workflow — most do. Only add a compound when the workflow genuinely needs a capability the
catalog doesn't have yet (new action type, new infra like a sweep job). Otherwise it's just a new
`AutomationTemplate` seed entry with `industry` tags — no engineering beyond that.

---

## Graph templates (`flowDefinition`) vs. flat templates (`actions[]`)

`AutomationTemplate.actions` (flat trigger → action(s), no branching) is enough for most
templates. Use `AutomationTemplate.flowDefinition` (a full `TowerFlowDocument`) only when the
template needs a `condition` or `wait` node — see the `abandoned-cart-reminder` seed in
`marketplaceService.ts` for the reference shape. `installTemplate()` passes `flowDefinition`
straight through to the new `Automation` when present, in preference to `actions`.

**Any flow with `wait` → `condition` needs the condition to see live data, not the trigger-time
payload** — `bridge.ts`'s `walkFlowLive`/`refreshEventPayload` handle this by re-fetching
`Enrollment` state after every wait. If you add a new condition compound whose data doesn't live
on `Enrollment`, extend `refreshEventPayload` accordingly — don't assume the trigger payload is
still accurate after a wait.

---

## Marketplace template install

- Seeds from `AutomationTemplate` model
- `installAutomationTemplate` mutation → creates tenant `Automation` rows
- Enforces automation count + run limits

Doc: [PHASE_10_MARKETPLACE.md](../../docs/PHASE_10_MARKETPLACE.md)

---

## Do not

- Bypass usage limits in bridge (breaks billing integrity)
- Put heavy logic in GraphQL resolvers — use `automationService`
- Add a new action type to the shared log-only stub case in `executeAction()` — give it a real handler
- Gate execution or Flow Builder visibility on `industry` — it's discovery metadata only
- Assume a payload is still fresh after a `wait` node — re-fetch, don't trust the trigger-time snapshot
