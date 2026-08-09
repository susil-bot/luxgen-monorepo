import React from 'react';
import { NavItem, UserMenu } from '../index';
import { SidebarSection } from '../Sidebar/Sidebar';

/**
 * Flat nav list used by UserDashboardLayout/AdminDashboardLayout (a simpler layout variant,
 * distinct from AppLayout+Sidebar's DEFAULT_SIDEBAR_SECTIONS below, which is what actual pages
 * use). Kept as-is — every href here is a real, live route. Not touched by the domain-grouping
 * rework below since these two layouts don't render sectioned/nested nav.
 */
export const getDefaultNavItems = (): NavItem[] => [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'courses', label: 'Courses', href: '/courses' },
  { id: 'groups', label: 'Groups', href: '/groups' },
  { id: 'users', label: 'Users', href: '/users' },
  { id: 'analytics', label: 'Analytics', href: '/analytics' },
  { id: 'settings', label: 'Settings', href: '/settings' },
];

/**
 * Sidebar grouped by business domain, not by code layer — see docs/PRODUCT_ARCHITECTURE.md and
 * docs/MENU_STRUCTURE.md. All `href`s are unchanged from the previous flat grouping; this pass
 * only reorganizes which section each item lives under and a few labels
 * (Groups -> Teams, section titles), so no route/redirect changes are needed anywhere else in
 * the app. See docs/AGENT_ORCHESTRATOR.md-adjacent PR for the accompanying doc rewrite.
 */
export const DEFAULT_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: 'home',
    title: 'Home',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        exact: true,
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'search',
    title: 'Search',
    items: [
      {
        id: 'global-search',
        label: 'Search',
        href: '/search',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        ),
        // T-SRCH-08: was an orphan page (route existed, nothing linked to it) — reachable from here now.
        children: [
          { id: 'search-home', label: 'Search', href: '/search', exact: true },
          { id: 'search-analytics', label: 'Search analytics', href: '/admin/search-analytics' },
        ],
      },
    ],
  },
  {
    id: 'learning',
    title: 'Learning',
    items: [
      {
        id: 'courses',
        label: 'Courses',
        href: '/courses',
        children: [
          { id: 'all-courses', label: 'All Courses', href: '/courses', exact: true },
          { id: 'my-courses', label: 'My Courses', href: '/courses/my-courses' },
          { id: 'create-course', label: 'Create Course', href: '/courses/create' },
          { id: 'course-analytics', label: 'Course Analytics', href: '/courses/analytics' },
        ],
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        ),
      },
      {
        id: 'certificates',
        label: 'Certificates',
        href: '/certificates',
        children: [
          { id: 'issued-certificates', label: 'Issued certificates', href: '/certificates', exact: true },
          { id: 'my-certificates', label: 'My certificates', href: '/learn/certificates' },
        ],
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'commerce',
    title: 'Commerce',
    items: [
      {
        id: 'products',
        label: 'Products',
        href: '/products',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        ),
      },
      {
        id: 'orders',
        label: 'Orders',
        href: '/orders',
        badge: 21,
        children: [
          { id: 'orders-drafts', label: 'Drafts', href: '/orders/drafts' },
          { id: 'orders-abandoned', label: 'Abandoned checkouts', href: '/orders/abandoned' },
        ],
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        ),
      },
      {
        id: 'customers',
        label: 'Customers',
        href: '/admin/customers',
        children: [
          { id: 'all-customers', label: 'All customers', href: '/admin/customers', exact: true },
          { id: 'customers-segmentation', label: 'Segmentation', href: '/admin/customers/segmentation' },
          { id: 'create-customer', label: 'Add customer', href: '/admin/customers/create' },
        ],
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
      },
      {
        id: 'coupons',
        label: 'Coupons',
        href: '/coupons',
        children: [
          { id: 'all-coupons', label: 'All coupons', href: '/coupons', exact: true },
          { id: 'create-coupon', label: 'Create coupon', href: '/coupons/create' },
        ],
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'people',
    title: 'People',
    items: [
      {
        id: 'org-users',
        label: 'Users',
        href: '/organization/users',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ),
      },
      {
        id: 'org-roles',
        label: 'Roles',
        href: '/organization/roles',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        ),
      },
      {
        // href unchanged (/organization/groups) — that page is the canonical list view and
        // already links into /groups/create, /groups/[id], /groups/analytics, etc. for the
        // actual CRUD flows. Label renamed Groups -> Teams per the domain-model IA; no route
        // under /groups/* needed to change.
        id: 'org-groups',
        label: 'Teams',
        href: '/organization/groups',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'automation-hub',
    title: 'Automation Hub',
    items: [
      {
        id: 'automations',
        label: 'Automations',
        href: '/automations',
        children: [
          { id: 'automations-tower', label: 'Tower', href: '/automations/tower', exact: true },
          { id: 'automations-tower-runs', label: 'Recent Run Logs', href: '/automations/tower/runs' },
        ],
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        id: 'marketplace',
        label: 'Marketplace',
        href: '/marketplace',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'intelligence',
    title: 'Intelligence',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/analytics',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'workspace',
    title: 'Workspace',
    items: [
      {
        id: 'project',
        label: 'Project',
        href: '/project/iteration/current',
        children: [
          { id: 'project-current', label: 'Ongoing iteration', href: '/project/iteration/current' },
          { id: 'project-next', label: 'Next iteration', href: '/project/iteration/next' },
          { id: 'project-priority', label: 'Priority', href: '/project/priority' },
          { id: 'project-workflows', label: 'My workflows', href: '/project/workflows' },
        ],
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'listings',
    title: 'Listings',
    items: [
      {
        id: 'listings-directory',
        label: 'Directory',
        href: '/listings',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        ),
      },
      {
        id: 'my-listings',
        label: 'My applications',
        href: '/listings/my',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
      },
      {
        id: 'admin-listings',
        label: 'Review queue',
        href: '/admin/listings',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'administration',
    title: 'Administration',
    items: [
      {
        id: 'org-security',
        label: 'Security',
        href: '/organization/security',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        ),
      },
      {
        id: 'org-billing',
        label: 'Billing',
        href: '/organization/billing',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
            />
          </svg>
        ),
      },
      {
        // T-VERT-11 — gated to SUPER_ADMIN in apps/web/lib/use-sidebar-sections.ts's filterItem(),
        // same pattern as the 'agent-studio' item below being gated on a plan flag.
        id: 'tenant-map',
        label: 'Tenant Map',
        href: '/organization/tenant-map',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        ),
      },
      {
        id: 'agent-studio',
        label: 'Agent Studio',
        href: '/agent',
        children: [
          { id: 'agent-studio-chat', label: 'Agent Chat', href: '/agent', exact: true },
          { id: 'agent-studio-tasks', label: 'Task History', href: '/admin/agent-tasks' },
        ],
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    items: [
      {
        id: 'profile',
        label: 'Profile',
        href: '/profile',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ),
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ],
  },
];

export const getDefaultSidebarSections = (): SidebarSection[] => DEFAULT_SIDEBAR_SECTIONS;

/** @deprecated Layout/storybook placeholder only — never pass to AppLayout/NavBar on real pages. Use useLayoutUser() or transformUserDataFromSession(); omit `user` when guest. */
export const DEFAULT_USER: UserMenu = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'Admin',
  tenant: { name: 'Demo Platform', subdomain: 'demo' },
};

export const getDefaultUser = (): UserMenu => DEFAULT_USER;

export const getDefaultLogo = () => ({
  text: 'LuxGen',
  href: '/dashboard',
});
