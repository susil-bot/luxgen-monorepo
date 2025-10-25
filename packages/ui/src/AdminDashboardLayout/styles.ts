import { TenantTheme } from '../types';
import { CSSProperties } from 'react';

interface AdminDashboardLayoutStylesProps {
  variant: 'default' | 'compact' | 'detailed';
}

export const getAdminDashboardLayoutStyles = (theme: TenantTheme, props: AdminDashboardLayoutStylesProps) => {
  const { variant } = props;

  const container: CSSProperties = {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.fonts.primary,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  // Variant specific styles
  if (variant === 'compact') {
    Object.assign(container, {
      padding: theme.spacing.sm,
    });
  } else if (variant === 'detailed') {
    Object.assign(container, {
      padding: theme.spacing.xl,
    });
  }

  return {
    styles: {
      container,
    },
    adminDashboardLayoutClasses: {
      container: 'admin-dashboard-layout-container',
    },
  };
};

export const adminDashboardLayoutCSS = `
  .admin-dashboard-layout-container {
    position: relative;
    overflow: hidden;
  }

  .admin-dashboard-layout-container .admin-dashboard-container {
    padding: 0;
    min-height: calc(100vh - 80px);
  }

  @media (max-width: 768px) {
    .admin-dashboard-layout-container .admin-dashboard-container {
      padding: 1rem;
    }
  }
`;
