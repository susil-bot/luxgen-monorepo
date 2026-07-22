# LuxGen Mobile & Storefront Roadmap

> **Owner:** LuxGen platform team  
> **Started:** 2026-06-20  
> **Goal:** One monorepo — admin web, learner storefront, React Native Expo — sharing GraphQL API and iOS design tokens.

Related docs: [GRAPHQL_PLATFORM.md](./GRAPHQL_PLATFORM.md) · [technical/planning/infra-validation-and-expo-feasibility.md](./technical/planning/infra-validation-and-expo-feasibility.md) · `skills/ios-design/SKILL.md`

---

## Architecture target

```
apps/web          → Admin + commerce ops (existing)
apps/store        → Learner web storefront (Phase 2a)
apps/mobile       → Expo learner app (Phase 1–2)
apps/api          → GraphQL (unchanged contract)

packages/design-tokens  → iOS colors, type, spacing (web + native)
packages/types          → Shared TS interfaces
packages/native-ui      → React Native components (Phase 1)
packages/ui             → React DOM only (existing)
```

---

## Phase 0 — Design foundation

**Branch:** `feat/design-tokens`  
**PR:** https://github.com/susil-bot/luxgen-monorepo/pull/38 ✅

- [x] Add `packages/design-tokens` (colors, typography, spacing, radius, shadows, theme)
- [x] LuxGen brand defaults + tenant accent override helper
- [x] CSS variable map for web (`toCssVariables`)
- [x] Register `@luxgen/design-tokens` in `tsconfig.base.json`
- [x] Document usage in this roadmap

**Done when:** Package builds with `tsc`, no runtime deps, PR merged.

---

## Phase 1 — Expo shell

**Branch:** `feat/mobile-foundation`  
**PR:** https://github.com/susil-bot/luxgen-monorepo/pull/39 ✅ (stacked on #38)

- [x] Scaffold `apps/mobile` (Expo Router, TypeScript)
- [x] Metro monorepo config (`metro.config.js`, watch folders)
- [x] Add `packages/types` (User, Course, Enrollment interfaces)
- [x] Apollo client + SecureStore auth + `x-tenant` header
- [x] Screens: login → dashboard → courses list (read-only)
- [x] `@luxgen/native-ui` minimal: Screen, Card, Button, ListRow
- [x] Turbo scripts: `dev:mobile`, root workspace entry
- [x] EAS config stub (`eas.json`, `app.config.ts`)

**Done when:** App runs on iOS simulator, login + course list against local API.

---

## Phase 2a — Learner web storefront

**Branch:** `feat/learner-storefront`  
**PR:** https://github.com/susil-bot/luxgen-monorepo/pull/44 ✅

- [x] Catalog page (courses/products)
- [x] Course detail + enroll/checkout (reuse enrollment mutations)
- [x] Tenant branding from design tokens + tenant config
- [x] Route group: `/learn/*` in `apps/web` or new `apps/store`

**Done when:** Unauthenticated browse + authenticated enroll happy path works.

---

## Phase 2b — Mobile core screens

**Branch:** `feat/mobile-learner-screens`  
**PR:** https://github.com/susil-bot/luxgen-monorepo/pull/42 ✅ (stacked on #39)

- [x] Course detail screen (`/courses/[id]`)
- [x] Profile / account screen
- [x] My enrollments (Learning tab)
- [x] Plan gate: Pro `mobileApp` from `@luxgen/billing`
- [x] Deep link / QR tenant setup (`luxgen://login?tenant=demo`)

**Done when:** Learner can browse, enroll, and view enrollments on device.

---

## Phase 3 — Polish & launch

**Branch:** `feat/mobile-phase3`  
**PR:** https://github.com/susil-bot/luxgen-monorepo/pull/43 ✅

- [x] Push notifications (`expo-server-sdk` on API + `expo-notifications` on mobile)
- [x] OTA updates (EAS Update channels + `useOtaUpdates` hook)
- [x] App Store / Play internal testing (`eas.json` preview submit + internal track)
- [x] Offline cache (`apollo3-cache-persist` + AsyncStorage)
- [x] Per-tenant white-label app builds (`tenant-demo` EAS profile + env vars)

**Done when:** Push token registers after login, enroll sends push, cache persists queries, OTA hook runs on production builds.

---

## PR log

| Phase | Branch                        | PR                                                          | Status                |
| ----- | ----------------------------- | ----------------------------------------------------------- | --------------------- |
| 0     | `feat/design-tokens`          | [#38](https://github.com/susil-bot/luxgen-monorepo/pull/38) | Done — awaiting merge |
| 1     | `feat/mobile-foundation`      | —                                                           | Not started           |
| 2a    | `feat/learner-storefront`     | [#44](https://github.com/susil-bot/luxgen-monorepo/pull/44) | Done — awaiting merge |
| 2b    | `feat/mobile-learner-screens` | —                                                           | Not started           |
| 3     | —                             | —                                                           | Not started           |

---

## Personalization (LuxGen)

| Surface         | Mechanism                                                             |
| --------------- | --------------------------------------------------------------------- |
| Default palette | `@luxgen/design-tokens` → LuxGen blue `#007AFF` / `#0A84FF`           |
| Tenant accent   | `applyTenantTheme({ accentColor })` from tenant config                |
| App name / logo | Expo `app.config.ts` + tenant branding in `packages/db`               |
| Admin commerce  | Existing Shopify-style UI in `apps/web` (separate from learner store) |
