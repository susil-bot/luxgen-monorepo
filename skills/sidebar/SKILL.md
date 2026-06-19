# Skill: LuxGen Sidebar

**Domain:** Sidebar navigation — structure, active state, search, collapse, sub-nav, tooltips, tenant switcher.  
**Primary reference:** `docs/SIDEBAR_REDESIGN.md` (956 lines — full spec)  
**Supporting types:** `packages/ui/src/Sidebar/sidebar.types.ts`  
**CSS tokens:** `packages/ui/src/Sidebar/sidebar.css` + mirrored in `apps/web/styles/globals.css`

---

## Architecture Summary

The sidebar uses a **dark always-on surface** (#1C1C1E) regardless of the app light/dark mode setting. This matches the reference design and creates strong visual hierarchy.

### Token prefix: `--lux-*`

```css
--lux-sidebar-bg           /* #1C1C1E — always dark */
--lux-color-accent         /* #0A84FF (demo) / #BF5AF2 (idea-vibes) */
--lux-item-active-bg       /* rgba(10,132,255,0.18) */
--lux-item-hover-bg        /* rgba(255,255,255,0.06) */
--lux-text-primary         /* rgba(255,255,255,0.92) */
--lux-text-secondary       /* rgba(255,255,255,0.55) */
--lux-sidebar-expanded-w   /* 240px */
--lux-sidebar-collapsed-w  /* 48px */
--lux-item-height          /* 36px */
--lux-transition-collapse  /* width 250ms ease */
```

### CSS class prefix: `.lux-*`

```
.lux-sidebar              position:fixed, full-height, transitions width
.lux-nav-item             base nav row — hover/active/disabled states
.lux-nav-item--active     URL-matched active item
.lux-nav-item--disabled   greyed out, pointer-events:none
.lux-subnav               accordion child list (max-height animation)
.lux-subnav--open         expanded state
.lux-search               search input zone (top of nav)
.lux-tooltip              right-side tooltip shown in collapsed mode
.lux-sidebar-header       tenant/logo zone
.lux-sidebar-footer       user card + settings
.lux-badge-*              nav item badges (blue/green/red/orange/purple/gray)
```

### Hooks

| Hook | File | Purpose |
|---|---|---|
| `useSidebarActive` | `packages/ui/src/Sidebar/useSidebarActive.ts` | URL → activeItemId + expandedByUrl |
| `useSidebarSearch` | `packages/ui/src/Sidebar/useSidebarSearch.ts` | Filter nav tree by query string |

---

## Phase Status

| Phase | Status | Description |
|---|---|---|
| 1 | ✅ Done | Types, hooks, CSS tokens |
| 2 | Pending | `LuxSidebarItem`, `LuxSidebarSubItems`, `LuxSidebarTooltip` components |
| 3 | Pending | `LuxSidebar.tsx` shell — header + search + nav + footer |
| 4 | Pending | Wire into `AppLayout`, replace `DefaultNavigation.tsx` |
| 5 | Pending | Tenant switcher + keyboard navigation |
| 6 | Pending | Mobile overlay + accessibility |

**Always check** `docs/SIDEBAR_REDESIGN.md` § "Phase Implementation" before starting any phase.

---

## Navigation Data Model

```ts
// Current nav sections (from PERSONA_PAGES.md § 5)
const MAIN_NAV: NavSection[] = [
  {
    id: 'learn',
    items: [
      { id: 'dashboard',   label: 'Dashboard',   href: '/dashboard' },
      { id: 'customers',   label: 'My Learning',  href: '/customers' },
      { id: 'courses',     label: 'Courses',      href: '/courses' },
      { id: 'groups',      label: 'Groups',       href: '/groups' },
      { id: 'users',       label: 'Users',        href: '/users' },
    ]
  },
  {
    id: 'data', title: 'Insights', showTitle: true, separator: true,
    items: [
      { id: 'analytics',   label: 'Analytics',   href: '/analytics' },
    ]
  },
  {
    id: 'build', title: 'Build', showTitle: true, separator: true,
    items: [
      { id: 'developer',   label: 'AI Studio',   href: '/developer' },
      { id: 'automations', label: 'Automations', href: '/automations' },
    ]
  }
];
```

---

## Key Rules

1. **Read `docs/SIDEBAR_REDESIGN.md` first** — it has all 12 component specs, every CSS class, and exact state tables.
2. **Never hardcode colours** — every colour must use a `--lux-*` token.
3. **Active state = URL-based** — use `useSidebarActive(sections, router.pathname)`, never manual `isActive` prop.
4. **Collapsed mode** — items show only icon + tooltip, not label. Width transitions via CSS, not JS.
5. **Tenant accent** — `[data-tenant="idea-vibes"]` overrides `--lux-color-accent` to purple.
6. **Mobile** — at `max-width: 767px`, sidebar uses `transform: translateX(-100%)` overlay mode.
