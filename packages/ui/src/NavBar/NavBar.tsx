import React, { useState, useEffect, useRef } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';
import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
  external?: boolean;
  disabled?: boolean;
}

export interface UserMenu {
  avatar?: string;
  name: string;
  email: string;
  role?: string;
  tenant?: {
    name: string;
    subdomain: string;
  };
}

export interface NavBarProps {
  tenantTheme?: TenantTheme;
  logo?: {
    src?: string;
    alt?: string;
    text?: string;
    href?: string;
  };
  user?: UserMenu | null;
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  onMobileMenuToggle?: (isOpen: boolean) => void;
  className?: string;
  variant?: 'default' | 'transparent' | 'solid' | 'minimal';
  position?: 'fixed' | 'sticky' | 'static';
  showUserMenu?: boolean;
  showMobileMenu?: boolean;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  responsive?: boolean;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  desktopBreakpoint?: number;
}

const NavBarComponent: React.FC<NavBarProps> = ({
  tenantTheme = defaultTheme,
  logo,
  user = null,
  onUserAction,
  onMobileMenuToggle,
  className = '',
  variant = 'default',
  position = 'sticky',
  showUserMenu = true,
  showMobileMenu = true,
  showSearch = false,
  onSearch,
  searchPlaceholder = 'Search...',
  showNotifications = false,
  notificationCount = 0,
  onNotificationClick,
  responsive = true,
  mobileBreakpoint = 640,
  tabletBreakpoint = 768,
  desktopBreakpoint = 1024,
  ...props
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Get tenant-specific logo and theme from global context
  const { tenantConfig } = useGlobalContext();
  const { theme } = useTheme();
  const { user: dynamicUser, isLoading: userLoading, logout: userLogout } = useUser();
  const tenantLogo = logo || tenantConfig.branding.logo;
  
  // Use dynamic user data if available, fallback to prop
  const currentUser = dynamicUser || user;

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < mobileBreakpoint);
      setIsTablet(width >= mobileBreakpoint && width < tabletBreakpoint);
      setIsDesktop(width >= desktopBreakpoint);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileBreakpoint, tabletBreakpoint, desktopBreakpoint]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        onMobileMenuToggle?.(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onMobileMenuToggle]);

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMobileMenuToggle?.(newState);
  };

  // Handle user menu toggle
  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  // Handle notifications
  const handleNotificationClick = () => {
    onNotificationClick?.();
  };

  // Handle user actions
  const handleUserAction = (action: 'profile' | 'settings' | 'logout') => {
    if (action === 'logout') {
      userLogout();
    }
    onUserAction?.(action);
    setIsUserMenuOpen(false);
  };

  // Get variant styles
  const getVariantStyles = () => {
    const colors = theme?.colors || defaultTheme.colors;

    switch (variant) {
      case 'transparent':
        return {
          bg: 'bg-transparent',
          border: '',
          text: 'text-[var(--color-text)]',
          shadow: '',
        };
      case 'solid':
        return {
          bg: `bg-[${colors.primary}]`,
          border: '',
          text: 'text-white',
          shadow: 'shadow-md',
        };
      case 'minimal':
        return {
          bg: 'bg-[var(--color-surface)]',
          border: '',
          text: 'text-[var(--color-text)]',
          shadow: '',
        };
      case 'default':
      default:
        return {
          bg: 'bg-[var(--color-surface)]',
          border: 'border-b border-[var(--color-border)]',
          text: 'text-[var(--color-text)]',
          shadow: 'shadow-sm',
        };
    }
  };

  const styles = getVariantStyles();
  const positionClass = position === 'fixed' ? 'fixed' : position === 'sticky' ? 'sticky' : 'static';

  return (
    <nav
      className={`
        ${positionClass} top-0 left-0 right-0 z-50
        ${styles.bg} ${styles.border} ${styles.text} ${styles.shadow}
        transition-all duration-300 ease-in-out
        ${className}
      `}
      style={{
        position: 'fixed',
        width: '100%',
        height: '64px',
      }}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a
              href={tenantLogo.href || '/'}
              className="flex items-center space-x-2"
            >
              {tenantLogo.src ? (
                <img
                  src={tenantLogo.src}
                  alt={tenantLogo.alt || 'Logo'}
                  className="h-8 w-8"
                />
              ) : null}
              <span
                className="text-xl font-bold"
                style={{ color: theme.colors.primary }}
              >
                {tenantLogo.text}
              </span>
            </a>
          </div>

          {/* Search Bar - Desktop Only */}
          {showSearch && !isMobile && (
            <div className="hidden md:flex md:items-center md:ml-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {showNotifications && (
              <button
                onClick={handleNotificationClick}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200 relative"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* User Menu */}
            {showUserMenu && currentUser && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={handleUserMenuToggle}
                  className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <span className="sr-only">Open user menu</span>
                  {currentUser.avatar ? (
                    <img className="h-8 w-8 rounded-full" src={currentUser.avatar} alt={currentUser.name} />
                  ) : (
                    <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>
                {isUserMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="block px-4 py-2 text-sm text-gray-700">
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-gray-500">{currentUser.email}</p>
                      {currentUser.role && (
                        <p className="text-xs text-gray-400">{currentUser.role}</p>
                      )}
                    </div>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => handleUserAction('profile')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Your Profile
                    </button>
                    <button
                      onClick={() => handleUserAction('settings')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => handleUserAction('logout')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            {showMobileMenu && (
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={handleMobileMenuToggle}
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && isMobileMenuOpen && (
        <div className="md:hidden" ref={mobileMenuRef}>
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
            {/* Mobile Search */}
            {showSearch && (
              <div className="px-3 py-2">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export const NavBar = withSSR(NavBarComponent);