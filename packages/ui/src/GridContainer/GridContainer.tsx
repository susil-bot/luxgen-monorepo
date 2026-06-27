import React, { useId } from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface GridContainerProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  columns?: number | { sm?: number; md?: number; lg?: number };
  gap?: string;
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '');
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
  const rawId = useId();
  const gridId = sanitizeId(rawId);

  if (typeof columns === 'number') {
    const styles = {
      ...style,
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap,
      fontFamily: tenantTheme.fonts.primary,
    };

    return (
      <div className={`grid-container ${className}`} style={styles} {...props}>
        {children}
      </div>
    );
  }

  const sm = columns.sm ?? 1;
  const md = columns.md ?? sm;
  const lg = columns.lg ?? md;

  return (
    <>
      <style>{`
        .grid-container-${gridId} {
          display: grid;
          gap: ${gap};
          font-family: ${tenantTheme.fonts.primary};
          grid-template-columns: repeat(${sm}, 1fr);
        }
        @media (min-width: 640px) {
          .grid-container-${gridId} {
            grid-template-columns: repeat(${md}, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .grid-container-${gridId} {
            grid-template-columns: repeat(${lg}, 1fr);
          }
        }
      `}</style>
      <div className={`grid-container grid-container-${gridId} ${className}`} style={style} {...props}>
        {children}
      </div>
    </>
  );
};

export const GridContainer = withSSR(GridContainerComponent);
