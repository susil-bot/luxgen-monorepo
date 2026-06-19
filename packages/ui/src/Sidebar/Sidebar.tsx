import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';
import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useNavigation } from '../context/NavigationContext';
import { useSidebarActive } from './useSidebarActive';
import type { NavSection } from './sidebar.types';

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: SidebarItem[];
  external?: boolean;
  disabled?: boolean;
  active?: boolean;
  /** Require exact pathname match for active state (e.g. dashboard) */
  exact?: boolean;
  onClick?: () => void;
}

export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface SidebarProps {
  tenantTheme?: TenantTheme;
  sections?: SidebarSection[];
  logo?: {
    src?: string;
    alt?: string;
    text?: string;
    href?: string;
  };
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  position?: 'fixed' | 'sticky' | 'static';
  width?: 'narrow' | 'normal' | 'wide';
  showUserSection?: boolean;
  showLogo?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  onItemClick?: (item: SidebarItem) => void;
  /** Current pathname for URL-based active highlighting */
  pathname?: string;
  /** Client-side navigation callback (e.g. Next.js router.push) */
  onNavigate?: (href: string) => void;
}

const SidebarComponent: React.FC<SidebarProps> = ({
  tenantTheme = defaultTheme,
  sections = [],
  logo,
  user = null,
  onUserAction,
  className = '',
  variant = 'default',
  position = 'fixed',
  width = 'normal',
  showUserSection = true,
  showLogo = true,
  collapsible = true,
  defaultCollapsed = false,
  onToggle,
  onItemClick,
  pathname,
  onNavigate,
  ...props
}) => {
  const navigation = useNavigation();
  const effectivePathname = pathname ?? navigation.pathname ?? '';
  const effectiveNavigate = onNavigate ?? navigation.onNavigate;

  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const navSections = useMemo(() => sections as unknown as NavSection[], [sections]);
  const { activeItemId, expandedByUrl } = useSidebarActive(navSections, effectivePathname);
  const urlDrivenActive = Boolean(effectivePathname);

  // Get tenant-specific logo from runtime tenant detection
  const { tenantConfig } = useGlobalContext();
  const { theme } = useTheme();
  const { user: dynamicUser, logout: userLogout } = useUser();
  const tenantLogo = logo || tenantConfig.branding.logo;

  // Use dynamic user data if available, fallback to prop
  const currentUser = dynamicUser || user;

  // Initialize expanded sections + auto-expand parents of active route
  useEffect(() => {
    const initialExpanded = new Set<string>();
    sections.forEach((section) => {
      if (!section.defaultCollapsed && section.collapsible !== false) {
        initialExpanded.add(section.id);
      }
    });
    expandedByUrl.forEach((id) => initialExpanded.add(id));
    setExpandedSections(initialExpanded);
  }, [sections, expandedByUrl]);

  // Handle sidebar toggle
  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  };

  // Handle section toggle
  const handleSectionToggle = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const navigateTo = useCallback(
    (href: string, external?: boolean) => {
      if (external) {
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }
      if (effectiveNavigate) {
        effectiveNavigate(href);
      } else {
        window.location.href = href;
      }
    },
    [effectiveNavigate],
  );

  // Handle item click
  const handleItemClick = (item: SidebarItem) => {
    onItemClick?.(item);

    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      navigateTo(item.href, item.external);
    }
  };

  const isItemActive = (itemId: string) => (urlDrivenActive ? activeItemId === itemId : false);

  // Handle user action
  const handleUserAction = (action: 'profile' | 'settings' | 'logout') => {
    onUserAction?.(action);
  };

  // Get variant styles
  const getVariantStyles = () => {
    const colors = tenantTheme?.colors || defaultTheme.colors;

    switch (variant) {
      case 'compact':
        return {
          container: 'w-16',
          logo: 'justify-center',
          item: 'justify-center px-3',
          itemText: 'hidden',
          section: 'px-3',
        };
      case 'minimal':
        return {
          container: 'w-12',
          logo: 'justify-center',
          item: 'justify-center px-2',
          itemText: 'hidden',
          section: 'px-2',
        };
      case 'default':
      default:
        return {
          container: width === 'narrow' ? 'w-48' : width === 'wide' ? 'w-80' : 'w-64',
          logo: 'justify-start',
          item: 'justify-start px-4',
          itemText: 'block',
          section: 'px-4',
        };
    }
  };

  // Get position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'fixed':
        return 'fixed top-0 left-0 h-full z-40';
      case 'sticky':
        return 'sticky top-0 h-screen z-40';
      case 'static':
      default:
        return 'static h-auto';
    }
  };

  const styles = getVariantStyles();
  const positionStyles = getPositionStyles();

  return (
    <aside
      className={`
        ${positionStyles}
        ${styles.container}
        glass border-r
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : ''}
        ${className}
      `}
      style={{ borderColor: 'var(--color-sidebar-border)' }}
      {...props}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        {showLogo && (
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: 'var(--color-separator)' }}
          >
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => tenantLogo.href && navigateTo(tenantLogo.href)}
                className="flex items-center space-x-2 text-xl font-bold text-green-600 bg-transparent border-0 p-0 cursor-pointer"
              >
                {tenantLogo.src ? (
                  <img src={tenantLogo.src} alt={tenantLogo.alt || 'Logo'} className="h-8 w-8" />
                ) : null}
                <span style={{ color: theme.colors.primary }}>{tenantLogo.text}</span>
              </button>
            )}

            {collapsible && (
              <button
                onClick={handleToggle}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                <svg
                  className={`h-5 w-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.id} className="py-2">
              {/* Section Header */}
              {section.title && !isCollapsed && (
                <div className="flex items-center justify-between px-4 py-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-tertiary">{section.title}</h3>
                  {section.collapsible !== false && (
                    <button
                      onClick={() => handleSectionToggle(section.id)}
                      className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${
                          expandedSections.has(section.id) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Section Items */}
              {(!section.collapsible || expandedSections.has(section.id) || isCollapsed) && (
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarItemComponent
                      key={item.id}
                      item={item}
                      isActive={isItemActive(item.id)}
                      activeItemId={activeItemId}
                      isItemActive={isItemActive}
                      isCollapsed={isCollapsed}
                      onItemClick={handleItemClick}
                      variant={variant}
                      styles={styles}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        {showUserSection && currentUser && !isCollapsed && (
          <div className="border-t p-4" style={{ borderColor: 'var(--color-separator)' }}>
            <div className="flex items-center space-x-3">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{currentUser.name}</p>
                <p className="text-xs text-secondary truncate">{currentUser.role}</p>
                {dynamicUser && dynamicUser.tenant && (
                  <p className="text-xs text-tertiary truncate">{dynamicUser.tenant.name}</p>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => handleUserAction('profile')}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

// Separate component for sidebar items for better performance
const SidebarItemComponent: React.FC<{
  item: SidebarItem;
  isActive: boolean;
  activeItemId: string | null;
  isItemActive: (id: string) => boolean;
  isCollapsed: boolean;
  onItemClick: (item: SidebarItem) => void;
  variant: string;
  styles: Record<string, string>;
}> = React.memo(({ item, isActive, activeItemId, isItemActive, isCollapsed, onItemClick, variant, styles }) => {
  const hasActiveChild = Boolean(
    item.children?.some((child) => isItemActive(child.id)),
  );
  const [isExpanded, setIsExpanded] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsExpanded(true);
    }
  }, [hasActiveChild, activeItemId]);

  const handleClick = () => {
    if (item.children && item.children.length > 0) {
      setIsExpanded(!isExpanded);
      if (item.href) {
        onItemClick(item);
      }
    } else {
      onItemClick(item);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={item.disabled}
        aria-current={isActive ? 'page' : undefined}
        className={`
          w-full flex items-center ${styles.item} py-2 text-sm font-medium rounded-md
          transition-colors duration-200
          nav-item ${isActive ? 'active' : ''}
          ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {item.icon && <span className="flex-shrink-0 mr-3">{item.icon}</span>}

        {!isCollapsed && (
          <>
            <span className={`flex-1 text-left ${styles.itemText}`}>{item.label}</span>

            {item.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{item.badge}</span>
            )}

            {item.children && item.children.length > 0 && (
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </>
        )}
      </button>

      {/* Sub-menu items */}
      {item.children && item.children.length > 0 && isExpanded && !isCollapsed && (
        <div className="ml-4 mt-1 space-y-1">
          {item.children.map((child) => (
            <SidebarItemComponent
              key={child.id}
              item={child}
              isActive={isItemActive(child.id)}
              activeItemId={activeItemId}
              isItemActive={isItemActive}
              isCollapsed={isCollapsed}
              onItemClick={onItemClick}
              variant={variant}
              styles={styles}
            />
          ))}
        </div>
      )}
    </div>
  );
});

SidebarItemComponent.displayName = 'SidebarItemComponent';

export const Sidebar = withSSR(SidebarComponent);
