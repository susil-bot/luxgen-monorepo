import React, { useState, useEffect } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';
import { NavBar, NavItem, UserMenu } from '../NavBar';
import { MenuLayer, MenuItem } from '../Menu';

export interface PageLayoutProps {
  tenantTheme?: TenantTheme;
  children: React.ReactNode;
  navItems?: NavItem[];
  menuItems?: MenuItem[];
  user?: UserMenu;
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
  searchPlaceholder?: string;
  logo?: {
    text: string;
    href: string;
  };
  className?: string;
  menuPosition?: 'top' | 'bottom' | 'left' | 'right';
  menuVariant?: 'default' | 'compact' | 'minimal';
  menuCollapsible?: boolean;
  menuDefaultCollapsed?: boolean;
  responsive?: boolean;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  desktopBreakpoint?: number;
  title?: string;
  description?: string;
}

const PageLayoutComponent: React.FC<PageLayoutProps> = ({
  tenantTheme = defaultTheme,
  children,
  navItems = [],
  menuItems = [],
  user,
  onUserAction,
  onSearch,
  onNotificationClick,
  showSearch = true,
  showNotifications = true,
  notificationCount = 0,
  searchPlaceholder = 'Search...',
  logo = {
    text: 'LuxGen',
    href: '/',
  },
  className = '',
  menuPosition = 'top',
  menuVariant = 'default',
  menuCollapsible = true,
  menuDefaultCollapsed = false,
  responsive = true,
  mobileBreakpoint = 640,
  tabletBreakpoint = 768,
  desktopBreakpoint = 1024,
  title,
  description,
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

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

  const getLayoutStyles = () => {
    if (isMobile) {
      return 'flex-col';
    }
    
    if (isTablet) {
      return 'flex-col';
    }
    
    return 'flex-col';
  };

  const getMenuStyles = () => {
    if (isMobile) {
      return 'fixed top-0 left-0 right-0 z-50';
    }
    
    if (isTablet) {
      return 'sticky top-0 z-40';
    }
    
    return 'sticky top-0 z-30';
  };

  const getContentStyles = () => {
    if (isMobile) {
      return 'w-full pt-16'; // Account for fixed navbar
    }
    
    if (isTablet) {
      return 'w-full pt-16'; // Account for sticky navbar
    }
    
    return 'w-full pt-16'; // Account for sticky navbar
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`} {...props}>
      {/* NavBar */}
      <NavBar
        user={user}
        onUserAction={onUserAction}
        showSearch={showSearch}
        onSearch={onSearch}
        searchPlaceholder={searchPlaceholder}
        showNotifications={showNotifications}
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
        logo={logo}
        variant="default"
        position="sticky"
        className="shadow-sm"
      />

      {/* Menu Layer */}
      {menuItems.length > 0 && (
        <MenuLayer
          items={menuItems}
          variant={menuVariant}
          position={menuPosition}
          collapsible={menuCollapsible}
          defaultCollapsed={menuDefaultCollapsed}
          className={getMenuStyles()}
          responsive={responsive}
          mobileBreakpoint={mobileBreakpoint}
          tabletBreakpoint={tabletBreakpoint}
          desktopBreakpoint={desktopBreakpoint}
        />
      )}

      {/* Main Content */}
      <main className={getContentStyles()}>
        {children}
      </main>
    </div>
  );
};

export const PageLayout = withSSR(PageLayoutComponent);
