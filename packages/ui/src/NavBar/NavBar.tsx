import React, { useState, useEffect } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';

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
  items?: NavItem[];
  user?: UserMenu | null;
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  onMobileMenuToggle?: (isOpen: boolean) => void;
  className?: string;
  variant?: 'default' | 'transparent' | 'solid';
  position?: 'fixed' | 'sticky' | 'static';
  showUserMenu?: boolean;
  showMobileMenu?: boolean;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const NavBarComponent: React.FC<NavBarProps> = ({
  tenantTheme = defaultTheme,
  logo = {
    text: 'LuxGen',
    href: '/',
  },
  items = [],
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
  ...props
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Handle navigation
  const handleNavClick = (item: NavItem) => {
    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = item.href;
    }
  };

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
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a
              href={logo.href || '/'}
              className="flex items-center space-x-2 text-xl font-bold"
            >
              {logo.src ? (
                <img
                  src={logo.src}
                  alt={logo.alt || 'Logo'}
                  className="h-8 w-8"
                />
              ) : null}
              <span className="text-green-600">{logo.text}</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavClick(item)}
                  disabled={item.disabled}
                  className={`
                    flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium
                    hover:bg-gray-100 transition-colors duration-200
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {item.children && item.children.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleNavClick(child)}
                          disabled={child.disabled}
                          className={`
                            block w-full text-left px-4 py-2 text-sm text-gray-700
                            hover:bg-gray-100 transition-colors duration-200
                            ${child.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          {child.icon && <span className="mr-2">{child.icon}</span>}
                          {child.label}
                          {child.badge && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                              {child.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="hidden md:flex md:items-center md:ml-6">
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
          <div className="flex items-center space-x-4">
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
              <div className="relative">
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
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
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
          <div className="md:hidden">
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

              {/* Mobile Navigation Items */}
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  disabled={item.disabled}
                  className={`
                    block w-full text-left px-3 py-2 rounded-md text-base font-medium
                    hover:bg-gray-100 transition-colors duration-200
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isUserMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMobileMenuOpen(false);
            onMobileMenuToggle?.(false);
          }}
        />
      )}
    </nav>
  );
};

export const NavBar = withSSR(NavBarComponent);
