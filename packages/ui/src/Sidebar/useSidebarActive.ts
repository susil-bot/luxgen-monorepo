import { useMemo } from 'react';
import type { NavSection, NavItem } from './sidebar.types';

export interface ActiveState {
  /**
   * The ID of the deepest nav item whose href matches the current pathname.
   * null if no item matches.
   */
  activeItemId: string | null;
  /**
   * IDs of parent items that must be auto-expanded because a descendant is active.
   * Used by LuxSidebarNav to open accordion sections on page load.
   */
  expandedByUrl: Set<string>;
}

/**
 * Derive active nav state from the current URL pathname.
 *
 * Pure computation — no side effects, fully testable without mocking Next.js router.
 * Call as: const { activeItemId, expandedByUrl } = useSidebarActive(sections, pathname);
 *
 * Active detection rules:
 *   - Default: PREFIX match — /courses matches /courses, /courses/create, /courses/1
 *   - item.exact = true: requires exact match — /dashboard must equal /dashboard
 *   - Deepest match wins: if /courses/create matches both 'courses' and 'create-course',
 *     activeItemId = 'create-course' (the child), and 'courses' goes into expandedByUrl
 */
export function useSidebarActive(sections: NavSection[], pathname: string): ActiveState {
  return useMemo(() => {
    let activeItemId: string | null = null;
    const expandedByUrl = new Set<string>();

    const checkItem = (item: NavItem, ancestorIds: string[]) => {
      // Check if this item's href matches the current pathname
      const selfMatches = item.href
        ? item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + '/')
        : false;

      if (selfMatches) {
        activeItemId = item.id;
        // All ancestors need to be expanded so this active item is visible
        ancestorIds.forEach((id) => expandedByUrl.add(id));
      }

      // Recurse into children, passing this item's id as an ancestor
      if (item.children?.length) {
        item.children.forEach((child) => checkItem(child, [...ancestorIds, item.id]));
      }
    };

    // Walk all sections and all items (depth-first)
    // Items are checked in document order; the last match wins (deepest child wins
    // because children are checked after their parent).
    sections.forEach((section) => {
      section.items.forEach((item) => checkItem(item, []));
    });

    return { activeItemId, expandedByUrl };
  }, [sections, pathname]);
}
