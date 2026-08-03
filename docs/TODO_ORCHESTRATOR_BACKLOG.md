# TODO Specs → Orchestrator Backlog (PM)

> **Owner:** PM / orchestrator queue  
> **Sources:** every `docs/TODO*.md`  
> **Runtime:** Developer → Reviewer → PM Tester (`docs/AGENT_ORCHESTRATOR.md`)  
> **Token rule:** agents load **one task card** + **source line slice** only — see [`todo-orchestrator/AGENT_TASK_CARD.md`](./todo-orchestrator/AGENT_TASK_CARD.md)  
> **Machine queue:** [`todo-orchestrator/queue.yaml`](./todo-orchestrator/queue.yaml) / [`todo-orchestrator/queue.json`](./todo-orchestrator/queue.json)

---

## 0. Operating model (24×7, min tokens)

| Rule | Why |
| --- | --- |
| One atomic task per headless job | Keeps `MAX_ORCHESTRATOR_ITERATIONS=3` enough |
| Never paste full TODO into the prompt | Specs are 1k–3k lines; slice by `Lstart-Lend` |
| Audit → Gap-fix → Feature | Cheap discovery before expensive builds |
| Separate `feat/` and `fix/` PRs | Repo PR policy |
| Mark `done` in `queue.yaml` on merge | Next agent picks next `todo` by priority |
| Skip `blocked` | Do not burn tokens waiting |

**Pick next task:** lowest `priority` number among `status: todo` with all `deps` `done`.

**Labels on every PR:** `help wanted` + `feat|fix|chore` + area (`web`/`api`/`graphql`/`ui`/`agent`/…).

---

## 1. Source inventory

| ID | File | Lines (approx) | Epic | Doc status |
| --- | ---: | ---: | --- | --- |
| SRC-SITEMAP | `docs/TODO-sitemap.md` | 1266 | Platform IA / routes | Ready on `main` |
| SRC-SEARCH | `docs/TODO-search.md` | 1100 | Search | Ready on `main` |
| SRC-AUTO | `docs/TODO-Enterprise Product Specification: Workflow Automation Builder.md` | 3426 | Automation builder | Ready on `main` |
| SRC-COMMERCE | `docs/TODO-Commerce Experience.md` | 1366 | Commerce | Ready on `main` (#453/#454) |
| SRC-ROLE | `docs/TODO-role.md` | 2180 | Enterprise / org admin | Ready on `main` (#453/#454) |

**Full section→task matrix:** [`todo-orchestrator/COVERAGE_PLAN.md`](./todo-orchestrator/COVERAGE_PLAN.md)

---

## 2. Priority & SLA legend

| P | Meaning | Default SLA |
| --- | --- | --- |
| **P0** | Revenue / core daily UX / already half-built | `S`–`M` |
| **P1** | Enterprise readiness / IA completeness | `M` |
| **P2** | Differentiation / polish | `M`–`L` (split) |
| **P3** | Nice-to-have / speculative | Defer |

| SLA | Wall / agent budget |
| --- | --- |
| `S` | 1 orchestrated run |
| `M` | ≤2 runs, 1 feature PR |
| `L` | Must split into ≥2 tasks before enqueue |

---

## 3. Epic checklist (rollup)

- [~] **E0** Bootstrap — audits + queue hygiene (`T-E0-01/02/03` done; `04–06` open)
- [ ] **E1** Search (`SRC-SEARCH`) — P0
- [ ] **E2** Automation builder deepen (`SRC-AUTO`) — P0
- [ ] **E3** Commerce experience (`SRC-COMMERCE`) — P0
- [ ] **E4** Sitemap gap close (`SRC-SITEMAP`) — P1
- [ ] **E5** Enterprise role / org admin (`SRC-ROLE`) — P1

---

## 4. Task checklist

Status key: `[ ]` todo · `[~]` doing/review · `[x]` done · `[!]` blocked · `[-]` wont

### E0 — Bootstrap (do first)

| ID | Pri | SLA | Task | AC (summary) |
| --- | --- | --- | --- | --- |
| [x] `T-E0-01` | P0 | S | Merge/ensure commerce+role TODO docs on `main` (#453) | Done — files on `main` |
| [x] `T-E0-02` | P0 | S | Audit Search: map TODO sections → existing routes/components | → `docs/todo-orchestrator/audits/search-gaps.md` |
| [x] `T-E0-03` | P0 | S | Audit Automation builder: TODO vs `/automations` + GraphQL | → `docs/todo-orchestrator/audits/automation-gaps.md` |
| [x] `T-E0-04` | P0 | S | Audit Commerce: TODO vs `/products` `/orders` `/admin/customers` | → `docs/todo-orchestrator/audits/commerce-gaps.md` |
| [ ] `T-E0-05` | P1 | S | Audit Sitemap L1/L2 vs `DefaultNavigation.tsx` + pages | Missing routes table |
| [ ] `T-E0-06` | P1 | S | Audit Role modules vs `/organization/*` settings | Gap list for IAM/SSO/SCIM |

**Acceptance (all E0):** output is a **diff to docs or checklist only** (or tiny inventory markdown under `docs/todo-orchestrator/audits/`). No product code unless a one-line fix is required to document truth.

---

### E1 — Search (`docs/TODO-search.md`)

| ID | Pri | SLA | Source slice | Task | Skill |
| --- | --- | --- | --- | --- | --- |
| [ ] `T-SRCH-01` | P0 | M | L25–L256 | Global search overlay: open via header + ⌘K/Ctrl+K; filters + result list shell | `ios-design` + `fullstack-developer` |
| [ ] `T-SRCH-02` | P0 | M | L187–L256 | Result cards for Courses + Learners (live GraphQL or existing queries) | `graphql` |
| [ ] `T-SRCH-03` | P1 | M | L258–L425 | Command palette: create/nav commands (subset: create course, go dashboard, go orders) | `ios-design` |
| [ ] `T-SRCH-04` | P1 | M | L569–L660 | Saved searches: persist per-user (localStorage MVP OK if API absent; document follow-up) | `fullstack-developer` |
| [ ] `T-SRCH-05` | P2 | M | L661–L787 | Advanced filters panel for one domain (courses) | `persona-pages` |
| [ ] `T-SRCH-06` | P2 | S | L788–L866 | Recent searches list + clear | `ios-design` |
| [ ] `T-SRCH-07` | P3 | L | L427–L568 | AI conversational search | **split later** — do not enqueue as one job |
| [ ] `T-SRCH-08` | P2 | M | L867–L973 | Search analytics admin page stub + event logging hook | `persona-pages` |
| [ ] `T-SRCH-09` | P2 | S | L1021–L1069 | A11y: focus trap, aria, keyboard nav for overlay | `ios-design` |
| [ ] `T-SRCH-10` | P2 | S | L1070–L1100 | Error/empty/loading states for search | `ios-design` |

**Epic AC:** From logged-in admin, ⌘K opens search; typing returns ≥1 live course and ≥1 learner (or explicit empty with reason); Esc closes; no fabricated users.

---

### E2 — Automation builder (`docs/TODO-Enterprise Product Specification: Workflow Automation Builder.md`)

| ID | Pri | SLA | Source slice | Task | Skill |
| --- | --- | --- | --- | --- | --- |
| [x] `T-AUTO-01` | P0 | M | Align automation data model with flowDefinition + TODO §11 | → `audits/automation-model-map.md` + #457 |
| [x] `T-AUTO-02` | P0 | M | Close one GraphQL mutation family from TODO §12 | `duplicateAutomation` |
| [ ] `T-AUTO-03` | P0 | M | L276–L431 | Builder canvas: add/edit/delete step UI wired to live mutations | `automation` + `ios-design` |
| [ ] `T-AUTO-04` | P0 | M | L819–L884 | Publish / pause / archive actions + status UI | `automation` |
| [ ] `T-AUTO-05` | P1 | M | L716–L751 | Run history list + detail drawer | `automation` |
| [ ] `T-AUTO-06` | P1 | M | L846–L864 | Test-run with sample payload | `automation` |
| [ ] `T-AUTO-07` | P1 | M | L942–L1054 | Enforce must-have business rules (tenant scope, required trigger, no empty publish) | `automation` |
| [ ] `T-AUTO-08` | P2 | M | L2083–L2172 | Workflow analytics page (success rate, run volume) | `persona-pages` |
| [ ] `T-AUTO-09` | P2 | L | L886–L940 | Real-time subscriptions for runs | **split** — schema then UI |
| [ ] `T-AUTO-10` | P2 | M | L1647–L1748 | Permission gates on edit/publish | `billing`/`automation` |

**Epic AC:** Create → add email step → publish → trigger once → run appears in history; tenant-scoped; plan gate respected if premium.

---

### E3 — Commerce (`docs/TODO-Commerce Experience.md`) — after `T-E0-01`

| ID | Pri | SLA | Source slice | Task | Skill |
| --- | --- | --- | --- | --- | --- |
| [ ] `T-COM-01` | P0 | M | L21–L417 | Products list + create/edit: persist all editable fields (no disabled fakes) | `fullstack-developer` |
| [ ] `T-COM-02` | P0 | M | L517–L653 | Orders list/detail: status filters + live order fields | `fullstack-developer` |
| [ ] `T-COM-03` | P0 | M | L654–L827 | Customers list/detail/edit aligned to commerce TODO | `persona-pages` |
| [ ] `T-COM-04` | P1 | M | L418–L516 | Bundles CRUD vertical | `fullstack-developer` |
| [ ] `T-COM-05` | P1 | M | L828–L944 | Coupons CRUD vertical | `fullstack-developer` |
| [ ] `T-COM-06` | P1 | M | L945–L1075 | Payments & subscriptions status surfaces | `billing` |
| [ ] `T-COM-07` | P2 | M | L1076–L1154 | Revenue analytics widgets (live or clearly gated) | `persona-pages` |
| [ ] `T-COM-08` | P2 | M | L1155–L1235 | Conversion funnels view | `persona-pages` |
| [ ] `T-COM-09` | P2 | M | L1236–L1367 | Upsell/cross-sell config + automation hook docs | `automation` + `fullstack-developer` |

**Epic AC:** Product create → appears in list → edit persists → order for that product visible; customer linked; no `readOnly` on fields that should save.

---

### E4 — Sitemap gap close (`docs/TODO-sitemap.md`)

Work **only** missing/partial routes from `T-E0-05`. Do not rebuild working pages.

| ID | Pri | SLA | Source slice | Task |
| --- | --- | --- | --- | --- |
| [ ] `T-MAP-01` | P1 | M | L12–L110 | Learning: close highest-traffic gaps (lessons/quizzes/certs) one vertical at a time |
| [ ] `T-MAP-02` | P1 | M | L219–L388 | Automation/AI sitemap items not yet in nav — add nav + stub or wire |
| [ ] `T-MAP-03` | P1 | M | L389–L487 | Analytics subdomain pages missing from nav/pages |
| [ ] `T-MAP-04` | P2 | M | L488–L675 | Marketplace IA gaps |
| [ ] `T-MAP-05` | P2 | M | L676–L1029 | Settings / content / support gaps (split heavily) |
| [ ] `T-MAP-06` | P2 | S | L1030–L1042 | Search route present in nav + page |
| [ ] `T-MAP-07` | P3 | L | L1043–L1266 | Mobile adaptations — separate mobile epic later |

**Epic AC:** Every P0/P1 sitemap L2 either has a real page **or** an explicit `wont`/`deferred` note in `PAGE_FUNCTIONALITY_CHECKLIST.md`.

---

### E5 — Enterprise role (`docs/TODO-role.md`) — after `T-E0-01`

| ID | Pri | SLA | Source slice | Task | Skill |
| --- | --- | --- | --- | --- | --- |
| [ ] `T-ROLE-01` | P1 | M | L272–L336 | Organization dashboard KPIs live | `persona-pages` |
| [ ] `T-ROLE-02` | P1 | M | L337–L427 | Organization profile edit persist | `fullstack-developer` |
| [ ] `T-ROLE-03` | P1 | M | L428–L628 | Tenant list + create wizard (superadmin paths) | `fullstack-developer` |
| [ ] `T-ROLE-04` | P1 | M | L886–L1195 | Users + invite + roles/permission matrix (incremental) | `fullstack-developer` |
| [ ] `T-ROLE-05` | P2 | M | L629–L885 | Brand / theme / custom domain | `ios-design` |
| [ ] `T-ROLE-06` | P1 | M | L1196–L1530 | Security dashboard + login history + MFA settings | `fullstack-developer` |
| [ ] `T-ROLE-07` | P2 | L | L1531–L1676 | SSO configuration | split: API then UI |
| [ ] `T-ROLE-08` | P2 | L | L1677–L2035 | SCIM configuration | split: API then UI |

**Epic AC:** Org admin can open org dashboard, edit profile, invite user, view security events; tenant isolation verified; no demo user fallbacks.

---

## 5. Global acceptance criteria (every task)

PM Tester must verify:

1. **AC-SCOPE** — Diff matches task title; no drive-by refactors.
2. **AC-CHAIN** — If UI changed, GraphQL + service + persistence exist (or task explicitly UI-only).
3. **AC-TENANT** — Queries/mutations scoped by tenant.
4. **AC-AUTH** — Guest = Login/Sign Up; no fabricated users (`.cursor/rules/auth-session.mdc`).
5. **AC-DESIGN** — iOS tokens only; no raw hex / `bg-gray-*`.
6. **AC-PR** — Correct branch prefix + labels; feat/fix not mixed.
7. **AC-SOURCE** — Behavior traceable to cited TODO line range (or intentional deviation noted in PR body).

---

## 6. Regressive 24×7 loop

```text
while queue has status=todo:
  pick highest priority (P0→P3), deps all done
  render AGENT_TASK_CARD prompt
  enqueue headless orchestrated job
  on pending_review → human merge (or AGENT_AUTO_MERGE if enabled)
  mark done in queue.yaml + check box here
  if CHANGES_REQUESTED / failed → fix or split task; do not silently expand scope
```

**Token hygiene:** if a job fails iteration limit, **split the task** in `queue.yaml` rather than raising `MAX_ORCHESTRATOR_ITERATIONS`.

---

## 7. Related docs

| Doc | Role |
| --- | --- |
| [`todo-orchestrator/queue.yaml`](./todo-orchestrator/queue.yaml) | Machine status / order |
| [`todo-orchestrator/AGENT_TASK_CARD.md`](./todo-orchestrator/AGENT_TASK_CARD.md) | Prompt contract |
| [`AGENT_ORCHESTRATOR.md`](./AGENT_ORCHESTRATOR.md) | Runtime loop |
| [`PAGE_FUNCTIONALITY_CHECKLIST.md`](./PAGE_FUNCTIONALITY_CHECKLIST.md) | Route QA checkboxes |
| [`FEATURE_CATALOG.md`](./FEATURE_CATALOG.md) | Shipped feature map |
