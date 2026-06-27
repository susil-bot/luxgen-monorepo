# Tower Builder — Graph UI & MCP

> **Package:** `@luxgen/automation-flow`  
> **UI:** `apps/web/pages/automations/tower/`  
> **MCP:** `packages/mcp-core/`  
> **Schema:** [AUTOMATION_FLOW_SCHEMA.md](./AUTOMATION_FLOW_SCHEMA.md)

Shopify Flow–style automation editor: triggers, conditions, actions, and waits as a **directed graph** (`nodes` + `edges`), persisted on `Automation.flowDefinition`.

---

## Roadmap

| Phase | Capability                                                                                   | Status                                                                |
| ----- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **1** | Graph mutation API (`connect`, `disconnect`, `insert`, `move`, `flowToGraphSteps`, warnings) | Shipped — [#80](https://github.com/susil-bot/luxgen-monorepo/pull/80) |
| **2** | Clickable `+` on connectors → compound picker                                                | Shipped — this PR                                                     |
| **3** | Drag reorder on canvas / step rail                                                           | Shipped — this PR                                                     |
| **4** | Link / unlink UI in config panel                                                             | Shipped — this PR                                                     |
| **5** | MCP granular tools (`tower_insert_step`, etc.)                                               | Shipped — this PR                                                     |
| **6** | Graph execution in automation bridge                                                         | Shipped — this PR                                                     |

---

## Data model

See [AUTOMATION_FLOW_SCHEMA.md](./AUTOMATION_FLOW_SCHEMA.md).

| Concept        | Rule                                                                |
| -------------- | ------------------------------------------------------------------- |
| Trigger        | Exactly one; `entryNodeId` must point to it                         |
| Default edge   | Omitted label or `label: "default"` — used by trigger, action, wait |
| Condition edge | `label: "true"` or `"false"` only                                   |
| Persistence    | `Automation.flowDefinition` JSON on Mongo                           |
| Legacy bridge  | `flowToLegacyAutomation()` derives flat `triggerType` + `actions[]` |

---

## Phase 1 — Graph API

All functions live in `packages/automation-flow/src/graph.ts` and are re-exported from `@luxgen/automation-flow` and `apps/web/lib/automation-flow.ts`.

| Function                                                             | Purpose                                          |
| -------------------------------------------------------------------- | ------------------------------------------------ |
| `normalizeEdgeLabel(label?)`                                         | Treat missing and `default` as the same port     |
| `getNode(flow, id)`                                                  | Lookup node by id                                |
| `listOutgoingEdges(flow, nodeId)`                                    | All edges from a node                            |
| `listIncomingEdges(flow, nodeId)`                                    | All edges to a node                              |
| `getOutgoingEdge(flow, from, label?)`                                | Single edge on a port                            |
| `connectFlowEdge(flow, from, to, label?)`                            | Add or replace edge on a port                    |
| `disconnectFlowEdge(flow, from, to?, label?)`                        | Remove matching edge(s)                          |
| `insertFlowNodeAfter(flow, afterId, kind, compoundId, branchLabel?)` | Splice: `after → new → oldNext`                  |
| `moveFlowNode(flow, nodeId, afterNodeId, branchLabel?)`              | Bypass + splice existing node                    |
| `removeFlowNode(flow, nodeId)`                                       | Bypass + delete node (not trigger)               |
| `spliceNodeAfter(flow, afterId, nodeId, branchLabel?)`               | Insert existing node after another               |
| `flowToGraphSteps(flow)`                                             | Tree for UI: `next` chain + condition `branches` |
| `collectTowerFlowGraphWarnings(flow)`                                | Non-fatal: unreachable nodes, open ports         |

### Legacy aliases (tower editor today)

| Legacy                | Canonical                        |
| --------------------- | -------------------------------- |
| `insertFlowStepAfter` | `insertFlowNodeAfter`            |
| `removeFlowStep`      | `removeFlowNode`                 |
| `moveFlowStep`        | `moveFlowNode` via ordered chain |

### Insert semantics (Shopify Flow `+`)

When the user clicks `+` between **A** and **B** on port **P**:

1. `disconnectFlowEdge(flow, A, B, P)` if edge exists
2. `connectFlowEdge(flow, A, newNode, P)`
3. `connectFlowEdge(flow, newNode, B)` on default port

Implemented by `insertFlowNodeAfter(flow, A, kind, compoundId, P)`.

### Condition branches

```json
"edges": [
  { "from": "t_1", "to": "c_1" },
  { "from": "c_1", "to": "a_yes", "label": "true" },
  { "from": "c_1", "to": "a_no", "label": "false" }
]
```

`flowToGraphSteps` returns condition nodes with:

```ts
{
  id: 'c_1',
  kind: 'condition',
  branches: [
    { label: 'true', steps: [...] },
    { label: 'false', steps: [...] },
  ],
}
```

---

## Phase 6 — Graph execution

| Function                                        | Purpose                                            |
| ----------------------------------------------- | -------------------------------------------------- |
| `planFlowExecution(flow, payload)`              | Walk graph; return ordered wait + action steps     |
| `planFlowExecutionFromDefinition(raw, payload)` | Parse `flowDefinition` then plan                   |
| `evaluateFlowCondition(node, payload)`          | Boolean for condition branch selection             |
| `flowActionNodeToLegacyAction(node)`            | Map action node → legacy `IAutomationAction` shape |
| `getPayloadValue(payload, path)`                | Dot-path field lookup for conditions               |

Wired in `packages/agent/src/automation/bridge.ts` — valid `flowDefinition` replaces flat `actions[]` iteration.

---

## Runtime

When `Automation.flowDefinition` is present and valid, the bridge walks the graph from `entryNodeId` via `planFlowExecution()` in `packages/automation-flow/src/runtime.ts`:

- **Trigger** — follow the default outgoing edge
- **Wait** — `sleep(seconds)` then continue
- **Condition** — evaluate against trigger payload; follow `true` or `false` branch
- **Action** — map compound → legacy action type and execute (same handlers as flat `actions[]`)

Invalid or missing `flowDefinition` falls back to flat `automation.actions[]`.

---

## MCP

### Today

Full-document tools in `packages/mcp-core`:

- `get_automation_schema`
- `validate_tower_flow`
- `create_automation`
- `update_automation_flow`

### Phase 5 (planned)

Granular tools mirroring the graph API:

| Tool                     | Maps to               |
| ------------------------ | --------------------- |
| `tower_insert_step`      | `insertFlowNodeAfter` |
| `tower_move_step`        | `moveFlowNode`        |
| `tower_connect_nodes`    | `connectFlowEdge`     |
| `tower_disconnect_nodes` | `disconnectFlowEdge`  |

Pattern: `get_automation` → apply mutation → `validateTowerFlowDocument` → `update_automation_flow`.

---

## Key paths

| Layer         | Path                                                |
| ------------- | --------------------------------------------------- |
| Types         | `packages/automation-flow/src/types.ts`             |
| Graph ops     | `packages/automation-flow/src/graph.ts`             |
| Runtime       | `packages/automation-flow/src/runtime.ts`           |
| Mutations     | `packages/automation-flow/src/mutations.ts`         |
| Validation    | `packages/automation-flow/src/validate.ts`          |
| Catalog       | `packages/automation-flow/src/catalog/compounds.ts` |
| Tower editor  | `apps/web/pages/automations/tower/[id].tsx`         |
| Web re-export | `apps/web/lib/automation-flow.ts`                   |
| MCP tools     | `packages/mcp-core/src/tools/`                      |
