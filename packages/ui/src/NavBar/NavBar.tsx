import React, { useState, useRef, useEffect } from 'react';
import { withSSR } from '../ssr';
import { SearchBar } from '../SearchBar';
import { AIStudioLogo } from '../AIStudio';
import { useAIStudioOptional } from '../AIStudio/AIStudioContext';

export interface UserMenu {
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  initials?: string;
}

export interface NavBarProps {
  user?: UserMenu;
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  /** Shopify Sidekick-style AI Studio trigger (replaces notifications when true). */
  showAIStudio?: boolean;
  onAIStudioClick?: () => void;
  showThemeToggle?: boolean;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  logo?: {
    text: string;
    href: string;
  };
  variant?: 'default' | 'compact' | 'minimal';
  position?: 'fixed' | 'sticky' | 'static';
  className?: string;
}

const NavBarComponent: React.FC<NavBarProps> = ({
  user,
  onUserAction,
  showSearch = true,
  onSearch,
  searchPlaceholder = 'Search',
  showNotifications = false,
  notificationCount = 0,
  onNotificationClick,
  showAIStudio = true,
  onAIStudioClick,
  showThemeToggle = false,
  isDarkMode = false,
  onThemeToggle,
  logo = { text: 'LuxGen', href: '/' },
  variant = 'default',
  position = 'fixed',
  className = '',
  ...props
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const aiStudio = useAIStudioOptional();

  const handleAIStudioClick = () => {
    if (onAIStudioClick) {
      onAIStudioClick();
      return;
    }
    aiStudio?.toggle();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    onSearch?.(query);
  };

  return (
    <nav
      className={`glass border-b ${className}`}
      style={{
        borderColor: 'var(--color-separator)',
        position: position === 'fixed' ? 'fixed' : position === 'sticky' ? 'sticky' : 'static',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '56px',
      }}
      {...props}
    >
      <div className="px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href={logo.href}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-label-primary)' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: 'var(--color-blue)' }}
            >
              L
            </div>
            <span className="text-base font-semibold hidden sm:inline">{logo.text}</span>
          </a>
        </div>

        {/* Search Bar — visible at all breakpoints */}
        {showSearch && (
          <div className="flex-1 min-w-0 max-w-md mx-2 sm:mx-4">
            <SearchBar placeholder={searchPlaceholder} onSearch={handleSearch} size="sm" />
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Light / dark mode */}
          {showThemeToggle && onThemeToggle && (
            <button
              type="button"
              onClick={onThemeToggle}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--color-label-secondary)' }}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-fill-quaternary)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          )}

          {/* AI Studio (Shopify Sidekick trigger) */}
          {showAIStudio && (
            <button
              type="button"
              onClick={handleAIStudioClick}
              className="relative p-1.5 rounded-lg transition-colors"
              style={{
                color: 'var(--color-label-secondary)',
                backgroundColor: aiStudio?.isOpen ? 'var(--color-fill-tertiary)' : 'transparent',
              }}
              aria-label="Open AI Studio"
              title="AI Studio"
              onMouseEnter={(e) => {
                if (!aiStudio?.isOpen) e.currentTarget.style.backgroundColor = 'var(--color-fill-quaternary)';
              }}
              onMouseLeave={(e) => {
                if (!aiStudio?.isOpen) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <AIStudioLogo size={18} />
            </button>
          )}

          {/* Legacy notifications bell */}
          {showNotifications && (
            <button
              type="button"
              onClick={onNotificationClick}
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: 'var(--color-label-secondary)' }}
              aria-label="Notifications"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-fill-quaternary)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notificationCount > 0 && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-red)' }}
                />
              )}
            </button>
          )}

          {/* User Menu */}
          {user && (
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--color-label-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-fill-quaternary)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: 'var(--color-blue)' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {isMobileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 surface-elevated rounded-xl py-2"
                  style={{ boxShadow: 'var(--shadow-lg)' }}
                >
                  <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-separator)' }}>
                    <p className="text-sm font-medium text-primary">{user.name}</p>
                    <p className="text-xs text-secondary">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onUserAction?.('profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-[var(--color-fill-quaternary)] transition-colors"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        onUserAction?.('settings');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-[var(--color-fill-quaternary)] transition-colors"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        onUserAction?.('logout');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-fill-quaternary)] transition-colors"
                      style={{ color: 'var(--color-red)' }}
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export const NavBar = withSSR(NavBarComponent);
