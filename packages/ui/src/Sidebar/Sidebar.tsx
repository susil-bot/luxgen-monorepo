import React, { useState } from 'react';
import { BaseComponentProps, TenantTheme, MenuItem } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface SidebarProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  menuItems?: MenuItem[];
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

const SidebarComponent: React.FC<SidebarProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  menuItems = [],
  collapsed = false,
  onToggle,
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onToggle) {
      onToggle(newCollapsed);
    }
  };

  const styles = {
    ...style,
    backgroundColor: tenantTheme.colors.surface,
    borderRight: `1px solid ${tenantTheme.colors.border}`,
    color: tenantTheme.colors.text,
    fontFamily: tenantTheme.fonts.primary,
    width: isCollapsed ? '4rem' : '16rem',
  };

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`}
      style={styles}
      {...props}
    >
      <div className="sidebar-header">
        {!isCollapsed && (
          <h2 className="sidebar-title">Navigation</h2>
        )}
        <button
          className="sidebar-toggle"
          onClick={handleToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="sidebar-nav-item"
            title={isCollapsed ? item.label : undefined}
          >
            {item.icon && (
              <span className="sidebar-nav-icon">{item.icon}</span>
            )}
            {!isCollapsed && (
              <span className="sidebar-nav-label">{item.label}</span>
            )}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export const Sidebar = withSSR(SidebarComponent);
