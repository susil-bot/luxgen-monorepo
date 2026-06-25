# Layout shells — when to use which

| Shell | Use for | Example routes |
| ----- | ------- | -------------- |
| **AppLayout** | Default tenant app pages with sidebar + NavBar | `/products`, `/groups`, `/settings/*`, `/organization/*` |
| **AdminDashboardLayout** | KPI-focused admin home with metric tiles | `/dashboard` only |
| **LearnLayout** | Learner storefront / course discovery | `/learn/*` |
| **StoreLayout** | Public commerce storefront | `/store/*` |
| **ProjectShell** | Project iteration / workflow board | `/project/*` |
| **OrganizationShell** | Org admin (users, billing, security) | `/organization/*` (nested) |
| **SettingsShell** | Tenant settings sections | `/settings/*` |
| **PageLoadingState** | Redirect stubs with no chrome | `/users` → `/organization/users` |

**Rule:** New pages use `AppLayout` + `useLayoutUser()` unless they match a specialised shell above. Do not use `getDefaultUser()` — pass `user={undefined}` for guests.

**AdminDashboardLayout vs AppLayout:** `AdminDashboardLayout` is reserved for the main dashboard metrics view. All other `/admin/*` routes use `AppLayout` like the rest of the product.

**Styling:** Prefer CSS variables (`var(--color-*)`) + layout Tailwind (`flex`, `gap`, `p-*`). Use `.ios-card`, `.ios-btn-primary`, etc. from `globals.css`.
