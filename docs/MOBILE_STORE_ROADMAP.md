# LuxGen Mobile & Storefront Roadmap

> **Goal:** One monorepo — admin web, learner storefront, React Native Expo — shared GraphQL API.

---

## Phase 2a — Learner web storefront

**Branch:** `feat/learner-storefront`  
**PR:** _opening_

- [x] Catalog page `/learn` (published courses)
- [x] Course detail `/learn/courses/[id]`
- [x] Enroll via `enrollStudent` (auth required)
- [x] Public browse — API allows `tenant`, `courses`, `course` without JWT (published only)
- [x] iOS learner layout (`LearnLayout`) — no admin sidebar
- [x] `/learn` added to public auth routes

**Done when:** Browse without login; sign in → enroll → dashboard.

---

## Upcoming

| Phase                | Branch                        | Status                                                      |
| -------------------- | ----------------------------- | ----------------------------------------------------------- |
| 0 Design tokens      | `feat/design-tokens`          | [#38](https://github.com/susil-bot/luxgen-monorepo/pull/38) |
| 1 Expo shell         | `feat/mobile-foundation`      | [#39](https://github.com/susil-bot/luxgen-monorepo/pull/39) |
| Dev role stacks      | `chore/dev-role-stacks`       | [#40](https://github.com/susil-bot/luxgen-monorepo/pull/40) |
| 2b Mobile screens    | `feat/mobile-learner-screens` | Not started                                                 |
| 3 Polish / App Store | per feature                   | Not started                                                 |

**Local dev (web learner):** `make dev-stack-web` → http://demo.localhost:3000/learn
