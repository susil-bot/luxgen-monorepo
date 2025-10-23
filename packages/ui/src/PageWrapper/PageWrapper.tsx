import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface PageWrapperProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  padding?: string;
}

const PageWrapperComponent: React.FC<PageWrapperProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  children,
  padding = '1rem',
  ...props
}) => {
  const styles = {
    ...style,
    padding,
    backgroundColor: tenantTheme.colors.background,
    color: tenantTheme.colors.text,
    fontFamily: tenantTheme.fonts.primary,
  };

  return (
    <div
      className={`page-wrapper ${className}`}
      style={styles}
      {...props}
    >
      {children}
    </div>
  );
};

export const PageWrapper = withSSR(PageWrapperComponent);
