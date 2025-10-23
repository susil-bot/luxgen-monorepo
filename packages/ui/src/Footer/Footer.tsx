import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  links?: FooterLink[];
  copyright?: string;
}

const FooterComponent: React.FC<FooterProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  links = [],
  copyright = '© 2024 LuxGen. All rights reserved.',
  ...props
}) => {
  const styles = {
    ...style,
    backgroundColor: tenantTheme.colors.surface,
    borderTop: `1px solid ${tenantTheme.colors.border}`,
    color: tenantTheme.colors.textSecondary,
    fontFamily: tenantTheme.fonts.primary,
  };

  return (
    <footer
      className={`footer ${className}`}
      style={styles}
      {...props}
    >
      <div className="footer-container">
        <div className="footer-content">
          {links.length > 0 && (
            <nav className="footer-nav">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="footer-link"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
          
          <div className="footer-copyright">
            <p>{copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Footer = withSSR(FooterComponent);
