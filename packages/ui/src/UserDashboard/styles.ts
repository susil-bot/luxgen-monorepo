import { TenantTheme } from '../types';
import { CSSProperties } from 'react';

interface UserDashboardStylesProps {
  variant: 'default' | 'compact' | 'detailed';
}

export const getUserDashboardStyles = (theme: TenantTheme, props: UserDashboardStylesProps) => {
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

  const mainGrid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: theme.spacing.lg,
    flex: 1,
  };

  const coursesSection: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.border}`,
  };

  const sectionHeader: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  };

  const viewAllButton: CSSProperties = {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.primary,
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    transition: 'all 0.2s ease-in-out',
  };

  const coursesGrid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing.md,
  };

  const courseCard: CSSProperties = {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  };

  const courseThumbnail: CSSProperties = {
    width: '100%',
    height: '120px',
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  };

  const courseContent: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  };

  const courseTitle: CSSProperties = {
    fontSize: '1rem',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
    lineHeight: 1.4,
  };

  const courseInstructor: CSSProperties = {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    margin: 0,
  };

  const courseProgress: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  };

  const progressBar: CSSProperties = {
    flex: 1,
    height: '8px',
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  };

  const progressFill: CSSProperties = {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    transition: 'width 0.3s ease-in-out',
  };

  const progressText: CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: theme.colors.text,
    minWidth: '40px',
    textAlign: 'right',
  };

  const courseStatus: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-start',
  };

  const statusBadge: CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: theme.colors.background,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const activitiesSection: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.border}`,
  };

  const activitiesList: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const activityItem: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  };

  const activityIcon: CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const activityContent: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  };

  const activityTitle: CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: theme.colors.text,
    margin: 0,
    lineHeight: 1.4,
  };

  const activityCourse: CSSProperties = {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    margin: 0,
  };

  const activityTime: CSSProperties = {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    margin: 0,
  };

  const activityStatus: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  const statusDot: CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  };

  const announcementsSection: CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.border}`,
  };

  const announcementsList: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const announcementItem: CSSProperties = {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  };

  const announcementHeader: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  };

  const announcementTitle: CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
    lineHeight: 1.4,
  };

  const priorityBadge: CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: theme.colors.background,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const announcementContent: CSSProperties = {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    margin: 0,
    marginBottom: theme.spacing.sm,
    lineHeight: 1.5,
  };

  const announcementFooter: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const announcementAuthor: CSSProperties = {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    fontWeight: '500',
  };

  const announcementDate: CSSProperties = {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
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
    Object.assign(mainGrid, {
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: theme.spacing.md,
    });
    Object.assign(coursesGrid, {
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: theme.spacing.sm,
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
    Object.assign(mainGrid, {
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: theme.spacing.xl,
    });
    Object.assign(coursesGrid, {
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: theme.spacing.lg,
    });
  }

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
      mainGrid,
      coursesSection,
      sectionHeader,
      viewAllButton,
      coursesGrid,
      courseCard,
      courseThumbnail,
      courseContent,
      courseTitle,
      courseInstructor,
      courseProgress,
      progressBar,
      progressFill,
      progressText,
      courseStatus,
      statusBadge,
      activitiesSection,
      activitiesList,
      activityItem,
      activityIcon,
      activityContent,
      activityTitle,
      activityCourse,
      activityTime,
      activityStatus,
      statusDot,
      announcementsSection,
      announcementsList,
      announcementItem,
      announcementHeader,
      announcementTitle,
      priorityBadge,
      announcementContent,
      announcementFooter,
      announcementAuthor,
      announcementDate,
      loading,
      spinner,
      loadingText,
    },
    userDashboardClasses: {
      container: 'user-dashboard-container',
      header: 'user-dashboard-header',
      headerContent: 'user-dashboard-header-content',
      title: 'user-dashboard-title',
      subtitle: 'user-dashboard-subtitle',
      tenantInfo: 'user-dashboard-tenant-info',
      tenantLabel: 'user-dashboard-tenant-label',
      tenantName: 'user-dashboard-tenant-name',
      statsGrid: 'user-dashboard-stats-grid',
      statCard: 'user-dashboard-stat-card',
      statIcon: 'user-dashboard-stat-icon',
      statContent: 'user-dashboard-stat-content',
      statValue: 'user-dashboard-stat-value',
      statLabel: 'user-dashboard-stat-label',
      quickActions: 'user-dashboard-quick-actions',
      sectionTitle: 'user-dashboard-section-title',
      actionsGrid: 'user-dashboard-actions-grid',
      actionButton: 'user-dashboard-action-button',
      actionIcon: 'user-dashboard-action-icon',
      mainGrid: 'user-dashboard-main-grid',
      coursesSection: 'user-dashboard-courses-section',
      sectionHeader: 'user-dashboard-section-header',
      viewAllButton: 'user-dashboard-view-all-button',
      coursesGrid: 'user-dashboard-courses-grid',
      courseCard: 'user-dashboard-course-card',
      courseThumbnail: 'user-dashboard-course-thumbnail',
      courseContent: 'user-dashboard-course-content',
      courseTitle: 'user-dashboard-course-title',
      courseInstructor: 'user-dashboard-course-instructor',
      courseProgress: 'user-dashboard-course-progress',
      progressBar: 'user-dashboard-progress-bar',
      progressFill: 'user-dashboard-progress-fill',
      progressText: 'user-dashboard-progress-text',
      courseStatus: 'user-dashboard-course-status',
      statusBadge: 'user-dashboard-status-badge',
      activitiesSection: 'user-dashboard-activities-section',
      activitiesList: 'user-dashboard-activities-list',
      activityItem: 'user-dashboard-activity-item',
      activityIcon: 'user-dashboard-activity-icon',
      activityContent: 'user-dashboard-activity-content',
      activityTitle: 'user-dashboard-activity-title',
      activityCourse: 'user-dashboard-activity-course',
      activityTime: 'user-dashboard-activity-time',
      activityStatus: 'user-dashboard-activity-status',
      statusDot: 'user-dashboard-status-dot',
      announcementsSection: 'user-dashboard-announcements-section',
      announcementsList: 'user-dashboard-announcements-list',
      announcementItem: 'user-dashboard-announcement-item',
      announcementHeader: 'user-dashboard-announcement-header',
      announcementTitle: 'user-dashboard-announcement-title',
      priorityBadge: 'user-dashboard-priority-badge',
      announcementContent: 'user-dashboard-announcement-content',
      announcementFooter: 'user-dashboard-announcement-footer',
      announcementAuthor: 'user-dashboard-announcement-author',
      announcementDate: 'user-dashboard-announcement-date',
      loading: 'user-dashboard-loading',
      spinner: 'user-dashboard-spinner',
    },
  };
};

export const userDashboardCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .user-dashboard-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .user-dashboard-action-button:hover {
    background-color: var(--theme-colors-backgroundSecondary, #f0f2f5);
    border-color: var(--theme-colors-primary, #3B82F6);
    transform: translateY(-1px);
  }

  .user-dashboard-course-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .user-dashboard-activity-item:hover {
    background-color: var(--theme-colors-backgroundSecondary, #f0f2f5);
    transform: translateX(4px);
  }

  .user-dashboard-announcement-item:hover {
    background-color: var(--theme-colors-backgroundSecondary, #f0f2f5);
    transform: translateY(-1px);
  }

  .user-dashboard-view-all-button:hover {
    background-color: var(--theme-colors-backgroundSecondary, #f0f2f5);
  }
`;
