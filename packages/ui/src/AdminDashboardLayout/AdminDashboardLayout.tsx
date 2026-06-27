import React, { useMemo } from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { AppLayout } from '../Layout';
import { AdminDashboard } from '../AdminDashboard';
import { useNavigation } from '../context/NavigationContext';
import { getDefaultSidebarSections, getDefaultNavItems, getDefaultLogo } from '../Layout/DefaultNavigation';
import { getAdminDashboardLayoutStyles, adminDashboardLayoutCSS } from './styles';
import type { DashboardActionHandler } from '../AdminDashboard/dashboard-actions';

/**
 * Tenant admin analytics shell — KPIs, retention, surveys, permission requests.
 * Use `UserDashboardLayout` for learner-facing progress dashboards (UI-158).
 */
export interface AdminDashboardLayoutProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  currentTenant?: {
    name: string;
    subdomain: string;
    logo?: string;
  };
  user?: {
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
    role: string;
  };
  bannerCarousel?: {
    banners: Array<{
      id: string;
      title: string;
      description: string;
      image: string;
      link?: string;
      buttonText?: string;
    }>;
    autoPlay?: boolean;
    interval?: number;
  };
  bannerSlot?: React.ReactNode;
  dashboardData?: {
    title?: string;
    subtitle?: string;
    stats?: {
      totalCourses: number;
      activeStudents: number;
      completionRate: number;
      totalUsers?: number;
      revenue?: number;
      growthRate?: number;
    };
    retentionData?: Array<{ date: string; value: number; label?: string }>;
    engagementData?: Array<{ id: string; label: string; value: number; color: string; percentage: number }>;
    trendsData?: Array<{ label: string; interactions: number; completions: number }>;
    activitiesData?: Array<{
      id: string;
      user: { name: string; avatar?: string; initials?: string };
      action: string;
      time: string;
      status: 'online' | 'offline';
      avatarColor?: string;
    }>;
    surveyData?: {
      id: string;
      title: string;
      status: 'active' | 'completed' | 'draft' | 'closed';
      progress: number;
      totalResponses: number;
      targetResponses?: number;
      createdAt: string;
      expiresAt?: string;
      description?: string;
    };
    permissionData?: Array<{
      id: string;
      user: { name: string; email: string; avatar?: string; initials?: string };
      permission: string;
      resource: string;
      requestedAt: string;
      reason?: string;
      status: 'pending' | 'approved' | 'denied';
      avatarColor?: string;
    }>;
    quickActions?: Array<{
      id: string;
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
    }>;
  };
  variant?: 'default' | 'compact' | 'detailed';
  loading?: boolean;
  /** Optional slot above dashboard content (e.g. onboarding checklist) */
  onboardingSlot?: React.ReactNode;
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  pathname?: string;
  onNavigate?: (href: string) => void;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
  searchPlaceholder?: string;
  showThemeToggle?: boolean;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  sidebarCollapsible?: boolean;
  sidebarDefaultCollapsed?: boolean;
  responsive?: boolean;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  desktopBreakpoint?: number;
  onRetentionPointClick?: (point: { date: string; value: number; label?: string }) => void;
  onEngagementSegmentClick?: (segment: {
    id: string;
    label: string;
    value: number;
    color: string;
    percentage: number;
  }) => void;
  onTrendsPointClick?: (point: { label: string; interactions: number; completions: number }) => void;
  onActivityClick?: (activity: {
    id: string;
    user: { name: string; avatar?: string; initials?: string };
    action: string;
    time: string;
    status: 'online' | 'offline';
    avatarColor?: string;
  }) => void;
  onSurveyView?: (survey: {
    id: string;
    title: string;
    status: 'active' | 'completed' | 'draft' | 'closed';
    progress: number;
    totalResponses: number;
    targetResponses?: number;
    createdAt: string;
    expiresAt?: string;
    description?: string;
  }) => void;
  onSurveyEdit?: (survey: {
    id: string;
    title: string;
    status: 'active' | 'completed' | 'draft' | 'closed';
    progress: number;
    totalResponses: number;
    targetResponses?: number;
    createdAt: string;
    expiresAt?: string;
    description?: string;
  }) => void;
  onSurveyShare?: (survey: {
    id: string;
    title: string;
    status: 'active' | 'completed' | 'draft' | 'closed';
    progress: number;
    totalResponses: number;
    targetResponses?: number;
    createdAt: string;
    expiresAt?: string;
    description?: string;
  }) => void;
  onPermissionApprove?: (request: {
    id: string;
    user: { name: string; email: string; avatar?: string; initials?: string };
    permission: string;
    resource: string;
    requestedAt: string;
    reason?: string;
    status: 'pending' | 'approved' | 'denied';
    avatarColor?: string;
  }) => void;
  onPermissionDeny?: (request: {
    id: string;
    user: { name: string; email: string; avatar?: string; initials?: string };
    permission: string;
    resource: string;
    requestedAt: string;
    reason?: string;
    status: 'pending' | 'approved' | 'denied';
    avatarColor?: string;
  }) => void;
  onPermissionViewDetails?: (request: {
    id: string;
    user: { name: string; email: string; avatar?: string; initials?: string };
    permission: string;
    resource: string;
    requestedAt: string;
    reason?: string;
    status: 'pending' | 'approved' | 'denied';
    avatarColor?: string;
  }) => void;
  onDashboardAction?: DashboardActionHandler;
}

const AdminDashboardLayoutComponent: React.FC<AdminDashboardLayoutProps> = ({
  tenantTheme = defaultTheme,
  currentTenant,
  user,
  bannerCarousel,
  bannerSlot,
  dashboardData = {},
  variant = 'default',
  loading = false,
  onboardingSlot,
  onUserAction,
  pathname,
  onNavigate,
  onSearch,
  onNotificationClick,
  showSearch = true,
  showNotifications = false,
  notificationCount = 0,
  searchPlaceholder = 'Search...',
  showThemeToggle = false,
  isDarkMode = false,
  onThemeToggle,
  sidebarCollapsible = true,
  sidebarDefaultCollapsed = false,
  responsive = true,
  mobileBreakpoint = 768,
  tabletBreakpoint = 1024,
  desktopBreakpoint = 1280,
  onRetentionPointClick,
  onEngagementSegmentClick,
  onTrendsPointClick,
  onActivityClick,
  onSurveyView,
  onSurveyEdit,
  onSurveyShare,
  onPermissionApprove,
  onPermissionDeny,
  onPermissionViewDetails,
  onDashboardAction,
  className = '',
  style,
  ...props
}) => {
  const navigation = useNavigation();
  const { styles, adminDashboardLayoutClasses } = getAdminDashboardLayoutStyles(tenantTheme, variant);

  const retentionHandler = useMemo(
    () =>
      onRetentionPointClick ??
      (onDashboardAction
        ? (point: { date: string; value: number; label?: string }) =>
            onDashboardAction({ type: 'retention_click', ...point })
        : undefined),
    [onRetentionPointClick, onDashboardAction],
  );

  const engagementHandler = useMemo(
    () =>
      onEngagementSegmentClick ??
      (onDashboardAction
        ? (segment: { id: string; label: string; value: number }) =>
            onDashboardAction({ type: 'engagement_click', segmentId: segment.id, label: segment.label, value: segment.value })
        : undefined),
    [onEngagementSegmentClick, onDashboardAction],
  );

  const trendsHandler = useMemo(
    () =>
      onTrendsPointClick ??
      (onDashboardAction
        ? (point: { label: string; interactions: number; completions: number }) =>
            onDashboardAction({ type: 'trend_click', ...point })
        : undefined),
    [onTrendsPointClick, onDashboardAction],
  );

  const activityHandler = useMemo(
    () =>
      onActivityClick ??
      (onDashboardAction
        ? (activity: { id: string }) => onDashboardAction({ type: 'activity_click', activityId: activity.id })
        : undefined),
    [onActivityClick, onDashboardAction],
  );

  const surveyViewHandler = useMemo(
    () =>
      onSurveyView ??
      (onDashboardAction
        ? (survey: { id: string }) => onDashboardAction({ type: 'view_survey', surveyId: survey.id })
        : undefined),
    [onSurveyView, onDashboardAction],
  );

  const surveyEditHandler = useMemo(
    () =>
      onSurveyEdit ??
      (onDashboardAction
        ? (survey: { id: string }) => onDashboardAction({ type: 'edit_survey', surveyId: survey.id })
        : undefined),
    [onSurveyEdit, onDashboardAction],
  );

  const surveyShareHandler = useMemo(
    () =>
      onSurveyShare ??
      (onDashboardAction
        ? (survey: { id: string }) => onDashboardAction({ type: 'share_survey', surveyId: survey.id })
        : undefined),
    [onSurveyShare, onDashboardAction],
  );

  const permissionApproveHandler = useMemo(
    () =>
      onPermissionApprove ??
      (onDashboardAction
        ? (request: { id: string }) => onDashboardAction({ type: 'approve_request', requestId: request.id })
        : undefined),
    [onPermissionApprove, onDashboardAction],
  );

  const permissionDenyHandler = useMemo(
    () =>
      onPermissionDeny ??
      (onDashboardAction
        ? (request: { id: string }) => onDashboardAction({ type: 'deny_request', requestId: request.id })
        : undefined),
    [onPermissionDeny, onDashboardAction],
  );

  const permissionDetailsHandler = useMemo(
    () =>
      onPermissionViewDetails ??
      (onDashboardAction
        ? (request: { id: string; user: { name: string }; permission: string }) =>
            onDashboardAction({
              type: 'view_details',
              entityId: request.id,
              entityType: 'permission_request',
            })
        : undefined),
    [onPermissionViewDetails, onDashboardAction],
  );

  const sidebarSections = getDefaultSidebarSections();
  const navItems = getDefaultNavItems();
  const logo = getDefaultLogo();

  return (
    <>
      <style>{adminDashboardLayoutCSS}</style>
      <div
        className={`${adminDashboardLayoutClasses.container} ${className}`}
        style={{ ...styles.container, ...style }}
        {...props}
      >
        <AppLayout
          tenantTheme={tenantTheme}
          navItems={navItems}
          sidebarSections={sidebarSections}
          user={user}
          onUserAction={onUserAction}
          pathname={pathname ?? navigation.pathname}
          onNavigate={onNavigate ?? navigation.onNavigate}
          onSearch={onSearch}
          onNotificationClick={onNotificationClick}
          showSearch={showSearch}
          showNotifications={showNotifications}
          notificationCount={notificationCount}
          searchPlaceholder={searchPlaceholder}
          showThemeToggle={showThemeToggle}
          isDarkMode={isDarkMode}
          onThemeToggle={onThemeToggle}
          logo={logo}
          sidebarCollapsible={sidebarCollapsible}
          sidebarDefaultCollapsed={sidebarDefaultCollapsed}
          responsive={responsive}
          mobileBreakpoint={mobileBreakpoint}
          tabletBreakpoint={tabletBreakpoint}
          desktopBreakpoint={desktopBreakpoint}
        >
          {onboardingSlot}
          <AdminDashboard
            tenantTheme={tenantTheme}
            title={dashboardData.title || 'Admin Dashboard'}
            subtitle={dashboardData.subtitle}
            currentTenant={currentTenant}
            bannerCarousel={bannerCarousel}
            bannerSlot={bannerSlot}
            stats={dashboardData.stats}
            retentionData={dashboardData.retentionData}
            engagementData={dashboardData.engagementData}
            trendsData={dashboardData.trendsData}
            activitiesData={dashboardData.activitiesData}
            surveyData={dashboardData.surveyData}
            permissionData={dashboardData.permissionData}
            quickActions={dashboardData.quickActions}
            variant={variant}
            loading={loading}
            onRetentionPointClick={retentionHandler}
            onEngagementSegmentClick={engagementHandler}
            onTrendsPointClick={trendsHandler}
            onActivityClick={activityHandler}
            onSurveyView={surveyViewHandler}
            onSurveyEdit={surveyEditHandler}
            onSurveyShare={surveyShareHandler}
            onPermissionApprove={permissionApproveHandler}
            onPermissionDeny={permissionDenyHandler}
            onPermissionViewDetails={permissionDetailsHandler}
          />
        </AppLayout>
      </div>
    </>
  );
};

export const AdminDashboardLayout = withSSR(AdminDashboardLayoutComponent);
