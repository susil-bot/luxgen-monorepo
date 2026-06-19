# LuxGen Sidebar Redesign — Shopify-Inspired Architecture

**Document type**: Senior Architect Specification  
**Status**: Ready for phased implementation  
**Target**: AI agents + human developers  
**Replaces**: `packages/ui/src/Sidebar/Sidebar.tsx` + `SidebarItem.tsx` + `DefaultNavigation.tsx`

> **For AI agents**: Read this document completely before touching any sidebar file.
> Every class, component, and behaviour is defined here with its exact goal.
> Never deviate from this spec without updating the document first.

---

## 1. Why This Redesign

### Current sidebar problems (diagnosed from code review)

| Problem | File | Line | Impact |
|---------|------|------|--------|
| Active state uses `bg-green-50 border-r-2 border-green-500` (hardcoded Tailwind) | `SidebarItem.tsx:36` | Breaks dark mode, ignores tenant branding |
| Badge uses `bg-red-500 text-white` (hardcoded) | `SidebarItem.tsx:72` | Inconsistent with design system |
| Collapse button uses `text-gray-400 hover:bg-gray-100` (hardcoded) | `Sidebar.tsx:221` | Not theme-aware |
| User avatar uses `bg-green-500` (hardcoded) | `Sidebar.tsx:297` | Inconsistent branding |
| Active detection is manual: `isActive={activeItem === item.id}` set on click | `Sidebar.tsx:271` | Breaks on page reload — sidebar shows no active item |
| No sub-nav animation — items appear/disappear instantly | `SidebarItem.tsx:95` | Jarring UX |
| No sidebar search | — | User must scan entire nav |
| No tenant switcher | — | No way to switch tenants without URL change |
| Section labels are always shown even when sidebar is icon-only | `Sidebar.tsx:242` | Clutters collapsed mode |
| Flat navigation — no parent items, only sections | `DefaultNavigation.tsx` | Can't represent hierarchy like Courses > All Courses > Analytics |
| No keyboard navigation | — | Accessibility failure |
| No tooltip in collapsed mode | — | Icons have no labels when collapsed |
| Bottom items mixed with main nav | — | Settings/Developer lost in scroll |

### What Shopify does right (reference analysis)

Shopify's Polaris Navigation system (admin.shopify.com) is the gold standard for SaaS sidebar UX. These are the specific patterns we are adopting:

**1. Dark sidebar, always**
Shopify uses a near-black sidebar (`#1a1a2e` charcoal) against a light content area. This creates instant visual hierarchy — the sidebar is chrome, the content is canvas. The current LuxGen sidebar is frosted glass (light), which competes with the content.

**2. Store header = tenant identity**
Top-left shows a rounded-square avatar (brand initial + color) + store name + `▾` dropdown for switching between stores. For LuxGen: this becomes the **Tenant Switcher** showing the current tenant (Demo / Idea-Vibes) with ability to switch.

**3. Inline search inside sidebar**
A compact search field (not navbar search) that filters nav items in real time. Keyboard shortcut `/` focuses it. This removes the need for section headers — users search instead of scan.

**4. Flat primary nav with accordion sub-items**
No section group headers in the main nav. Items that have children show a `›` chevron. Clicking the parent expands its children inline (accordion, smooth CSS height transition). If the current URL matches a child, the parent auto-expands on load.

**5. URL-based active detection**
Active state derives from `window.location.pathname`. No `isActive` prop — the component computes it. This means active state survives page reloads.

**6. Filled icons (20px)**
Shopify uses filled (solid) SVG icons at 20×20px. The current LuxGen sidebar uses outline icons at 20×20px. Filled icons read better at small sizes and communicate "selected" state more clearly.

**7. Sticky footer section**
A visually distinct bottom zone (never scrolls away) containing: Settings + Help. For LuxGen: Settings + Agent Studio + Help link.

**8. Item anatomy: icon + label + badge + chevron**
Every item slot: `[20px icon] [flex label] [optional count/new badge] [optional ›]`
Consistent 36px row height, 12px left padding, 8px border-radius.

**9. Tooltip in icon-only (collapsed) mode**
When sidebar collapses to icon strip (48px wide), hovering any icon shows a floating tooltip with the item label. Current LuxGen has no tooltip.

**10. Mobile: overlay drawer, not push**
On mobile (<768px), the sidebar overlays the content (not pushes it). A backdrop dims the content. The hamburger is in the top navbar. Current LuxGen has this partially but not consistently.

---

## 2. Architecture Overview

```
packages/ui/src/Sidebar/                         ← replace all existing files
├── ShopifySidebar.tsx                           ← main container (NEW — replaces Sidebar.tsx)
├── ShopifySidebarHeader.tsx                     ← tenant switcher + logo zone
├── ShopifySidebarSearch.tsx                     ← inline search with filter logic
├── ShopifySidebarNav.tsx                        ← primary nav scroll area
├── ShopifySidebarItem.tsx                       ← single nav row (replaces SidebarItem.tsx)
├── ShopifySidebarSubItems.tsx                   ← animated accordion children
├── ShopifySidebarFooter.tsx                     ← sticky bottom zone
├── ShopifySidebarTooltip.tsx                    ← tooltip for collapsed items
├── useSidebarActive.ts                          ← URL-based active detection hook
├── useSidebarSearch.ts                          ← search filter hook
├── useSidebarKeyboard.ts                        ← keyboard navigation hook
├── sidebar.types.ts                             ← all TypeScript interfaces
├── sidebar.css                                  ← CSS custom properties + animations
└── index.ts                                     ← re-exports
```

**Key design principle**: The sidebar is **self-contained**. It reads the current URL itself, manages its own state, and exposes only what the parent strictly needs via callbacks. `AppLayout` passes data in; the sidebar handles everything else internally.

---

## 3. TypeScript Interfaces (`sidebar.types.ts`)

**Goal**: Define a data model that can express the full navigation tree — items, children, badges, states — without requiring the caller to manage active state or expansion state.

```typescript
// ─── Navigation item ──────────────────────────────────────────────────────────

export interface NavBadge {
  /** Numeric count (e.g. 12 pending orders) */
  count?: number;
  /** Text label (e.g. "New", "Beta") */
  label?: string;
  /** Color variant */
  variant: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
}

export interface NavItem {
  /** Unique identifier — used for active detection and keyboard focus */
  id: string;
  /** Display label */
  label: string;
  /** Navigation target. Omit for parent-only items (expand-only) */
  href?: string;
  /** 20×20px SVG React node — use filled (solid) style, not outline */
  icon?: React.ReactNode;
  /** Optional badge (count or text label) */
  badge?: NavBadge;
  /** Child items — renders as accordion sub-nav */
  children?: NavItem[];
  /** If true, href opens in new tab */
  external?: boolean;
  /** If true, item renders greyed out and is not clickable */
  disabled?: boolean;
  /** Exact match for active detection (default: prefix match) */
  exact?: boolean;
}

// ─── Navigation section ───────────────────────────────────────────────────────

export interface NavSection {
  /** Unique identifier */
  id: string;
  /**
   * Optional visible label above the section.
   * Shopify-style: section labels are HIDDEN by default for primary nav.
   * Show them only for secondary/footer sections.
   */
  title?: string;
  /** Whether to show the title (default: false — Shopify pattern) */
  showTitle?: boolean;
  /** The nav items in this section */
  items: NavItem[];
  /** Visual divider above this section (default: false) */
  separator?: boolean;
}

// ─── Tenant (for store switcher) ──────────────────────────────────────────────

export interface SidebarTenant {
  id: string;
  name: string;
  subdomain: string;
  /** First letter of name used for avatar if no logoUrl */
  logoUrl?: string;
  /** Brand color for avatar background (hex) — defaults to --color-blue */
  color?: string;
  /** Badge shown on tenant (e.g. "Pro", "Enterprise") */
  plan?: string;
}

// ─── Sidebar props ────────────────────────────────────────────────────────────

export interface ShopifySidebarProps {
  /** Primary navigation sections */
  sections: NavSection[];
  /** Sections pinned to the bottom footer (Settings, Help, etc.) */
  footerSections?: NavSection[];
  /** Current tenant — shows in header */
  tenant?: SidebarTenant;
  /** All tenants the user can switch to */
  tenants?: SidebarTenant[];
  /** Called when user picks a different tenant */
  onTenantSwitch?: (tenant: SidebarTenant) => void;
  /** User displayed at bottom of footer */
  user?: SidebarUser;
  /** Called when user taps profile/settings/logout */
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  /** Whether sidebar starts collapsed (icon-only) */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state (overrides internal) */
  collapsed?: boolean;
  /** Called when collapse state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Width when expanded (default: 240) */
  expandedWidth?: number;
  /** Width when collapsed / icon-only (default: 48) */
  collapsedWidth?: number;
}

export interface SidebarUser {
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  initials?: string;
}

// ─── Internal state (managed by ShopifySidebar, NOT exposed as props) ─────────

export interface SidebarState {
  collapsed: boolean;
  searchQuery: string;
  expandedItems: Set<string>;   // items with open sub-nav accordion
  focusedItemId: string | null; // for keyboard navigation
}
```

---

## 4. Component Specifications

### 4.1 `ShopifySidebar.tsx` — Root Container

**Goal**: Compose all sidebar zones, manage the overall layout, own sidebar state, pass state down via React context (not prop drilling).

**Dimensions**:
- Expanded: `240px` wide, `100vh` tall, `position: fixed`, `left: 0`, `top: 0`, `z-index: 40`
- Collapsed: `48px` wide (icon strip)
- Main content offset: set `margin-left: 240px` or `48px` on the page — the sidebar DOES NOT push; the layout manages the offset

**Visual**:
- Background: `var(--sp-sidebar-bg)` — a NEW CSS variable (dark charcoal, see Section 6)
- Right border: `1px solid var(--sp-sidebar-border)` — very subtle
- Transition: `width 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)` — smooth collapse

**Structure**:
```tsx
<aside className="sp-sidebar" data-collapsed={collapsed}>
  <ShopifySidebarHeader />        {/* zone 1: tenant + logo */}
  <ShopifySidebarSearch />        {/* zone 2: search input */}
  <ShopifySidebarNav />           {/* zone 3: main scrollable nav */}
  <ShopifySidebarFooter />        {/* zone 4: sticky bottom */}
</aside>
```

**Context**: Provides `SidebarContext` to all children — avoids prop-drilling `collapsed`, `activeItemId`, `searchQuery`, `expandedItems`, and handlers.

**Export**: `export const ShopifySidebar = React.memo(ShopifySidebarComponent)`

---

### 4.2 `ShopifySidebarHeader.tsx` — Tenant Zone

**Goal**: Show the current tenant identity. Double-click or arrow click opens the tenant switcher dropdown. Maintains recognizable Shopify "store switcher" pattern — users immediately know where to go to change workspace.

**Visual** (expanded):
```
┌──────────────────────────────────┐
│  [■] LuxGen Demo          [▾]   │   ← rounded-square avatar + name + chevron
│      demo.luxgen.com             │   ← subdomain in small text
└──────────────────────────────────┘
```

**Visual** (collapsed / icon-only):
```
┌────┐
│ [■]│   ← avatar only, no text
└────┘
```

**Avatar**:
- Shape: `border-radius: 8px` (rounded square, NOT circle)
- Size: `32×32px`
- Background: tenant `color` property or `var(--color-blue)`
- Content: first letter of tenant name, uppercase, white, 14px bold

**Dropdown behavior** (when `tenants.length > 1`):
- Clicking header opens a popover (not a modal) listing all tenants
- Each tenant shows: avatar + name + plan badge
- Current tenant gets a checkmark
- Dropdown closes on outside click or Escape
- Calls `onTenantSwitch(tenant)` when user picks a different one

**CSS class**: `.sp-sidebar-header`

---

### 4.3 `ShopifySidebarSearch.tsx` — Inline Search

**Goal**: Filter the entire navigation tree in real time. Eliminates the need for section headers — users find items by searching, not by scanning category labels.

**Visual** (expanded):
```
┌──────────────────────────────────┐
│  🔍  Search...              [/]  │   ← slash badge = keyboard shortcut
└──────────────────────────────────┘
```

**Visual** (collapsed): Hidden — only visible when expanded.

**Behavior**:
- Input focused on `/` keypress anywhere in the app (unless focus is in a text field)
- Blur on `Escape`
- Searches: `item.label` + `item.href` (case-insensitive substring match)
- While searching: section structure is collapsed, results shown flat with breadcrumb label
- Breadcrumb format for child items: `Courses > All Courses`
- Empty state: "No results for '{query}'" with a clear button
- Debounce: 120ms

**Hook used internally**: `useSidebarSearch(sections, query)` → `FilteredNavSection[]`

**CSS class**: `.sp-sidebar-search`

---

### 4.4 `ShopifySidebarNav.tsx` — Primary Navigation

**Goal**: Render the main scrollable nav area. Contains all `NavSection` items. When `searchQuery` is active, renders filtered flat results instead of sections.

**Visual structure**:
```
[section 1 items — no label]
────────────────────────────  ← separator (if section.separator = true)
[section 2 items — no label]
...
```

**Scroll behavior**:
- `overflow-y: auto` with iOS-style scrollbar (thin, hidden by default, visible on hover)
- Scrolls independently from header and footer (which are sticky)

**CSS class**: `.sp-sidebar-nav`

---

### 4.5 `ShopifySidebarItem.tsx` — Single Navigation Row

**Goal**: Render one navigation item with its full interaction states. This is the most atomic unit — get it right and the entire nav follows.

**Anatomy** (36px tall):
```
[12px pad] [20px icon] [8px gap] [flex label] [badge?] [chevron?] [12px pad]
```

**States**:

| State | Background | Text | Icon | Definition |
|-------|-----------|------|------|------------|
| Default | transparent | `var(--sp-text-secondary)` | `var(--sp-text-tertiary)` | Not active, not hovered |
| Hover | `var(--sp-item-hover-bg)` | `var(--sp-text-primary)` | `var(--sp-text-primary)` | Mouse over |
| Active | `var(--sp-item-active-bg)` | `var(--sp-text-primary)` | `var(--sp-color-accent)` | URL matches item href |
| Active + hover | `var(--sp-item-active-hover-bg)` | `var(--sp-text-primary)` | `var(--sp-color-accent)` | |
| Disabled | transparent | `var(--sp-text-disabled)` | `var(--sp-text-disabled)` | `cursor: not-allowed` |
| Focused | `var(--sp-item-hover-bg)` + `outline: 2px solid var(--sp-color-accent)` | — | — | Keyboard focus ring |

**Active detection (via `useSidebarActive` hook)**:
```typescript
// Default: prefix match — /courses matches /courses/all, /courses/create
const isActive = item.exact
  ? pathname === item.href
  : pathname.startsWith(item.href ?? '__never__');

// If item has children: active if ANY child matches
const isAncestorActive = item.children?.some(child =>
  pathname.startsWith(child.href ?? '__never__')
) ?? false;
```

**Items with children** (parent rows):
- No `href` navigation on click — clicking toggles the accordion
- Shows `›` chevron, rotates to `▾` when expanded
- Active class applied when any child matches (even if parent has no href)

**Items without children**:
- Navigates to `item.href` on click (via `router.push` in Next.js context)
- External items: `window.open(href, '_blank')`

**CSS classes**:
```
.sp-nav-item                   ← base
.sp-nav-item--active           ← URL match
.sp-nav-item--ancestor-active  ← child URL match (parent row)
.sp-nav-item--disabled         ← disabled state
.sp-nav-item--has-children     ← has sub-items
.sp-nav-item__icon             ← icon wrapper
.sp-nav-item__label            ← text label
.sp-nav-item__badge            ← count/text badge
.sp-nav-item__chevron          ← expand/collapse arrow
```

**Collapsed (icon-only) mode**:
- Label, badge, chevron all hidden via `visibility: hidden; width: 0; overflow: hidden`
- NOT `display: none` — this avoids layout shifts during collapse animation
- Icon centered in the 48px strip
- Tooltip shown on hover (see `ShopifySidebarTooltip`)

---

### 4.6 `ShopifySidebarSubItems.tsx` — Accordion Children

**Goal**: Render child items with a smooth height animation. The transition must look native — no instant appear/disappear, no jarring layout shifts.

**Animation specification**:
```css
/* Height animates from 0 to auto-height */
/* Use max-height trick with known upper bound */
.sp-subnav {
  overflow: hidden;
  max-height: 0;
  transition: max-height 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity 180ms ease;
  opacity: 0;
}
.sp-subnav--open {
  max-height: 400px; /* safe upper bound for any sub-nav */
  opacity: 1;
}
```

**Visual indentation**:
```
  [12px] [2px left border — var(--sp-color-accent) at 40% opacity] [8px] [item]
```
The 2px left border connects visually to the parent's icon column.

**Child item anatomy**: Same as parent `ShopifySidebarItem` but:
- Smaller text: `13px` (parent is `14px`)
- No icon (child items don't have icons — label only)
- Indented `28px` from left edge

**CSS classes**:
```
.sp-subnav                   ← container (manages open/close animation)
.sp-subnav--open             ← open state
.sp-subnav__item             ← individual child row (no icon)
.sp-subnav__item--active     ← URL match
```

---

### 4.7 `ShopifySidebarFooter.tsx` — Sticky Bottom Zone

**Goal**: Always visible footer that never scrolls away. Contains bottom-pinned items (Settings, Help) and the user card. Shopify always shows Settings and Help at the bottom regardless of scroll position.

**Structure**:
```
────────────────────────  ← separator line
[footer nav items]        ← same anatomy as regular nav items
────────────────────────
[user avatar] [name]      ← user card
              [role]
              [•••]       ← action menu (profile/settings/logout)
```

**User card**:
- Avatar: if `avatarUrl` → `<img>` sized 32×32, rounded-full; else initials in colored circle (gradient, same as `.ios-avatar`)
- Name: `14px medium` `var(--sp-text-primary)`
- Role: `12px` `var(--sp-text-secondary)`
- `•••` menu: popover with Profile / Settings / Log out options

**CSS classes**:
```
.sp-sidebar-footer           ← sticky bottom container
.sp-sidebar-footer__nav      ← footer nav items (same as main nav)
.sp-sidebar-footer__user     ← user card row
.sp-sidebar-footer__avatar   ← avatar wrapper
.sp-sidebar-footer__name     ← name text
.sp-sidebar-footer__role     ← role text
.sp-sidebar-footer__menu     ← •• menu button
```

---

### 4.8 `ShopifySidebarTooltip.tsx` — Collapsed Mode Labels

**Goal**: When sidebar is icon-only (48px), hovering any nav item shows a floating tooltip with the item's label. This makes the collapsed mode fully usable without expanding.

**Visual**:
```
     [icon]  →  [icon] ┌──────────────┐
                        │  Dashboard   │
                        └──────────────┘
```

**Implementation**:
- Pure CSS approach: `position: absolute; left: 52px; top: 50%; transform: translateY(-50%)`
- Visibility controlled by `.sp-nav-item:hover .sp-tooltip { opacity: 1 }`
- `pointer-events: none` so it doesn't interfere with mouse events
- `z-index: 100` to render above content
- Background: `var(--sp-tooltip-bg)` — dark charcoal
- Text: white 13px
- Border radius: 6px
- Arrow: CSS triangle pointing left

**CSS class**: `.sp-tooltip`

---

### 4.9 `useSidebarActive.ts` — URL Active Detection Hook

**Goal**: Derive active item IDs from the current URL. This is a pure computation with no side effects — testable, predictable.

```typescript
interface ActiveState {
  activeItemId: string | null;        // the deepest matching item
  expandedByUrl: Set<string>;         // parent IDs that should auto-expand
}

export function useSidebarActive(
  sections: NavSection[],
  pathname: string
): ActiveState {
  return useMemo(() => {
    const expandedByUrl = new Set<string>();
    let activeItemId: string | null = null;

    const checkItem = (item: NavItem, parentId?: string) => {
      const matches = item.exact
        ? pathname === item.href
        : item.href ? pathname.startsWith(item.href) : false;

      const childMatches = item.children?.some(child =>
        child.href && pathname.startsWith(child.href)
      ) ?? false;

      if (matches || childMatches) {
        activeItemId = item.id;
        if (parentId) expandedByUrl.add(parentId);
        if (childMatches) expandedByUrl.add(item.id);
      }

      item.children?.forEach(child => checkItem(child, item.id));
    };

    sections.forEach(s => s.items.forEach(item => checkItem(item)));
    return { activeItemId, expandedByUrl };
  }, [sections, pathname]);
}
```

**Key decision**: Prefix match by default (not exact). `/courses/create` matches a parent item with `href: '/courses'`. Set `exact: true` on the item to require an exact match.

---

### 4.10 `useSidebarSearch.ts` — Search Filter Hook

**Goal**: Filter the navigation tree by query string. Returns a new section array with only matching items, preserving structure.

```typescript
export function useSidebarSearch(
  sections: NavSection[],
  query: string
): NavSection[] {
  return useMemo(() => {
    if (!query.trim()) return sections;

    const q = query.toLowerCase();

    const matchItem = (item: NavItem): NavItem | null => {
      const labelMatch = item.label.toLowerCase().includes(q);
      const filteredChildren = item.children
        ?.map(matchItem)
        .filter(Boolean) as NavItem[] | undefined;

      if (labelMatch) return item;                        // parent matches → show all children
      if (filteredChildren?.length) return { ...item, children: filteredChildren };
      return null;
    };

    return sections
      .map(section => ({
        ...section,
        items: section.items.map(matchItem).filter(Boolean) as NavItem[],
      }))
      .filter(s => s.items.length > 0);
  }, [sections, query]);
}
```

---

### 4.11 `useSidebarKeyboard.ts` — Keyboard Navigation Hook

**Goal**: Enable full keyboard navigation of the sidebar. WCAG 2.1 AA requirement.

**Key bindings**:

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move focus to previous/next visible item |
| `Enter` / `Space` | Activate focused item (navigate or toggle) |
| `→` | Expand item's children (if has children) |
| `←` | Collapse item's children (if expanded) or move focus to parent |
| `Home` | Focus first item |
| `End` | Focus last item |
| `/` | Focus search input (only when sidebar is expanded) |
| `Escape` | Clear search / close dropdown / close sidebar on mobile |

**Implementation**: Maintains a `focusedItemId` state. Uses `aria-activedescendant` on the `<nav>` element. Each item has an `id` attribute matching `item.id`. No actual DOM focus is moved — virtual focus only, styled with the focus ring.

---

### 4.12 `sidebar.css` — Design Tokens

**Goal**: Define all sidebar-specific CSS custom properties. These are separate from the global iOS design system tokens because the sidebar has its own dark-surface identity.

```css
/* ── Shopify-style Sidebar Design Tokens ─────────────────────────────────────
   These are DARK by default — the sidebar is always dark regardless of
   the app's light/dark mode toggle. This mirrors Shopify's design decision.
   ─────────────────────────────────────────────────────────────────────────── */

:root {
  /* Sidebar surface */
  --sp-sidebar-bg:          #1C1C1E;      /* macOS dark: same as --color-bg-secondary dark */
  --sp-sidebar-border:      rgba(255,255,255,0.06);

  /* Text on dark sidebar */
  --sp-text-primary:        rgba(255,255,255,0.92);
  --sp-text-secondary:      rgba(255,255,255,0.55);
  --sp-text-tertiary:       rgba(255,255,255,0.32);
  --sp-text-disabled:       rgba(255,255,255,0.22);

  /* Accent (matches system blue, brighter on dark) */
  --sp-color-accent:        #0A84FF;      /* iOS dark-mode blue */
  --sp-color-accent-tint:   rgba(10,132,255,0.18);

  /* Item backgrounds */
  --sp-item-hover-bg:       rgba(255,255,255,0.06);
  --sp-item-active-bg:      rgba(10,132,255,0.18);
  --sp-item-active-hover-bg:rgba(10,132,255,0.24);

  /* Search */
  --sp-search-bg:           rgba(255,255,255,0.07);
  --sp-search-border:       rgba(255,255,255,0.10);
  --sp-search-focus-border: rgba(10,132,255,0.60);

  /* Separator */
  --sp-separator:           rgba(255,255,255,0.07);

  /* Subnav left border */
  --sp-subnav-border:       rgba(10,132,255,0.40);

  /* Tooltip */
  --sp-tooltip-bg:          #2C2C2E;
  --sp-tooltip-text:        rgba(255,255,255,0.92);

  /* Dimensions */
  --sp-sidebar-expanded-w:  240px;
  --sp-sidebar-collapsed-w: 48px;
  --sp-item-height:         36px;
  --sp-item-padding-x:      12px;
  --sp-item-radius:         8px;
  --sp-icon-size:           20px;
  --sp-icon-gap:            10px;
  --sp-font-size-item:      14px;
  --sp-font-size-child:     13px;
  --sp-font-size-label:     11px;
  --sp-font-weight-item:    500;

  /* Animation */
  --sp-transition-collapse: width 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --sp-transition-item:     background-color 120ms ease, color 120ms ease;
  --sp-transition-subnav:   max-height 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            opacity 180ms ease;
  --sp-transition-chevron:  transform 200ms ease;
}

/* Tenant-specific accent overrides (applied via JS when tenant switches) */
[data-tenant="idea-vibes"] {
  --sp-color-accent:       #BF5AF2;   /* iOS purple for idea-vibes tenant */
  --sp-color-accent-tint:  rgba(191,90,242,0.18);
  --sp-item-active-bg:     rgba(191,90,242,0.18);
  --sp-item-active-hover-bg: rgba(191,90,242,0.24);
}
[data-tenant="demo"] {
  --sp-color-accent:       #0A84FF;   /* iOS blue for demo tenant */
}
```

---

## 5. Navigation Data Model for LuxGen

This is the exact data structure to pass to `ShopifySidebar` for LuxGen's app. Update in `packages/ui/src/Layout/DefaultNavigation.tsx`.

```typescript
export const getLuxGenSidebarSections = (): NavSection[] => [
  // ── Primary navigation (no section title — Shopify pattern) ──────────────
  {
    id: 'primary',
    items: [
      {
        id: 'home',
        label: 'Home',
        href: '/dashboard',
        exact: true,
        icon: <HomeIcon />,           // 20px filled SVG
      },
      {
        id: 'courses',
        label: 'Courses',
        href: '/courses',
        icon: <CoursesIcon />,
        children: [
          { id: 'all-courses',      label: 'All Courses',      href: '/courses' },
          { id: 'my-courses',       label: 'My Courses',       href: '/courses/my-courses' },
          { id: 'create-course',    label: 'Create Course',    href: '/courses/create' },
          { id: 'course-analytics', label: 'Course Analytics', href: '/courses/analytics' },
        ],
      },
      {
        id: 'groups',
        label: 'Groups',
        href: '/groups',
        icon: <GroupsIcon />,
        children: [
          { id: 'all-groups',      label: 'All Groups',      href: '/groups' },
          { id: 'create-group',    label: 'Create Group',    href: '/groups/create' },
          { id: 'group-analytics', label: 'Group Analytics', href: '/groups/analytics' },
        ],
      },
      {
        id: 'users',
        label: 'Users',
        href: '/users',
        icon: <UsersIcon />,
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/analytics',
        icon: <AnalyticsIcon />,
      },
    ],
  },
];

export const getLuxGenFooterSections = (): NavSection[] => [
  {
    id: 'footer',
    separator: true,
    items: [
      {
        id: 'agent-studio',
        label: 'Agent Studio',
        href: '/agent',
        icon: <AgentIcon />,
        badge: { label: 'AI', variant: 'blue' },
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: <SettingsIcon />,
      },
      {
        id: 'help',
        label: 'Help',
        href: 'https://docs.luxgen.io',
        icon: <HelpIcon />,
        external: true,
      },
    ],
  },
];
```

---

## 6. Integration: How `AppLayout` Changes

`AppLayout.tsx` currently renders both `<Sidebar>` and `<NavBar>`. After the redesign:

```
BEFORE:                          AFTER:
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ [Sidebar 240px] │ [NavBar]  │  │[ShopifySidebar 240px]│[Main]│
│                 │ [Main]    │  │  - has own header zone       │
└─────────────────────────────┘  │  - has own search            │
                                  │  - has own user footer       │
                                  │                    │         │
                                  │                    │[Content]│
                                  └─────────────────────────────┘
```

**The NavBar remains** for the top bar (search, notifications, dark/light toggle, user avatar). The sidebar gets its own tenant switcher + search + user card. They serve different purposes:
- NavBar: page-level actions (search content, notifications)
- Sidebar header: workspace/tenant context
- Sidebar search: find a page to navigate to
- Sidebar user: account actions

**`AppLayout` changes**:
1. Replace `<Sidebar ... />` with `<ShopifySidebar ... />`
2. Replace `sidebarSections` prop type `SidebarSection[]` → `NavSection[]`
3. Add `footerSections`, `tenant`, `tenants`, `onTenantSwitch` props
4. Keep `<NavBar>` unchanged
5. Update `getMainContentStyles()` to use `--sp-sidebar-expanded-w` and `--sp-sidebar-collapsed-w`

---

## 7. Phased Implementation Plan

### Phase 1 — Foundation (no visual change, structural only)
**Scope**: Types, hooks, CSS tokens. No UI changes yet.  
**Files to create**: `sidebar.types.ts`, `sidebar.css`, `useSidebarActive.ts`, `useSidebarSearch.ts`  
**Files to update**: none  
**Test**: Unit tests for `useSidebarActive` and `useSidebarSearch` — pure functions, easy to test.

**Acceptance criteria**:
- `useSidebarActive('/courses/create', sections)` returns `{ activeItemId: 'courses', expandedByUrl: Set{'courses'} }`
- `useSidebarSearch(sections, 'cours')` returns sections with only course-related items
- CSS tokens file imports without error in the UI package

---

### Phase 2 — Single Item Component
**Scope**: Build `ShopifySidebarItem.tsx` and `ShopifySidebarSubItems.tsx` in isolation.  
**Files to create**: `ShopifySidebarItem.tsx`, `ShopifySidebarSubItems.tsx`, `ShopifySidebarTooltip.tsx`  
**Files to update**: none yet  
**Test**: Render `ShopifySidebarItem` in `packages/ui/src/Sidebar/fixture.tsx` — verify all states visually.

**Acceptance criteria**:
- All 5 states render correctly (default/hover/active/ancestor-active/disabled)
- Chevron rotates on expand
- Sub-items appear with height animation (not instant)
- Tooltip appears on hover when `isCollapsed={true}`
- Item navigates correctly on click

---

### Phase 3 — Full Sidebar Shell
**Scope**: Assemble the full sidebar with header, search, nav, footer.  
**Files to create**: `ShopifySidebar.tsx`, `ShopifySidebarHeader.tsx`, `ShopifySidebarSearch.tsx`, `ShopifySidebarNav.tsx`, `ShopifySidebarFooter.tsx`  
**Files to update**: `packages/ui/src/Sidebar/index.ts` (add new exports)

**Acceptance criteria**:
- Sidebar renders with dark background on all pages
- Collapse/expand transition smooth (250ms)
- Active item detected from URL on page load (not just on click)
- Search filters nav items in real time
- Footer stays sticky even when main nav overflows

---

### Phase 4 — AppLayout Integration
**Scope**: Wire `ShopifySidebar` into `AppLayout`. Update `DefaultNavigation.tsx` with new data model.  
**Files to update**: `AppLayout.tsx`, `DefaultNavigation.tsx`  
**Files to update**: All pages that call `getDefaultSidebarSections()` → call `getLuxGenSidebarSections()` instead

**Acceptance criteria**:
- All existing pages still render (no regressions)
- Sidebar shows correct active state on every page
- Courses/Groups/Developer items expand correctly to show children
- Layout offset (main content margin-left) updates when sidebar collapses

---

### Phase 5 — Tenant Switcher + Keyboard
**Scope**: Add tenant switcher dropdown in header, keyboard navigation.  
**Files to create**: `useSidebarKeyboard.ts`  
**Files to update**: `ShopifySidebarHeader.tsx` (add dropdown), `ShopifySidebar.tsx` (wire keyboard hook)

**Acceptance criteria**:
- Header shows tenant name and avatar
- Clicking header opens tenant dropdown (if `tenants.length > 1`)
- Switching tenant calls `onTenantSwitch` and updates URL (`?tenant=idea-vibes`)
- Arrow keys navigate between visible items
- `/` focuses search
- Escape closes dropdown / clears search

---

### Phase 6 — Mobile + Polish
**Scope**: Mobile overlay drawer, final visual polish, accessibility audit.

**Mobile behavior**:
- Breakpoint: `< 768px`
- Sidebar hidden by default (off-screen left via `transform: translateX(-100%)`)
- Hamburger `☰` button in `NavBar` shows/hides sidebar
- When open: sidebar overlays content (not pushes), backdrop dims behind
- Clicking backdrop closes sidebar
- Escape closes sidebar

**Acceptance criteria**:
- No horizontal scroll on any page at 375px width
- Sidebar opens/closes with animation on mobile
- Backdrop tap closes sidebar
- WCAG 2.1 AA: all items reachable by keyboard, screen reader labels present

---

## 8. File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `packages/ui/src/Sidebar/Sidebar.tsx` | **Replace** | Replaced by `ShopifySidebar.tsx` |
| `packages/ui/src/Sidebar/SidebarItem.tsx` | **Replace** | Replaced by `ShopifySidebarItem.tsx` |
| `packages/ui/src/Sidebar/SidebarSection.tsx` | **Delete** | Logic absorbed into `ShopifySidebarNav.tsx` |
| `packages/ui/src/Sidebar/SidebarProvider.tsx` | **Keep/Rename** | Becomes `SidebarContext.tsx` |
| `packages/ui/src/Sidebar/sidebar.types.ts` | **Create** | Phase 1 |
| `packages/ui/src/Sidebar/sidebar.css` | **Create** | Phase 1 |
| `packages/ui/src/Sidebar/useSidebarActive.ts` | **Create** | Phase 1 |
| `packages/ui/src/Sidebar/useSidebarSearch.ts` | **Create** | Phase 1 |
| `packages/ui/src/Sidebar/useSidebarKeyboard.ts` | **Create** | Phase 5 |
| `packages/ui/src/Sidebar/ShopifySidebar.tsx` | **Create** | Phase 3 |
| `packages/ui/src/Sidebar/ShopifySidebarHeader.tsx` | **Create** | Phase 3 |
| `packages/ui/src/Sidebar/ShopifySidebarSearch.tsx` | **Create** | Phase 3 |
| `packages/ui/src/Sidebar/ShopifySidebarNav.tsx` | **Create** | Phase 3 |
| `packages/ui/src/Sidebar/ShopifySidebarItem.tsx` | **Create** | Phase 2 |
| `packages/ui/src/Sidebar/ShopifySidebarSubItems.tsx` | **Create** | Phase 2 |
| `packages/ui/src/Sidebar/ShopifySidebarFooter.tsx` | **Create** | Phase 3 |
| `packages/ui/src/Sidebar/ShopifySidebarTooltip.tsx` | **Create** | Phase 2 |
| `packages/ui/src/Sidebar/index.ts` | **Update** | Add new exports alongside old |
| `packages/ui/src/Layout/AppLayout.tsx` | **Update** | Phase 4 |
| `packages/ui/src/Layout/DefaultNavigation.tsx` | **Update** | Phase 4 — new data model |
| `apps/web/pages/*.tsx` (all pages) | **Update** | Phase 4 — change `getDefaultSidebarSections()` call |

---

## 9. Do NOT Change

These files are out of scope for this redesign:

- `packages/ui/src/NavBar/NavBar.tsx` — top bar stays as-is
- `apps/web/styles/globals.css` — global iOS tokens stay unchanged
- `apps/web/pages/api/**` — no backend changes
- All GraphQL files — no data layer changes
- `docker-compose*.yml`, `Makefile` — no infra changes

---

## 10. Model Instructions (For AI Implementation)

When implementing any phase of this spec:

1. **Read this document first** — every decision is already made. Do not invent.

2. **Implementation order within a phase**:
   1. Types/interfaces first (`sidebar.types.ts`)
   2. Hooks/utilities second (pure functions, easy to verify)
   3. Leaf components third (`ShopifySidebarItem`, `ShopifySidebarSubItems`)
   4. Container components last (`ShopifySidebar`, `ShopifySidebarNav`)

3. **CSS rules**:
   - Use `var(--sp-*)` tokens from `sidebar.css` for ALL sidebar styles
   - Never use Tailwind color classes inside sidebar components (`text-gray-*`, `bg-green-*` etc.)
   - Tailwind layout utilities are fine: `flex`, `items-center`, `flex-1`, `w-full`, `overflow-hidden`

4. **Active state**: NEVER set `isActive` via click handlers. Always derive from URL via `useSidebarActive`.

5. **Navigation**: Use `router.push(href)` from `next/router`, NOT `window.location.href` (causes full page reload).

6. **Animation**: Use CSS transitions defined in `sidebar.css`, not inline `style` transitions.

7. **TypeScript**: All props must use types from `sidebar.types.ts`. No `any`.

8. **Backwards compatibility**: Keep old `Sidebar`, `SidebarItem` exports alongside new ones in `index.ts` until all pages are migrated (Phase 4 completes the migration).

9. **Testing each phase**: After each phase, run the Playwright script at `/tmp/drive-luxgen.js` and view the screenshots to verify the sidebar renders correctly on all pages.

10. **One phase at a time**: Do not skip phases. Phase 2 depends on Phase 1's types. Phase 3 depends on Phase 2's components.
