# Skill: Automations & Workflows

**Domain:** Automation rules, triggers, actions, marketplace install, usage limits.  
**Docs:** [FEATURE_CATALOG.md](../../docs/FEATURE_CATALOG.md) §4–5, [AGENT_STUDIO_ARCHITECTURE.md](../../docs/AGENT_STUDIO_ARCHITECTURE.md)

---

## Key paths

| Layer | Path |
|-------|------|
| GraphQL | `apps/api/src/schema/automation/` |
| Service | `apps/api/src/services/automationService.ts` |
| Models | `packages/db/src/automation.ts` |
| Bridge | `packages/agent/src/automation/bridge.ts` |
| Events | `packages/agent/src/automation/events.ts` |
| Web UI | `apps/web/pages/automations/` |
| Queries | `apps/web/graphql/queries/automations.ts` |
| Marketplace | `schema/marketplace/`, `marketplaceService.ts` |

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

1. Add to `AutomationTriggerType` in `@luxgen/db` and GraphQL enum in `typeDefs.ts`
2. Emit from source: `emitAutomationEvent({ tenantId, triggerType, payload })` in `events.ts`
3. Bridge matches enabled automations and runs actions
4. Increment usage via `usageService` (Phase 10 limits)

---

## Adding an action

1. Extend action type enum + config shape in DB/GraphQL
2. Implement handler in `bridge.ts` `executeAction()`
3. Update automations UI labels if needed

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
