import React, { useState, useEffect, useRef } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';
import { getTenantLogo } from '../tenant-config';
import { useTenant } from '../TenantProvider';

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

  // Get tenant-specific logo from runtime tenant detection
  const { tenantConfig } = useTenant();
  const tenantLogo = logo || tenantConfig.logo;
  
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

  // Handle user actions
  const handleUserAction = (action: 'profile' | 'settings' | 'logout') => {
    onUserAction?.(action);
    setIsUserMenuOpen(false);
  };

  // Handle navigation - Removed since navItems are removed

  // Get variant styles
  const getVariantStyles = () => {
    const colors = tenantTheme?.colors || defaultTheme.colors;
    
    switch (variant) {
      case 'transparent':
        return {
          bg: isScrolled ? 'bg-white/95 backdrop-blur-sm' : 'bg-transparent',
          border: isScrolled ? 'border-b border-gray-200' : 'border-b border-transparent',
          text: 'text-gray-900',
          shadow: isScrolled ? 'shadow-sm' : 'shadow-none',
        };
      case 'solid':
        return {
          bg: 'bg-gray-900',
          border: 'border-b border-gray-800',
          text: 'text-white',
          shadow: 'shadow-lg',
        };
      case 'minimal':
        return {
          bg: 'bg-white',
          border: 'border-b border-gray-100',
          text: 'text-gray-900',
          shadow: 'shadow-none',
        };
      case 'default':
      default:
        return {
          bg: 'bg-white',
          border: 'border-b border-gray-200',
          text: 'text-gray-900',
          shadow: 'shadow-sm',
        };
    }
  };

  // Get responsive styles
  const getResponsiveStyles = () => {
    if (!responsive) return {};
    
    return {
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full overflow-hidden',
      nav: 'flex justify-between items-center h-16 overflow-hidden',
      logo: 'flex-shrink-0 overflow-hidden',
      logoText: 'text-xl font-bold truncate',
      logoImage: 'h-8 w-8 flex-shrink-0',
      desktopNav: 'hidden md:flex md:items-center md:space-x-8 overflow-hidden',
      mobileNav: 'md:hidden overflow-hidden',
      search: 'hidden md:flex md:items-center md:ml-6 overflow-hidden',
      mobileSearch: 'px-3 py-2 overflow-hidden',
      actions: 'flex items-center space-x-4 overflow-hidden',
      userMenu: 'relative overflow-hidden',
      mobileMenu: 'md:hidden overflow-hidden',
      mobileMenuButton: 'md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200 flex-shrink-0',
    };
  };

  const styles = getVariantStyles();
  const responsiveStyles = getResponsiveStyles();
  const positionClass = position === 'fixed' ? 'fixed' : position === 'sticky' ? 'sticky' : 'static';

  return (
    <nav
      className={`
        ${positionClass} top-0 left-0 right-0 z-50
        ${styles.bg} ${styles.border} ${styles.text} ${styles.shadow}
        transition-all duration-300 ease-in-out
        overflow-hidden
        ${className}
      `}
      style={{ 
        position: 'fixed',
        width: '100%',
        height: '64px',
        overflow: 'hidden'
      }}
      {...props}
    >
      <div className={`${responsiveStyles.container} h-full overflow-hidden`}>
        <div className={`${responsiveStyles.nav} h-full overflow-hidden`}>
          {/* Logo */}
          <div className={responsiveStyles.logo}>
            <a
              href={tenantLogo.href || '/'}
              className="flex items-center space-x-2"
            >
              {tenantLogo.src ? (
                <img
                  src={tenantLogo.src}
                  alt={tenantLogo.alt || 'Logo'}
                  className={responsiveStyles.logoImage}
                />
              ) : null}
              <span className={`${responsiveStyles.logoText} text-green-600`}>
                {tenantLogo.text}
              </span>
            </a>
          </div>

          {/* Desktop Navigation - Removed navItems */}

          {/* Search Bar */}
          {showSearch && (
            <div className={responsiveStyles.search}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
            </div>
          )}

          {/* Right Side Actions */}
          <div className={responsiveStyles.actions}>
            {/* Notifications */}
            {showNotifications && (
              <button
                onClick={onNotificationClick}
                className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* User Menu */}
            {showUserMenu && user && (
              <div className={responsiveStyles.userMenu} ref={userMenuRef}>
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.tenant && (
                        <p className="text-xs text-gray-400 mt-1">
                          {user.tenant.name} ({user.tenant.subdomain})
                        </p>
                      )}
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => handleUserAction('profile')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => handleUserAction('settings')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => handleUserAction('logout')}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Login/Register Buttons (when user is not logged in) */}
            {!user && (
              <div className="flex items-center space-x-2">
                <a
                  href="/login"
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                >
                  Sign Up
                </a>
              </div>
            )}

            {/* Mobile Menu Button */}
            {showMobileMenu && (
              <button
                onClick={handleMobileMenuToggle}
                className={responsiveStyles.mobileMenuButton}
              >
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

        {/* Mobile Menu */}
        {showMobileMenu && isMobileMenuOpen && (
          <div className={responsiveStyles.mobileMenu} ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {/* Mobile Search */}
              {showSearch && (
                <div className={responsiveStyles.mobileSearch}>
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </form>
                </div>
              )}

              {/* Mobile Navigation Items - Removed navItems */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export const NavBar = withSSR(NavBarComponent);