# Automation Flow Schema (Tower v1)

> **Package:** `@luxgen/automation-flow`  
> **Related:** [AGENT_STUDIO_ARCHITECTURE.md](./AGENT_STUDIO_ARCHITECTURE.md), `apps/web/pages/automations/tower/`

Tower automations use a **versioned flow document** instead of ad-hoc UI state. Triggers, conditions, actions, and waits are **compounds** registered in a single catalog — similar to Shopify Flow.

---

## Document shape (`TowerFlowDocument`)

```json
{
  "version": 1,
  "meta": {
    "name": "Order created",
    "enabled": false,
    "description": "Optional summary"
  },
  "entryNodeId": "t_abc123",
  "nodes": [
    {
      "id": "t_abc123",
      "kind": "trigger",
      "compoundId": "commerce.order.created",
      "title": "Order created",
      "config": { "orderSource": "any" }
    }
  ],
  "edges": []
}
```

| Field         | Purpose                                                           |
| ------------- | ----------------------------------------------------------------- |
| `version`     | Schema version (`1` only for now)                                 |
| `meta`        | Tower name, enabled flag, description                             |
| `entryNodeId` | Must point to the single `trigger` node                           |
| `nodes`       | Trigger, condition, action, wait steps                            |
| `edges`       | Directed graph; `label: "true" \| "false"` for condition branches |

Persisted on Mongo `Automation.flowDefinition`. Legacy flat fields (`triggerType`, `actions[]`) are derived via `flowToLegacyAutomation()` for the existing bridge.

---

## Graph editing (Phase 1+)

Tower flows are edited as a **directed graph**, not only a linear list.

| Edge label          | Used when `from` node is |
| ------------------- | ------------------------ |
| omitted / `default` | trigger, action, wait    |
| `true` / `false`    | condition                |

Graph helpers: `@luxgen/automation-flow` (`graph.ts`). Full builder guide: [TOWER_BUILDER.md](./TOWER_BUILDER.md).

### Example — condition branch

```json
"edges": [
  { "from": "t_1", "to": "c_1" },
  { "from": "c_1", "to": "a_yes", "label": "true" },
  { "from": "c_1", "to": "a_no", "label": "false" }
]
```

### Phase 1 API (summary)

| Function                                 | Purpose                       |
| ---------------------------------------- | ----------------------------- |
| `connectFlowEdge` / `disconnectFlowEdge` | Manual link / unlink          |
| `insertFlowNodeAfter`                    | Splice new step on a port     |
| `moveFlowNode` / `removeFlowNode`        | Reposition or delete steps    |
| `flowToGraphSteps`                       | Tree with condition branches  |
| `collectTowerFlowGraphWarnings`          | Unreachable nodes, open ports |

---

## Compound IDs

Namespaced dot notation: `{domain}.{entity}.{event}`.

### Commerce triggers

| Compound ID              | Legacy trigger  |
| ------------------------ | --------------- |
| `commerce.order.created` | `ORDER_CREATED` |
| `commerce.order.drafted` | `ORDER_DRAFTED` |
| `commerce.payment.sent`  | `PAYMENT_SENT`  |
| `commerce.order.updated` | `ORDER_UPDATED` |

### Commerce actions

| Compound ID                    | Legacy action         |
| ------------------------------ | --------------------- |
| `commerce.order.update_fields` | `UPDATE_ORDER_FIELDS` |

Full catalog: `packages/automation-flow/src/catalog/compounds.ts`

---

## Adding a compound

1. Add entry to `catalog/compounds.ts` with `id`, `kind`, `label`, `configFields`, optional legacy enum mapping
2. If new legacy enum: extend `packages/db/src/automation.ts` + GraphQL `typeDefs.ts`
3. Emit event from source → `emitAutomationEvent({ triggerType })`
4. Implement handler in `packages/agent/src/automation/bridge.ts`

Validation: `validateTowerFlowDocument(raw)` before save.

GraphQL: `automationSchema` query returns `exportAutomationSchema()` for the tower builder.
