# TODO Specs — Full Coverage Plan

> **Purpose:** Prove every section of every `docs/TODO*.md` is owned by a queue task, deferred with reason, or absorbed into another task.  
> **Queue:** [`queue.yaml`](./queue.yaml) · **Backlog:** [`../TODO_ORCHESTRATOR_BACKLOG.md`](../TODO_ORCHESTRATOR_BACKLOG.md)  
> **Updated:** 2026-08-03 · Docs on `main`: all five TODO specs + this orchestrator pack

---

## 1. Source inventory (all on `main`)

| Spec | File | Lines | Sections | Epic | Audit |
| --- | --- | ---: | ---: | --- | --- |
| Commerce | `TODO-Commerce Experience.md` | 1366 | 10 | E3 | `T-E0-04` (next) |
| Automation | `TODO-Enterprise Product Specification: Workflow Automation Builder.md` | 3426 | 30 | E2 | [`audits/automation-gaps.md`](./audits/automation-gaps.md) ✅ |
| Role / Enterprise | `TODO-role.md` | 2180 | 16 modules | E5 | `T-E0-06` (next) |
| Search | `TODO-search.md` | 1100 | 14 | E1 | [`audits/search-gaps.md`](./audits/search-gaps.md) ✅ |
| Sitemap | `TODO-sitemap.md` | 1266 | 8 L1 modules | E4 | `T-E0-05` |
| Orchestrator | `TODO_ORCHESTRATOR_BACKLOG.md` | — | meta | E0 | this plan |

`T-E0-01` = **done** (PR #453/#454 merged — commerce + role non-empty).

---

## 2. Priority waves (execution order)

| Wave | When | Epics | Goal |
| ---: | --- | --- | --- |
| **W0** | Now | E0 | Finish remaining audits (`T-E0-04`, `T-E0-05`, `T-E0-06`) |
| **W1** | After W0 audits for that domain | E1 Search P0 + E2 Auto P0 | ⌘K overlay + courses/learners; model/GraphQL/builder publish |
| **W2** | Parallel with W1 once commerce audit done | E3 Commerce P0 | Products, Orders, Customers full CRUD chain |
| **W3** | After W0 sitemap + role audits | E4 P1 + E5 P1 | Nav/route gaps; org dashboard/users/security |
| **W4** | After P0/P1 green | P2 polish | Saved/recent search, coupons/bundles, analytics, brand/theme |
| **W5** | Explicit split first | P3 / `wont`/`L` | AI search, SSO/SCIM, realtime subs, mobile sitemap |

**Rule:** never enqueue `sla: L` or `status: wont` until split into `S`/`M` child tasks.

---

## 3. Coverage matrix by spec

### 3.1 Commerce (`TODO-Commerce Experience.md`) — **10/10 owned**

| § | Section | Lines | Task | Pri |
| ---: | --- | --- | --- | --- |
| 1 | Overview | 2–20 | absorbed by `T-E0-04` audit | P0 |
| 2 | Products | 21–417 | `T-COM-01` | P0 |
| 3 | Bundles | 418–516 | `T-COM-04` | P1 |
| 4 | Orders | 517–653 | `T-COM-02` | P0 |
| 5 | Customers | 654–827 | `T-COM-03` | P0 |
| 6 | Coupons | 828–944 | `T-COM-05` | P1 |
| 7 | Payments & Subscriptions | 945–1075 | `T-COM-06` | P1 |
| 8 | Revenue Analytics | 1076–1154 | `T-COM-07` | P2 |
| 9 | Conversion Funnels | 1155–1235 | `T-COM-08` | P2 |
| 10 | Upsells & Cross-sells | 1236–1367 | `T-COM-09` | P2 |

### 3.2 Search (`TODO-search.md`) — **14/14 owned**

| § | Section | Task | Pri | Notes |
| ---: | --- | --- | --- | --- |
| 1 | Overview | `T-E0-02` ✅ | P0 | |
| 2 | Global Search + overlay | `T-SRCH-01` | P0 | |
| 2b | Course / Learner results | `T-SRCH-02` | P0 | |
| 2c | Workflow/Order/Product/Settings/Content results | `T-SRCH-02` follow-ups → split after P0 as `T-SRCH-02b` if needed | P1 | Audit: missing today |
| 3 | Command Palette | `T-SRCH-03` | P1 | |
| 4 | AI Search | `T-SRCH-07` | P3 | `wont` until split |
| 5 | Saved Searches | `T-SRCH-04` | P1 | |
| 6 | Advanced Filters | `T-SRCH-05` | P2 | |
| 7 | Recent Searches | `T-SRCH-06` | P2 | |
| 8 | Pinned Searches | **`T-SRCH-11`** (added) | P2 | Was gap — now owned |
| 9 | Search Analytics | `T-SRCH-08` | P2 | |
| 10 | Search Settings | **`T-SRCH-12`** (added) | P2 | Was gap — now owned |
| 11 | Mobile Search | `T-SRCH-13` | P3 | `wont` / mobile epic |
| 12 | Performance | absorbed by `T-SRCH-02` (server filter, not fetch-all) | P1 | AC on `T-SRCH-02` |
| 13 | Accessibility | `T-SRCH-09` | P2 | |
| 14 | Error Handling | `T-SRCH-10` | P2 | |
| — | Nav `/search` | `T-MAP-06` | P2 | |

### 3.3 Automation builder — **30/30 owned** (build vs absorb)

| § | Section | Ownership | Pri |
| ---: | --- | --- | --- |
| 1–5 | Overview / metadata / purpose / entry / exit | `T-E0-03` ✅ + route notes in audit | — |
| 6–8 | Stories / actions / IA | absorb into `T-AUTO-03` AC | P0 |
| 9–10 | Wireframe / components | `T-AUTO-03` | P0 |
| 11 | Data Model | `T-AUTO-01` | P0 |
| 12 | GraphQL Mapping | `T-AUTO-02` (+ publish/pause/test/archive as below) | P0 |
| 12 publish/pause/archive/dupe | `T-AUTO-04` | P0 |
| 12 runs query | `T-AUTO-05` | P1 |
| 12 testWorkflow | `T-AUTO-06` | P1 |
| 12 subscriptions | `T-AUTO-09` | P2 | `wont` until split |
| 13 | Business Rules | `T-AUTO-07` | P1 |
| 14 | Validation Rules | absorb into `T-AUTO-07` | P1 |
| 15–18 | States / filters / tables / forms | absorb into `T-AUTO-03` + list UI | P1 |
| 19–20 | Notifications / activity timeline | **`T-AUTO-11`** (added) | P2 |
| 21 | Permissions | `T-AUTO-10` | P2 |
| 22 | Automation Hooks | absorb into bridge skill + `T-COM-09` / catalog | P1 |
| 23 | AI Opportunities | **`T-AUTO-12`** (added) | P3 | `wont` until split |
| 24 | Analytics | `T-AUTO-08` | P2 |
| 25 | Mobile | absorb into `T-MAP-07` | P3 |
| 26 | Accessibility | **`T-AUTO-13`** (added) | P2 |
| 27–28 | Performance / design system | absorb into ios-design + existing builder | P2 |
| 29–30 | Edge cases / blueprint | absorb into `T-AUTO-07` + Reviewer AC | P1 |

### 3.4 Sitemap (`TODO-sitemap.md`) — **8/8 L1 owned**

| L1 module | Lines (approx) | Owner task | Notes |
| --- | --- | --- | --- |
| Dashboard | 5–11 | **`T-MAP-08`** (added) | Verify widgets vs live dashboard |
| Learning | 12–110 | `T-MAP-01` | |
| Commerce | 111–218 | E3 tasks + `T-E0-04` | Don’t rebuild; close nav gaps only |
| Automation (+ AI under tree) | 219–388 | `T-MAP-02` + E2 | |
| Analytics | 389–487 | `T-MAP-03` | |
| Marketplace | 488–675 | `T-MAP-04` | |
| Settings / content / support | 676–1029 | `T-MAP-05` | `wont` until split post-audit |
| Search | 1030–1042 | `T-MAP-06` | |
| Mobile leaf | 1043+ | `T-MAP-07` | P3 |

### 3.5 Role / Enterprise (`TODO-role.md`) — **16/16 modules owned**

| Module | Task | Pri |
| --- | --- | --- |
| 1.1 Org Dashboard | `T-ROLE-01` | P1 |
| 1.2 Org Profile | `T-ROLE-02` | P1 |
| 2.1–2.3 Tenants | `T-ROLE-03` | P1 |
| 3.1–3.3 Brand / Theme / Domain | `T-ROLE-05` | P2 |
| 4.1–4.3 Users / Invite / Roles | `T-ROLE-04` | P1 |
| 5.1–5.3 Security / Login / MFA | `T-ROLE-06` | P1 |
| 6.1 SSO | `T-ROLE-07` | P2 | split API→UI |
| 7.1 SCIM | `T-ROLE-08` | P2 | split API→UI |
| IA §1 | `T-E0-06` audit | P1 |

---

## 4. Immediate next 10 (token-cheap order)

1. `T-E0-04` — Commerce audit  
2. `T-E0-05` — Sitemap audit  
3. `T-E0-06` — Role audit  
4. `T-AUTO-01` — Model map §11  
5. `T-SRCH-01` — ⌘K overlay shell  
6. `T-SRCH-02` — Course/learner cards  
7. `T-COM-01` — Products persist (after commerce audit)  
8. `T-COM-02` — Orders  
9. `T-COM-03` — Customers  
10. `T-AUTO-02` — One GraphQL gap family  

Then: `T-AUTO-03/04`, `T-ROLE-01/02/04/06`, `T-MAP-01/02/08`.

---

## 5. Definition of “covered”

A TODO section is **covered** when:

1. It appears in this matrix with a task id or explicit absorb target, **and**
2. That task is `todo`/`doing`/`done`/`wont` (never silently omitted), **and**
3. For build tasks: AC references the source line range.

**Not covered** = section exists in a TODO file but has no row here → fix the matrix before enqueueing features.

---

## 6. Status after this plan refresh

| Item | Action |
| --- | --- |
| `T-E0-01` | → `done` (docs on main) |
| Commerce/role blocked tasks | → `todo` where only dep was `T-E0-01` (still wait on their audits) |
| New tasks | `T-SRCH-11`, `T-SRCH-12`, `T-SRCH-13`, `T-AUTO-11`, `T-AUTO-12`, `T-AUTO-13`, `T-MAP-08` |
| Audits still open | `T-E0-04`, `T-E0-05`, `T-E0-06` |
