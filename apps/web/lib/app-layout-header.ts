import { useCallback, useEffect, useState } from 'react';
import { useTheme as useAppearanceTheme } from './theme';
import { dispatchToggleNotifications } from './global-notifications';
import { useNotificationCount } from '../hooks/useNotificationCount';
import { validateClientSession } from './session-guard';

/** Shared header props: search bar + light/dark toggle for AppLayout */
export function useAppLayoutHeader() {
  const { resolvedTheme, toggleTheme } = useAppearanceTheme();
  const [sessionOk, setSessionOk] = useState(false);
  const notificationCount = useNotificationCount(sessionOk ? 60_000 : 0);

  useEffect(() => {
    const refresh = () => setSessionOk(validateClientSession().ok);
    refresh();
    window.addEventListener('luxgen-auth-change', refresh);
    return () => window.removeEventListener('luxgen-auth-change', refresh);
  }, []);

  const onSearch = useCallback((query: string) => {
    const q = query.trim();
    if (!q || typeof window === 'undefined') return;
    const path = window.location.pathname;
    const url = new URL(window.location.href);
    url.searchParams.set('search', q);
    if (
      path.startsWith('/products') ||
      path.startsWith('/groups') ||
      path.startsWith('/users') ||
      path.startsWith('/courses') ||
      path.startsWith('/customers')
    ) {
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    const tenant = new URLSearchParams(window.location.search).get('tenant');
    const searchUrl = `/search?q=${encodeURIComponent(q)}${tenant ? `&tenant=${encodeURIComponent(tenant)}` : ''}`;
    window.location.assign(searchUrl);
  }, []);

  return {
    showSearch: true,
    showThemeToggle: true,
    isDarkMode: resolvedTheme === 'dark',
    onThemeToggle: toggleTheme,
    onSearch,
    searchPlaceholder: 'Search groups, products, users…',
    showNotifications: sessionOk,
    notificationCount,
    onNotificationClick: dispatchToggleNotifications,
  };
}
