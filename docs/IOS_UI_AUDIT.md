# iOS UI Coverage Audit

> Tracks implemented features vs iOS design system compliance (`skills/ios-design/SKILL.md`).  
> Status: `✅ compliant` · `🟡 partial` · `❌ non-compliant`

---

## Summary (last audit: Phase 0 + gap sprint)

| Priority | Feature / route | Backend | UI status | Notes |
|----------|-----------------|---------|-----------|-------|
| P0 | Auth login + guard + session | ✅ | ✅ | PR #9 — `AuthNoticeBanner`, `AuthGuard` |
| P0 | Auth register | ✅ | 🟡 | iOS page shell; error mapping added in gap sprint |
| P0 | Dashboard `/dashboard` | GraphQL | ✅ | Loading/empty states use iOS tokens |
| P0 | Home `/` | redirect | ✅ | iOS landing page |
| P0 | 404 | — | ✅ | iOS quick-nav buttons |
| P1 | Courses `/courses`, `/courses/[id]` | GraphQL | ✅ | Phase 1.1b — list + detail wired |
| P1 | Users `/users` | mock | ✅ UI | GraphQL wiring — Phase 1.1c next |
| P1 | Groups `/groups/*` | GraphQL | ✅ | Phase 1.1 — real data + `ios-metric-tile` dashboard |
| P2 | Plan gate overlay | `@luxgen/billing` | ✅ | Token names fixed |
| ✅ | Automations `/automations` | GraphQL | ✅ | Reference implementation |
| ✅ | Billing `/billing` | GraphQL + Stripe | ✅ | |
| ✅ | Marketplace `/marketplace` | GraphQL | ✅ | |
| ✅ | Listings `/listings`, `/listings/my` | GraphQL | ✅ | |
| ✅ | Listings apply `/listings/apply` | GraphQL | ✅ | Uses `ios-large-title`, `ios-btn-primary` |
| ✅ | Agent Studio `/agent` | SSE API | ✅ | |
| ✅ | Analytics `/analytics` | partial | ✅ | |
| ✅ | Developer hub `/developer` | — | ✅ | |
| ✅ | Customers `/customers` | partial | ✅ | |
| ✅ | Admin listings `/admin/listings` | GraphQL | ✅ | |
| ✅ | Groups index/create/dashboard/detail | GraphQL | ✅ | Phase 1.1 |
| ✅ | Courses create/edit/analytics | partial | ✅ | |
| ⬜ | Banner demo `/banner-demo` | demo | ❌ | Low priority internal demo |
| ✅ | Layout Header/Footer | — | ✅ | Design tokens (home page) |

---

## Remaining work (backlog)

### Phase 1 — LMS data + UI polish

1. Wire `/users`, `/courses`, `/groups` to GraphQL (remove mocks) — [PRODUCT_TIMELINE.md](./PRODUCT_TIMELINE.md) § 1.1
2. Finish groups detail pages (`[id]/edit`, `[id]/members`, `dashboard`) card/table pass
3. Add `.ios-input` / `.ios-table` utilities where forms lack styling (see `globals.css`)

### Phase 1b — Shared components

- Migrate `components/layout/Header.tsx`, `Footer.tsx` to design tokens
- Consolidate page loading: use `PageLoadingState` everywhere (replace one-off spinners)

---

## Compliance rules (quick check)

```bash
# Pages still using banned Tailwind colours (should trend to zero)
rg 'bg-gray-|text-gray-|border-gray-' apps/web/pages --glob '*.tsx'
```

All new UI must use:
- `var(--color-*)` for colours
- `.ios-card`, `.ios-btn-*`, `.ios-large-title`, `.ios-empty-state`, `.ios-spinner`
- Layout Tailwind only: `flex`, `grid`, `gap-*`, `p-*`

See also: [AUTH_UI.md](./AUTH_UI.md), [FEATURE_CATALOG.md](./FEATURE_CATALOG.md)
