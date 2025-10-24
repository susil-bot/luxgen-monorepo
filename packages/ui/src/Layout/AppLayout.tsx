import React, { useState, useEffect } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';
import { NavBar, NavItem, UserMenu } from '../NavBar';
import { Sidebar, SidebarSection } from '../Sidebar';
import { MenuLayer, MenuItem } from '../Menu';
import { TenantProvider } from '../TenantProvider';

export interface AppLayoutProps {
  tenantTheme?: TenantTheme;
  children: React.ReactNode;
  navItems?: NavItem[];
  sidebarSections?: SidebarSection[];
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
  sidebarCollapsible?: boolean;
  sidebarDefaultCollapsed?: boolean;
  responsive?: boolean;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  desktopBreakpoint?: number;
}

const AppLayoutComponent: React.FC<AppLayoutProps> = ({
  tenantTheme = defaultTheme,
  children,
  navItems = [],
  sidebarSections = [],
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
  sidebarCollapsible = true,
  sidebarDefaultCollapsed = false,
  responsive = true,
  mobileBreakpoint = 640,
  tabletBreakpoint = 768,
  desktopBreakpoint = 1024,
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(sidebarDefaultCollapsed);
  const [menuCollapsed, setMenuCollapsed] = useState(menuDefaultCollapsed);

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
    
    return 'flex-row';
  };

  const getSidebarStyles = () => {
    if (isMobile) {
      return sidebarCollapsed ? 'hidden' : 'fixed inset-0 z-50';
    }
    
    if (isTablet) {
      return sidebarCollapsed ? 'hidden' : 'fixed left-0 top-0 bottom-0 z-40';
    }
    
    return sidebarCollapsed ? 'w-16' : 'w-64';
  };

  const getMainContentStyles = () => {
    if (isMobile) {
      return 'w-full';
    }
    
    if (isTablet) {
      return 'w-full';
    }
    
    return sidebarCollapsed ? 'ml-16' : 'ml-64';
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

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMenuToggle = () => {
    setMenuCollapsed(!menuCollapsed);
  };

  return (
    <TenantProvider>
      <div className={`flex h-screen bg-gray-50 ${className}`} {...props}>
        {/* Sidebar - Always rendered */}
        {sidebarSections.length > 0 && (
          <Sidebar
            sections={sidebarSections}
            user={user}
            onUserAction={onUserAction}
            logo={logo}
            variant="default"
            position="fixed"
            width="normal"
            collapsible={sidebarCollapsible}
            defaultCollapsed={sidebarCollapsed}
            showUserSection={true}
            showLogo={true}
            className={`${getSidebarStyles()} shadow-sm`}
          />
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1">
          {/* NavBar - Always rendered */}
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
            position="fixed"
            className="shadow-sm"
          />

          {/* Menu Layer */}
          {menuItems.length > 0 && (
            <MenuLayer
              items={menuItems}
              variant={menuVariant}
              position={menuPosition}
              collapsible={menuCollapsible}
              defaultCollapsed={menuCollapsed}
              onToggle={handleMenuToggle}
              className={getMenuStyles()}
              responsive={responsive}
              mobileBreakpoint={mobileBreakpoint}
              tabletBreakpoint={tabletBreakpoint}
              desktopBreakpoint={desktopBreakpoint}
            />
          )}

          {/* Main Content - Dynamic children */}
          <main className={`flex-1 overflow-y-auto p-4 ${getMainContentStyles()}`} style={{ paddingTop: '80px' }}>
            {children}
          </main>
        </div>

        {/* Mobile Overlay */}
        {isMobile && !sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleSidebarToggle}
          />
        )}
      </div>
    </TenantProvider>
  );
};

export const AppLayout = withSSR(AppLayoutComponent);
