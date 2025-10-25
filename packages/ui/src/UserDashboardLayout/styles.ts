import { TenantTheme } from '../types';
import { CSSProperties } from 'react';

interface UserDashboardLayoutStylesProps {
  variant: 'default' | 'compact' | 'detailed';
}

export const getUserDashboardLayoutStyles = (theme: TenantTheme, props: UserDashboardLayoutStylesProps) => {
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
    userDashboardLayoutClasses: {
      container: 'user-dashboard-layout-container',
    },
  };
};

export const userDashboardLayoutCSS = `
  .user-dashboard-layout-container {
    position: relative;
    overflow: hidden;
  }

  .user-dashboard-layout-container .user-dashboard-container {
    padding: 0;
    min-height: calc(100vh - 80px);
  }

  @media (max-width: 768px) {
    .user-dashboard-layout-container .user-dashboard-container {
      padding: 1rem;
    }
  }
`;
