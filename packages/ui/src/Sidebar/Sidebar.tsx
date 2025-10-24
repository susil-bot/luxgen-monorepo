import React, { useState, useEffect } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';
import { getTenantLogo } from '../tenant-config';
import { useTenant } from '../TenantProvider';

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
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<string>('');

  // Get tenant-specific logo from runtime tenant detection
  const { tenantConfig } = useTenant();
  const tenantLogo = logo || tenantConfig.logo;

  // Initialize expanded sections
  useEffect(() => {
    const initialExpanded = new Set<string>();
    sections.forEach(section => {
      if (!section.defaultCollapsed && section.collapsible !== false) {
        initialExpanded.add(section.id);
      }
    });
    setExpandedSections(initialExpanded);
  }, [sections]);

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

  // Handle item click
  const handleItemClick = (item: SidebarItem) => {
    setActiveItem(item.id);
    onItemClick?.(item);
    
    if (item.onClick) {
      item.onClick();
    } else if (item.href && !item.external) {
      window.location.href = item.href;
    } else if (item.href && item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    }
  };

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
        bg-white border-r border-gray-200 shadow-sm
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        {showLogo && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <a
                href={tenantLogo.href || '/'}
                className="flex items-center space-x-2 text-xl font-bold text-green-600"
              >
                {tenantLogo.src ? (
                  <img
                    src={tenantLogo.src}
                    alt={tenantLogo.alt || 'Logo'}
                    className="h-8 w-8"
                  />
                ) : null}
                <span>{tenantLogo.text}</span>
              </a>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
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
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
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
                      isActive={activeItem === item.id}
                      isCollapsed={isCollapsed}
                      onClick={() => handleItemClick(item)}
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
        {showUserSection && user && !isCollapsed && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role}
                </p>
              </div>
              <div className="relative">
                <button
                  onClick={() => handleUserAction('profile')}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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
  isCollapsed: boolean;
  onClick: () => void;
  variant: string;
  styles: any;
}> = React.memo(({ item, isActive, isCollapsed, onClick, variant, styles }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (item.children && item.children.length > 0) {
      // Only toggle submenu, don't navigate
      setIsExpanded(!isExpanded);
    } else {
      // Only navigate if no children
      onClick();
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={item.disabled}
        className={`
          w-full flex items-center ${styles.item} py-2 text-sm font-medium rounded-md
          transition-colors duration-200
          ${isActive 
            ? 'bg-green-50 text-green-700 border-r-2 border-green-500' 
            : item.children && item.children.length > 0
              ? 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
          ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {item.icon && (
          <span className="flex-shrink-0 mr-3">
            {item.icon}
          </span>
        )}
        
        {!isCollapsed && (
          <>
            <span className={`flex-1 text-left ${styles.itemText}`}>
              {item.label}
            </span>
            
            {item.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
            
            {item.children && item.children.length > 0 && (
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
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
              isActive={false}
              isCollapsed={isCollapsed}
              onClick={onClick}
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