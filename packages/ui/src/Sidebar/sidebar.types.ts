import React from 'react';

// ─── Badge ────────────────────────────────────────────────────────────────────

export interface NavBadge {
  /** Numeric count (e.g. 12 pending orders) */
  count?: number;
  /** Short text label (e.g. "New", "Beta", "AI") — shown instead of count when both present */
  label?: string;
  /** Visual colour variant */
  variant: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
}

// ─── Navigation item ──────────────────────────────────────────────────────────

export interface NavItem {
  /** Unique identifier — used for active detection and keyboard focus management */
  id: string;
  /** Display label shown next to the icon */
  label: string;
  /**
   * Navigation target.
   * Omit when the item is a parent-only accordion toggle (no direct href).
   */
  href?: string;
  /**
   * 20×20px SVG React node.
   * Use FILLED (solid) icons — not outline. Filled icons read better at 20px.
   */
  icon?: React.ReactNode;
  /** Optional badge (count or short text) rendered on the right side of the row */
  badge?: NavBadge;
  /**
   * Child items — renders an accordion sub-nav when the parent is clicked.
   * Child items must NOT have their own icons (label-only in sub-nav).
   */
  children?: NavItem[];
  /** Opens href in a new tab. Renders an external link icon automatically. */
  external?: boolean;
  /** Renders greyed out, ignores all click events */
  disabled?: boolean;
  /**
   * Require exact pathname match for active detection.
   * Default: prefix match (/courses matches /courses/create).
   * Set exact: true for Home/Dashboard to prevent it matching everything.
   */
  exact?: boolean;
}

// ─── Navigation section ───────────────────────────────────────────────────────

export interface NavSection {
  /** Unique identifier */
  id: string;
  /**
   * Optional visible label above the section.
   * Section labels are HIDDEN for primary nav.
   * Use showTitle: true only for labelled footer sections.
   */
  title?: string;
  /** Whether to render the title string above the items (default: false) */
  showTitle?: boolean;
  /** Nav items in this section */
  items: NavItem[];
  /**
   * Renders a 1px separator line above this section.
   * Use for the footer section to visually separate it from main nav.
   */
  separator?: boolean;
}

// ─── Tenant (store switcher) ──────────────────────────────────────────────────

export interface SidebarTenant {
  id: string;
  /** Display name shown in the header and dropdown */
  name: string;
  /** Subdomain slug (e.g. "demo", "idea-vibes") — used in URL ?tenant= param */
  subdomain: string;
  /** Absolute URL to logo image. If absent, initials avatar is shown instead. */
  logoUrl?: string;
  /**
   * Brand hex color for the initials avatar background.
   * Falls back to var(--lux-color-accent).
   */
  color?: string;
  /** Plan badge label shown in the dropdown (e.g. "Pro", "Enterprise") */
  plan?: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface SidebarUser {
  name: string;
  email: string;
  role?: string;
  /** Absolute URL to avatar image. If absent, initials are shown. */
  avatarUrl?: string;
  /**
   * 1-2 character initials for the avatar fallback.
   * Defaults to first letter of name if omitted.
   */
  initials?: string;
}

// ─── Sidebar props (public API) ───────────────────────────────────────────────

export interface LuxSidebarProps {
  /** Primary navigation sections (scrollable area) */
  sections: NavSection[];
  /**
   * Sections pinned to the bottom footer (Settings, Help, etc.).
   * These are always visible — they never scroll away.
   */
  footerSections?: NavSection[];
  /** Currently active tenant displayed in the header */
  tenant?: SidebarTenant;
  /**
   * All tenants the user can switch between.
   * When length > 1, the header becomes a clickable tenant switcher.
   */
  tenants?: SidebarTenant[];
  /** Called when user selects a different tenant in the dropdown */
  onTenantSwitch?: (tenant: SidebarTenant) => void;
  /** User displayed in the footer user card */
  user?: SidebarUser;
  /** Called when user taps Profile, Settings, or Log out in the footer menu */
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  /** Start in collapsed (icon-only) mode. Default: false. */
  defaultCollapsed?: boolean;
  /**
   * Controlled collapsed state.
   * When provided, overrides internal state. Pair with onCollapsedChange.
   */
  collapsed?: boolean;
  /** Called when the sidebar's collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Pixel width when expanded. Default: 240 */
  expandedWidth?: number;
  /** Pixel width when collapsed (icon-only strip). Default: 48 */
  collapsedWidth?: number;
}

// ─── Internal state ───────────────────────────────────────────────────────────
// Managed entirely inside LuxSidebar via context. Not exposed as props.

export interface SidebarInternalState {
  collapsed: boolean;
  searchQuery: string;
  /** Item IDs whose accordion children are open */
  expandedItems: Set<string>;
  /** Currently keyboard-focused item ID (virtual focus, not DOM focus) */
  focusedItemId: string | null;
}

// ─── Context shape (passed to all sub-components via React.createContext) ──────

export interface SidebarContextValue extends SidebarInternalState {
  /** Active item ID derived from current URL */
  activeItemId: string | null;
  /** Item IDs that should be auto-expanded because a child URL is active */
  expandedByUrl: Set<string>;
  setCollapsed: (v: boolean) => void;
  setSearchQuery: (v: string) => void;
  toggleItem: (id: string) => void;
  setFocusedItemId: (id: string | null) => void;
}
