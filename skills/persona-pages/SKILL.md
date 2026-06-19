# Skill: Persona Pages (Learner, Admin, Analytics)

**Domain:** Role-specific UX — customers, analytics, admin dashboards, operator views.  
**Docs:** [PERSONA_PAGES.md](../../docs/PERSONA_PAGES.md), [BUSINESS_TECH_TRANSLATION.md](../../docs/BUSINESS_TECH_TRANSLATION.md)

---

## Personas → routes

| Persona | Routes | Primary goal |
|---------|--------|--------------|
| Operator | `/dashboard`, `/billing` | Run the business |
| Admin | `/users`, `/courses`, `/groups` | Manage content & users |
| Learner | `/customers` | Consume training |
| Analyst | `/analytics`, `/courses/analytics`, `/groups/analytics` | Insights (Pro gate) |
| Developer | `/developer`, `/agent` | Platform customization |
| Editorial | `/admin/listings` | Review applications |

---

## Key paths

| Page | File |
|------|------|
| Dashboard | `apps/web/pages/dashboard.tsx` |
| Customers | `apps/web/pages/customers/index.tsx` |
| Analytics | `apps/web/pages/analytics/index.tsx` |
| Course analytics | `apps/web/pages/courses/analytics.tsx` |
| Group analytics | `apps/web/pages/groups/analytics.tsx` |
| Developer hub | `apps/web/pages/developer/index.tsx` |

---

## Page template

Always use Standard Page Template from [CODEBASE.md](../../CODEBASE.md):

- `AppLayout` + `getDefaultSidebarSections()`
- `SnackbarProvider` wrapper
- iOS design tokens — [ios-design/SKILL.md](../ios-design/SKILL.md)

---

## Plan gates

Analytics pages wrap content in `PlanGate` with feature `analytics` (Pro+).

```tsx
import { PlanGate } from '@/components/billing/PlanGate'; // or project path
```

---

## Data wiring

- Prefer GraphQL queries in `apps/web/graphql/queries/`
- Some analytics pages still use mock data — replace with real queries when extending
- Pass `tenant` via `getServerSideProps` or `router.query.tenant`

---

## Business alignment

When building persona UI, check [FEATURE_CATALOG.md](../../docs/FEATURE_CATALOG.md) for user value statement and API backing.
