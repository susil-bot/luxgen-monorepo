# Search gaps — `T-E0-02`

> Source: `docs/TODO-search.md` (sections from overview L1–50 + section index)  
> Audited against: `apps/web`, `packages/ui`, `packages/presenters/search`, `apps/api`  
> Date: 2026-08-03  
> Product code changed: **none**

Status: `wired` = works end-to-end · `partial` = some pieces · `missing` = not built

---

## Summary

| Status | Count |
| --- | ---: |
| wired | 1 |
| partial | 3 |
| missing | 10 |

**Bottom line:** Nav search opens a global overlay shell (⌘K). `/search` page still returns **courses + users** via GraphQL presenter. No live multi-type cards in overlay, command palette commands, AI search, saved/recent/pinned, or analytics yet.

---

## Section → codebase

| # | TODO section | Status | Existing | Gap |
| ---: | --- | --- | --- | --- |
| 1 | Search System Overview (unified discovery) | partial | Nav bar search + `/search` page | Not unified; no overlay modalities; only courses+users |
| 2 | Global Search — header bar | partial | `NavBar` + `SearchBar`; `useAppLayoutHeader().onSearch` / `onSearchFocus` | Placeholder “Search anything…” + ⌘K/Ctrl+K badge; focus/submit opens overlay |
| 2a | Global Search — overlay (filters + results) | partial | `GlobalSearchOverlay` + `GlobalSearchHost` (Cmd/Ctrl+K, Esc) | Shell only — filter sidebar + empty results; live cards = `T-SRCH-02` |
| 2b | Result: Course | wired | `useSearchPresenter` + `GET_SEARCH_COURSES` → `/search` list links | Cards lack enrollment/completion metadata from TODO |
| 2c | Result: Learner/User | partial | `GET_SEARCH_USERS` on `/search` | Shown as plain text (no profile actions); TODO “Learner” semantics incomplete |
| 2d | Result: Workflow | missing | — | No automation search query/UI |
| 2e | Result: Order | missing | — | List pages have local filter only |
| 2f | Result: Product | missing | — | `/products` local `search` query param only |
| 2g | Result: Settings | missing | — | — |
| 2h | Result: Content | missing | — | — |
| 3 | Command Palette | missing | — | No Cmd/Ctrl+K handler; no create/nav command registry |
| 4 | AI Search | missing | — | No NL/conversational search |
| 5 | Saved Searches | missing | — | No persist API or UI |
| 6 | Advanced Search / Filters | missing | — | Domain list pages have FilterBar; not global advanced search |
| 7 | Recent Searches | missing | — | — |
| 8 | Pinned Searches | missing | — | — |
| 9 | Search Analytics | missing | — | — |
| 10 | Search Settings | missing | — | — |
| 11 | Mobile Search Experience | missing | — | Not audited in `apps/mobile` this pass; web has no mobile-specific search UX |
| 12 | Search Performance (&lt;200ms) | partial | `cache-first` Apollo on `/search` | Fetches **all** courses/users then client-filters — will not scale; `/api/search` returns empty hits + redirect only |
| 13 | Search Accessibility | missing | Basic page semantics only | No overlay focus trap / aria for palette |
| 14 | Search Error Handling | partial | Empty + loading on `/search` | No dedicated error state if GraphQL fails |

---

## Key files

| Layer | Path | Role |
| --- | --- | --- |
| Page | `apps/web/pages/search.tsx` | Global results page |
| Header wiring | `apps/web/lib/app-layout-header.ts` | `onSearch` → in-page `?search=` or `/search?q=` |
| REST stub | `apps/web/pages/api/search.ts` | Empty hits; redirect hint only (UI-159) |
| Presenter | `packages/presenters/search/client.entry.ts` | `useSearchPresenter` |
| Queries | `packages/presenters/search/queries.ts` | `courses` + `users` by `tenantId` |
| UI | `packages/ui/src/GlobalSearch/GlobalSearchOverlay.tsx` | Overlay shell (filters + results panel) |
| Host | `apps/web/lib/global-search.tsx` | Cmd/Ctrl+K + open event |
| UI | `packages/ui/src/NavBar/NavBar.tsx` | Renders SearchBar |
| Checklist | `docs/PAGE_FUNCTIONALITY_CHECKLIST.md` | `/search` listed; unchecked |
| Nav | `DefaultNavigation.tsx` | **No** dedicated Search nav item |

**API GraphQL:** no dedicated `search(...)` root field. Search reuses `courses(tenantId)` and `users(tenantId)` then client-side `filterByQuery`.

**Contextual (in-list) search — out of global TODO but present:** products, orders, users, groups, roles, billing, customers, automations tower — all local FilterBar/`search` state.

---

## Recommended enqueue order (maps to backlog)

| Priority | Task | Why |
| --- | --- | --- |
| P0 | `T-SRCH-01` | Overlay + ⌘K — largest UX gap vs TODO |
| P0 | `T-SRCH-02` | Richer course/learner cards (already partial data path) |
| P1 | `T-MAP-06` | Nav entry for `/search` |
| P1 | `T-SRCH-03` | Command palette subset |
| P1 | `T-SRCH-06` | Recent searches (cheap, localStorage OK) |
| P2 | `T-SRCH-04` / `05` / `09` / `10` | Saved, advanced filters, a11y, error states |
| P3 | `T-SRCH-07` | AI search — keep split/`wont` until P0/P1 land |

---

## Acceptance check (`T-E0-02`)

- [x] Audit lists each Search section vs route/component/API  
- [x] Marks wired / partial / missing  
- [x] No product code changes  
