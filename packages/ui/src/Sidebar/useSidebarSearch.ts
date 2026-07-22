import { useMemo } from 'react';
import type { NavSection, NavItem } from './sidebar.types';

/**
 * Filter the navigation tree by a search query.
 *
 * Rules:
 *   - Empty / whitespace query → returns the full sections array unchanged (no copy).
 *   - Matching is case-insensitive substring on item.label.
 *   - If a PARENT item matches: it is included with ALL its children (don't hide children
 *     when the parent already matched — user searched "courses", show all sub-items).
 *   - If a CHILD item matches but the parent doesn't: include the parent as a container
 *     but only with the matching children.
 *   - Sections with zero matching items are removed from the result.
 *   - The original data is never mutated — returns new objects.
 *
 * Pure computation — no side effects, testable without React environment.
 */
export function useSidebarSearch(sections: NavSection[], query: string): NavSection[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;

    const filterItem = (item: NavItem): NavItem | null => {
      const labelMatch = item.label.toLowerCase().includes(q);

      if (labelMatch) {
        // Parent matches → include the item with all its children intact
        return item;
      }

      if (item.children?.length) {
        // Check children
        const matchingChildren = item.children.map(filterItem).filter((c): c is NavItem => c !== null);

        if (matchingChildren.length > 0) {
          // Parent doesn't match but has matching children → include parent as container
          return { ...item, children: matchingChildren };
        }
      }

      return null;
    };

    const filteredSections: NavSection[] = [];

    for (const section of sections) {
      const filteredItems = section.items.map(filterItem).filter((item): item is NavItem => item !== null);

      if (filteredItems.length > 0) {
        filteredSections.push({ ...section, items: filteredItems });
      }
    }

    return filteredSections;
  }, [sections, query]);
}
