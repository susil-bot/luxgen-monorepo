import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTheme as useAppearanceTheme } from './theme';

/** Shared header props: search bar + light/dark toggle for AppLayout */
export function useAppLayoutHeader() {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useAppearanceTheme();

  const onSearch = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q) return;

      const path = router.pathname;
      if (path.startsWith('/products')) {
        void router.push({ pathname: '/products', query: { search: q } }, undefined, { shallow: true });
      } else if (path.startsWith('/groups')) {
        void router.push({ pathname: '/groups', query: { search: q } }, undefined, { shallow: true });
      } else if (path.startsWith('/users')) {
        void router.push({ pathname: '/users', query: { search: q } }, undefined, { shallow: true });
      } else if (path.startsWith('/courses')) {
        void router.push({ pathname: '/courses', query: { search: q } }, undefined, { shallow: true });
      } else if (path.startsWith('/customers')) {
        void router.push({ pathname: '/customers', query: { search: q } }, undefined, { shallow: true });
      } else {
        void router.push({ pathname: '/groups', query: { search: q } });
      }
    },
    [router],
  );

  return {
    showSearch: true,
    showThemeToggle: true,
    onNotificationClick: () => {},
    isDarkMode: resolvedTheme === 'dark',
    onThemeToggle: toggleTheme,
    onSearch,
    searchPlaceholder: 'Search groups, products, users…',
  };
}
