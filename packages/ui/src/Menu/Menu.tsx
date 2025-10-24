import React, { useState, useEffect, useRef } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: MenuItem[];
  disabled?: boolean;
  external?: boolean;
  onClick?: () => void;
}

export interface MenuProps {
  tenantTheme?: TenantTheme;
  items: MenuItem[];
  onItemClick?: (item: MenuItem) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  position?: 'top' | 'bottom' | 'left' | 'right';
  showIcons?: boolean;
  showBadges?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  level?: number;
  maxLevel?: number;
  showLevel?: boolean;
  activeItem?: string;
  onActiveChange?: (itemId: string) => void;
}

const MenuComponent: React.FC<MenuProps> = ({
  tenantTheme = defaultTheme,
  items,
  onItemClick,
  className = '',
  variant = 'default',
  position = 'top',
  showIcons = true,
  showBadges = true,
  collapsible = false,
  defaultCollapsed = false,
  onToggle,
  level = 0,
  maxLevel = 3,
  showLevel = false,
  activeItem,
  onActiveChange,
  ...props
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);

  const colors = tenantTheme?.colors || defaultTheme.colors;

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'py-2',
          item: 'px-3 py-2 text-sm',
          icon: 'w-4 h-4',
          badge: 'text-xs px-1.5 py-0.5',
          submenu: 'ml-4',
        };
      case 'minimal':
        return {
          container: 'py-1',
          item: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          badge: 'text-xs px-1 py-0.5',
          submenu: 'ml-3',
        };
      case 'default':
      default:
        return {
          container: 'py-3',
          item: 'px-4 py-3 text-base',
          icon: 'w-5 h-5',
          badge: 'text-sm px-2 py-1',
          submenu: 'ml-6',
        };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'flex-row space-x-1';
      case 'bottom':
        return 'flex-row space-x-1';
      case 'left':
        return 'flex-col space-y-1';
      case 'right':
        return 'flex-col space-y-1';
      default:
        return 'flex-row space-x-1';
    }
  };

  const styles = getVariantStyles();
  const positionStyles = getPositionStyles();

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;

    if (item.children && item.children.length > 0) {
      // Toggle submenu
      const newExpandedItems = new Set(expandedItems);
      if (expandedItems.has(item.id)) {
        newExpandedItems.delete(item.id);
      } else {
        newExpandedItems.add(item.id);
      }
      setExpandedItems(newExpandedItems);
    }

    if (item.onClick) {
      item.onClick();
    }

    if (onItemClick) {
      onItemClick(item);
    }

    if (onActiveChange) {
      onActiveChange(item.id);
    }
  };

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onToggle) {
      onToggle(newCollapsed);
    }
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.has(item.id);
    const isHovered = hoveredItem === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const canExpand = depth < maxLevel && hasChildren;

    const itemClasses = `
      ${styles.item}
      flex items-center justify-between
      ${isActive ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-500' : 'text-gray-700 hover:bg-gray-100'}
      ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${isHovered ? 'bg-gray-50' : ''}
      transition-colors duration-200
      ${depth > 0 ? styles.submenu : ''}
    `;

    return (
      <div key={item.id} className="relative">
        <div
          className={itemClasses}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          <div className="flex items-center space-x-3">
            {showIcons && item.icon && (
              <div className={`${styles.icon} flex-shrink-0`}>
                {item.icon}
              </div>
            )}
            
            <span className="flex-1 truncate">
              {item.label}
            </span>

            {showBadges && item.badge && (
              <span className={`${styles.badge} bg-blue-100 text-blue-800 rounded-full flex-shrink-0`}>
                {item.badge}
              </span>
            )}

            {canExpand && (
              <div className="flex-shrink-0">
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Submenu */}
        {canExpand && isExpanded && (
          <div className="mt-1">
            {item.children?.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderToggleButton = () => {
    if (!collapsible) return null;

    return (
      <button
        onClick={handleToggle}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
        title={collapsed ? 'Expand menu' : 'Collapse menu'}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            collapsed ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  };

  const renderLevelIndicator = () => {
    if (!showLevel || level === 0) return null;

    return (
      <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
        <span>Level {level}</span>
        {level < maxLevel && (
          <span className="text-gray-400">•</span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className={`
        ${styles.container}
        ${positionStyles}
        ${collapsed ? 'opacity-50' : ''}
        transition-opacity duration-200
        ${className}
      `}
      {...props}
    >
      {renderLevelIndicator()}
      
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">
          {collapsed ? 'Menu' : 'Navigation Menu'}
        </h3>
        {renderToggleButton()}
      </div>

      <div className="space-y-1">
        {items.map((item) => renderMenuItem(item))}
      </div>

      {collapsed && (
        <div className="mt-4 p-2 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-500 text-center">
            Menu collapsed
          </p>
        </div>
      )}
    </div>
  );
};

export const Menu = withSSR(MenuComponent);
