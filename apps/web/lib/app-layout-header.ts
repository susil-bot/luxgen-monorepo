import { useCallback, useEffect, useState } from 'react';
import { useTheme as useAppearanceTheme } from './theme';
import { dispatchToggleNotifications } from './global-notifications';
import { dispatchOpenGlobalSearch } from './global-search';
import { useNotificationCount } from '../hooks/useNotificationCount';
import { validateClientSession } from './session-guard';

function shortcutBadgeLabel(): string {
  if (typeof navigator === 'undefined') return '⌘K';
  const mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform) || /Mac OS/.test(navigator.userAgent);
  return mac ? '⌘K' : 'Ctrl+K';
}

/** Shared header props: search bar + light/dark toggle for AppLayout */
export function useAppLayoutHeader() {
  const { resolvedTheme, toggleTheme } = useAppearanceTheme();
  const [sessionOk, setSessionOk] = useState(false);
  const [searchShortcutBadge, setSearchShortcutBadge] = useState('⌘K');
  const notificationCount = useNotificationCount(sessionOk ? 60_000 : 0);

  useEffect(() => {
    const refresh = () => setSessionOk(validateClientSession().ok);
    refresh();
    window.addEventListener('luxgen-auth-change', refresh);
    return () => window.removeEventListener('luxgen-auth-change', refresh);
  }, []);

  useEffect(() => {
    setSearchShortcutBadge(shortcutBadgeLabel());
  }, []);

  const onSearchFocus = useCallback(() => {
    dispatchOpenGlobalSearch();
  }, []);

  const onSearch = useCallback((query: string) => {
    dispatchOpenGlobalSearch(query);
  }, []);

  return {
    showSearch: true,
    showThemeToggle: true,
    isDarkMode: resolvedTheme === 'dark',
    onThemeToggle: toggleTheme,
    onSearch,
    onSearchFocus,
    searchPlaceholder: 'Search anything…',
    searchShortcutBadge,
    showNotifications: sessionOk,
    notificationCount,
    onNotificationClick: dispatchToggleNotifications,
  };
}
