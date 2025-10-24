import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { MenuItem } from '../Menu';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface HeaderProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  logoUrl?: string;
  menuItems?: MenuItem[];
  onMenuClick?: (item: MenuItem) => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  logoUrl,
  menuItems = [],
  onMenuClick,
  ...props
}) => {
  const styles = {
    ...style,
    backgroundColor: tenantTheme.colors.surface,
    borderBottom: `1px solid ${tenantTheme.colors.border}`,
    color: tenantTheme.colors.text,
    fontFamily: tenantTheme.fonts.primary,
  };

  const handleMenuClick = (item: MenuItem) => {
    if (onMenuClick) {
      onMenuClick(item);
    }
  };

  return (
    <header
      className={`header ${className}`}
      style={styles}
      {...props}
    >
      <div className="header-container">
        {logoUrl && (
          <div className="header-logo">
            <img src={logoUrl} alt="Logo" className="header-logo-image" />
          </div>
        )}
        
        <nav className="header-nav">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="header-nav-item"
              onClick={() => handleMenuClick(item)}
            >
              {item.icon && <span className="header-nav-icon">{item.icon}</span>}
              <span className="header-nav-label">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export const Header = withSSR(HeaderComponent);
