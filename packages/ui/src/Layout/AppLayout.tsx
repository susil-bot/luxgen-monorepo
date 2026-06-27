import React, { useState, useEffect, useCallback, useRef } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';
import { NavBar, NavItem, UserMenu } from '../NavBar';
import { Sidebar } from '../Sidebar/Sidebar';
import type { SidebarSection } from '../Sidebar/Sidebar';
import { MenuItem } from '../Menu';
import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';
import { useNavTenantSwitch } from '../context/NavTenantSwitchContext';
import { AIStudioSidekick } from '../AIStudio';
import { useAIStudioOptional } from '../AIStudio/AIStudioContext';
// import { ErrorBoundary } from '../ErrorBoundary';

export interface AppLayoutProps {
  tenantTheme?: TenantTheme;
  children: React.ReactNode;
  navItems?: NavItem[];
  sidebarSections?: SidebarSection[];
  menuItems?: MenuItem[];
  user?: UserMenu;
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  /** Current route pathname — enables URL-based sidebar active state */
  pathname?: string;
  /** Client-side navigation (e.g. Next.js router.push). Falls back to location.href */
  onNavigate?: (href: string) => void;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  showAIStudio?: boolean;
  onAIStudioClick?: () => void;
  notificationCount?: number;
  searchPlaceholder?: string;
  showThemeToggle?: boolean;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
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
  /** When true (default), constrain main content to max-w-7xl. Set false for full-bleed editors. */
  contentMaxWidth?: boolean;
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
  pathname,
  onNavigate,
  onSearch,
  onNotificationClick,
  showSearch = true,
  showNotifications = false,
  showAIStudio = true,
  onAIStudioClick,
  notificationCount = 0,
  searchPlaceholder = 'Search...',
  showThemeToggle = false,
  isDarkMode = false,
  onThemeToggle,
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
  contentMaxWidth = true,
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
  const [hasError, setHasError] = useState(false);

  // Refs for analytics and performance tracking
  const layoutRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Get tenant context for analytics
  const { currentTenant, tenantConfig } = useGlobalContext();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const resolvedPathname = pathname ?? navigation.pathname;
  const resolvedNavigate = onNavigate ?? navigation.onNavigate;
  const aiStudio = useAIStudioOptional();
  const navTenantSwitch = useNavTenantSwitch();

  // Analytics tracking functions
  const trackLayoutEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, {
          tenant: currentTenant,
          ...properties,
        });
      }
      console.log(`📊 Layout Event: ${eventName}`, { tenant: currentTenant, ...properties });
    },
    [currentTenant],
  );

  const trackUserInteraction = useCallback(
    (action: string, target: string) => {
      trackLayoutEvent('user_interaction', {
        action,
        target,
        timestamp: Date.now(),
      });
    },
    [trackLayoutEvent],
  );

  // Error handling
  const handleError = useCallback(
    (error: Error, errorInfo?: any) => {
      console.error('AppLayout Error:', error, errorInfo);
      setHasError(true);
      trackLayoutEvent('layout_error', {
        error: error.message,
        stack: error.stack,
      });
    },
    [trackLayoutEvent],
  );

  // Performance tracking
  const trackPerformance = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        trackLayoutEvent('layout_performance', {
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          firstPaint: perfData.loadEventEnd - perfData.fetchStart,
        });
      }
    }
  }, [trackLayoutEvent]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < mobileBreakpoint);
      setIsTablet(width >= mobileBreakpoint && width < tabletBreakpoint);
      setIsDesktop(width >= desktopBreakpoint);

      // Track responsive breakpoint changes
      trackLayoutEvent('responsive_change', {
        width,
        breakpoint: width < mobileBreakpoint ? 'mobile' : width < tabletBreakpoint ? 'tablet' : 'desktop',
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileBreakpoint, tabletBreakpoint, desktopBreakpoint, trackLayoutEvent]);

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
      return sidebarCollapsed ? 'hidden' : '';
    }

    if (isTablet) {
      return sidebarCollapsed ? 'hidden' : '';
    }

    return '';
  };

  const getMainContentStyles = () => {
    if (isMobile || isTablet) {
      return 'w-full';
    }

    return sidebarCollapsed ? 'ml-[var(--lux-sidebar-collapsed-w)]' : 'ml-[var(--lux-sidebar-expanded-w)]';
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
    trackUserInteraction('menu_toggle', 'menu');
  };

  // Initialize layout analytics once
  useEffect(() => {
    trackLayoutEvent('layout_initialized', {
      tenant: currentTenant,
      theme: theme.colors.primary,
      responsive: responsive,
    });
    const timer = window.setTimeout(trackPerformance, 1000);
    return () => window.clearTimeout(timer);
  }, [currentTenant, theme.colors.primary, responsive, trackLayoutEvent, trackPerformance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      trackLayoutEvent('layout_unmounted');
    };
  }, [trackLayoutEvent]);

  // Show error state
  if (hasError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div className="text-center p-8">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Layout Error</h2>
          <p className="text-gray-600 mb-4">There was an error loading the layout. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md text-white transition-colors"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={layoutRef}
      className={`flex h-screen ${className}`}
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
      {...props}
    >
      {/* Sidebar - Always rendered */}
      {sidebarSections.length > 0 && (
        <Sidebar
          sections={sidebarSections}
          user={user}
          onUserAction={onUserAction}
          logo={logo}
          pathname={resolvedPathname}
          onNavigate={resolvedNavigate}
          variant="default"
          position="fixed"
          width="normal"
          collapsible={sidebarCollapsible}
          defaultCollapsed={sidebarDefaultCollapsed}
          onToggle={setSidebarCollapsed}
          showUserSection={true}
          showLogo={true}
          className={getSidebarStyles()}
        />
      )}

      {/* Main Content Area + optional Sidekick column */}
      <div className="flex flex-1 min-w-0">
        <div className="flex flex-col flex-1 min-w-0">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--color-bg-secondary)] focus:text-[var(--color-label-primary)]">
            Skip to content
          </a>
          {/* NavBar - Always rendered */}
          <NavBar
            user={user}
            tenantSwitch={
              navTenantSwitch
                ? {
                    currentSubdomain: navTenantSwitch.currentSubdomain,
                    tenants: navTenantSwitch.tenants,
                    onTenantSelect: navTenantSwitch.onTenantSelect,
                  }
                : undefined
            }
            onUserAction={onUserAction}
            showSearch={showSearch}
            onSearch={onSearch}
            searchPlaceholder={searchPlaceholder}
            showNotifications={showNotifications}
            notificationCount={notificationCount}
            onNotificationClick={onNotificationClick}
            showAIStudio={showAIStudio && !!aiStudio}
            onAIStudioClick={onAIStudioClick}
            showThemeToggle={showThemeToggle}
            isDarkMode={isDarkMode}
            onThemeToggle={onThemeToggle}
            logo={logo}
            variant="default"
            position="fixed"
            className="shadow-sm"
          />

          {/* Main Content - Dynamic children */}
          <main
            id="main-content"
            className={`flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${getMainContentStyles()}`}
            style={{ paddingTop: '80px' }}
          >
            {responsive && contentMaxWidth ? (
              <div className="lux-page-content w-full min-w-0 max-w-7xl mx-auto">{children}</div>
            ) : (
              children
            )}
          </main>
        </div>

        {aiStudio && (
          <AIStudioSidekick
            open={aiStudio.isOpen}
            onClose={aiStudio.close}
            title={aiStudio.title}
            onPopOut={() => {
              if (typeof window !== 'undefined') window.location.href = '/developer';
            }}
            onNewConversation={() => {
              if (typeof window !== 'undefined') window.location.reload();
            }}
          >
            {aiStudio.panelContent ?? (
              <div className="lux-sidekick-empty">
                <p style={{ color: 'var(--color-label-secondary)', fontSize: 14, lineHeight: 1.5 }}>
                  Ask AI Studio about this page, your customers, or what to build next.
                </p>
              </div>
            )}
          </AIStudioSidekick>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleSidebarToggle} />
      )}
    </div>
  );
};

export const AppLayout = withSSR(AppLayoutComponent);
