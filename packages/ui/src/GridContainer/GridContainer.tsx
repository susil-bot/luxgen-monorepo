import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface GridContainerProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  columns?: number;
  gap?: string;
}

const GridContainerComponent: React.FC<GridContainerProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  children,
  columns = 3,
  gap = '1rem',
  ...props
}) => {
  const styles = {
    ...style,
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
    fontFamily: tenantTheme.fonts.primary,
  };

  return (
    <div
      className={`grid-container ${className}`}
      style={styles}
      {...props}
    >
      {children}
    </div>
  );
};

export const GridContainer = withSSR(GridContainerComponent);
