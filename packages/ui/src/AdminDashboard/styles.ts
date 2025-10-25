import { TenantTheme } from '../types';
import { CSSProperties } from 'react';

interface AdminDashboardStylesProps {
  variant: 'default' | 'compact' | 'detailed';
}

export const getAdminDashboardStyles = (theme: TenantTheme, props: AdminDashboardStylesProps) => {
  const { variant } = props;

  const container: CSSProperties = {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.fonts.primary,
    minHeight: '100vh',
    padding: theme.spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg,
  };

  const header: CSSProperties = {
    marginBottom: theme.spacing.md,
  };

  const headerContent: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.lg,
  };

  const title: CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.colors.text,
    margin: 0,
    marginBottom: theme.spacing.xs,
  };

  const subtitle: CSSProperties = {
    fontSize: '1.125rem',
    color: theme.colors.textSecondary,
    margin: 0,
  };

  const tenantInfo: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  };

  const tenantLabel: CSSProperties = {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    fontWeight: '500',
  };

  const tenantName: CSSProperties = {
    fontSize: '1.125rem',
    color: theme.colors.primary,
    fontWeight: '600',
    backgroundColor: theme.colors.backgroundSecondary,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  };

  const statsGrid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  };

  const statCard: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    transition: 'all 0.2s ease-in-out',
  };

  const statIcon: CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const statContent: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  };

  const statValue: CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.colors.text,
    lineHeight: 1,
  };

  const statLabel: CSSProperties = {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    fontWeight: '500',
  };

  const quickActions: CSSProperties = {
    marginBottom: theme.spacing.lg,
  };

  const sectionTitle: CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
    marginBottom: theme.spacing.md,
  };

  const actionsGrid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing.md,
  };

  const actionButton: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    textAlign: 'left',
  };

  const actionIcon: CSSProperties = {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const chartsSection: CSSProperties = {
    marginBottom: theme.spacing.lg,
  };

  const chartsGrid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: theme.spacing.lg,
  };

  const chartContainer: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.border}`,
  };

  const bottomSection: CSSProperties = {
    flex: 1,
  };

  const bottomGrid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: theme.spacing.lg,
  };

  const activityContainer: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.border}`,
  };

  const surveyContainer: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.border}`,
  };

  const permissionsContainer: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.border}`,
  };

  const loading: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  };

  const spinner: CSSProperties = {
    width: '40px',
    height: '40px',
    border: `4px solid ${theme.colors.border}`,
    borderTop: `4px solid ${theme.colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const loadingText: CSSProperties = {
    fontSize: '1.125rem',
    color: theme.colors.textSecondary,
    margin: 0,
  };

  // Variant specific styles
  if (variant === 'compact') {
    Object.assign(container, {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    });
    Object.assign(statsGrid, {
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: theme.spacing.md,
    });
    Object.assign(statCard, {
      padding: theme.spacing.md,
    });
    Object.assign(chartsGrid, {
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: theme.spacing.md,
    });
    Object.assign(bottomGrid, {
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: theme.spacing.md,
    });
  } else if (variant === 'detailed') {
    Object.assign(container, {
      padding: theme.spacing.xl,
      gap: theme.spacing.xl,
    });
    Object.assign(statsGrid, {
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: theme.spacing.xl,
    });
    Object.assign(statCard, {
      padding: theme.spacing.xl,
    });
    Object.assign(chartsGrid, {
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: theme.spacing.xl,
    });
    Object.assign(bottomGrid, {
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: theme.spacing.xl,
    });
  }

  const adminDashboardClasses = {
    container: 'admin-dashboard-container',
    header: 'admin-dashboard-header',
    headerContent: 'admin-dashboard-header-content',
    title: 'admin-dashboard-title',
    subtitle: 'admin-dashboard-subtitle',
    tenantInfo: 'admin-dashboard-tenant-info',
    tenantLabel: 'admin-dashboard-tenant-label',
    tenantName: 'admin-dashboard-tenant-name',
    statsGrid: 'admin-dashboard-stats-grid',
    statCard: 'admin-dashboard-stat-card',
    statIcon: 'admin-dashboard-stat-icon',
    statContent: 'admin-dashboard-stat-content',
    statValue: 'admin-dashboard-stat-value',
    statLabel: 'admin-dashboard-stat-label',
    quickActions: 'admin-dashboard-quick-actions',
    sectionTitle: 'admin-dashboard-section-title',
    actionsGrid: 'admin-dashboard-actions-grid',
    actionButton: 'admin-dashboard-action-button',
    actionIcon: 'admin-dashboard-action-icon',
    chartsSection: 'admin-dashboard-charts-section',
    chartsGrid: 'admin-dashboard-charts-grid',
    chartContainer: 'admin-dashboard-chart-container',
    bottomSection: 'admin-dashboard-bottom-section',
    bottomGrid: 'admin-dashboard-bottom-grid',
    activityContainer: 'admin-dashboard-activity-container',
    surveyContainer: 'admin-dashboard-survey-container',
    permissionsContainer: 'admin-dashboard-permissions-container',
    loading: 'admin-dashboard-loading',
    spinner: 'admin-dashboard-spinner',
  };

  return {
    styles: {
      container,
      header,
      headerContent,
      title,
      subtitle,
      tenantInfo,
      tenantLabel,
      tenantName,
      statsGrid,
      statCard,
      statIcon,
      statContent,
      statValue,
      statLabel,
      quickActions,
      sectionTitle,
      actionsGrid,
      actionButton,
      actionIcon,
      chartsSection,
      chartsGrid,
      chartContainer,
      bottomSection,
      bottomGrid,
      activityContainer,
      surveyContainer,
      permissionsContainer,
      loading,
      spinner,
      loadingText,
    },
    adminDashboardClasses,
  };
};

export const adminDashboardCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .admin-dashboard-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .admin-dashboard-action-button:hover {
    background-color: var(--theme-colors-backgroundSecondary, #f0f2f5);
    border-color: var(--theme-colors-primary, #3B82F6);
    transform: translateY(-1px);
  }

  .admin-dashboard-chart-container {
    transition: all 0.2s ease-in-out;
  }

  .admin-dashboard-chart-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;