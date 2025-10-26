import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { AppLayout } from '../Layout';
import { AdminDashboard } from '../AdminDashboard';
import { getDefaultSidebarSections, getDefaultNavItems, getDefaultUser, getDefaultLogo } from '../Layout/DefaultNavigation';
import {
  getAdminDashboardLayoutStyles,
  adminDashboardLayoutClasses,
  adminDashboardLayoutCSS
} from './styles';

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
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
  searchPlaceholder?: string;
  sidebarCollapsible?: boolean;
  sidebarDefaultCollapsed?: boolean;
  responsive?: boolean;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  desktopBreakpoint?: number;
  onRetentionPointClick?: (point: { date: string; value: number; label?: string }) => void;
  onEngagementSegmentClick?: (segment: { id: string; label: string; value: number; color: string; percentage: number }) => void;
  onTrendsPointClick?: (point: { label: string; interactions: number; completions: number }) => void;
  onActivityClick?: (activity: { id: string; user: { name: string; avatar?: string; initials?: string }; action: string; time: string; status: 'online' | 'offline'; avatarColor?: string }) => void;
  onSurveyView?: (survey: { id: string; title: string; status: 'active' | 'completed' | 'draft' | 'closed'; progress: number; totalResponses: number; targetResponses?: number; createdAt: string; expiresAt?: string; description?: string }) => void;
  onSurveyEdit?: (survey: { id: string; title: string; status: 'active' | 'completed' | 'draft' | 'closed'; progress: number; totalResponses: number; targetResponses?: number; createdAt: string; expiresAt?: string; description?: string }) => void;
  onSurveyShare?: (survey: { id: string; title: string; status: 'active' | 'completed' | 'draft' | 'closed'; progress: number; totalResponses: number; targetResponses?: number; createdAt: string; expiresAt?: string; description?: string }) => void;
  onPermissionApprove?: (request: { id: string; user: { name: string; email: string; avatar?: string; initials?: string }; permission: string; resource: string; requestedAt: string; reason?: string; status: 'pending' | 'approved' | 'denied'; avatarColor?: string }) => void;
  onPermissionDeny?: (request: { id: string; user: { name: string; email: string; avatar?: string; initials?: string }; permission: string; resource: string; requestedAt: string; reason?: string; status: 'pending' | 'approved' | 'denied'; avatarColor?: string }) => void;
  onPermissionViewDetails?: (request: { id: string; user: { name: string; email: string; avatar?: string; initials?: string }; permission: string; resource: string; requestedAt: string; reason?: string; status: 'pending' | 'approved' | 'denied'; avatarColor?: string }) => void;
}

const AdminDashboardLayoutComponent: React.FC<AdminDashboardLayoutProps> = ({
  tenantTheme = defaultTheme,
  currentTenant,
  user = getDefaultUser(),
  bannerCarousel,
  dashboardData = {},
  variant = 'default',
  loading = false,
  onUserAction,
  onSearch,
  onNotificationClick,
  showSearch = true,
  showNotifications = true,
  notificationCount = 0,
  searchPlaceholder = 'Search...',
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
  className = '',
  style,
  ...props
}) => {
  const { styles, adminDashboardLayoutClasses } = getAdminDashboardLayoutStyles(tenantTheme, variant);

  const sidebarSections = getDefaultSidebarSections();
  const navItems = getDefaultNavItems();
  const logo = getDefaultLogo();

  return (
    <>
      <style>{adminDashboardLayoutCSS}</style>
      <div className={`${adminDashboardLayoutClasses.container} ${className}`} style={{ ...styles.container, ...style }} {...props}>
        <AppLayout
          tenantTheme={tenantTheme}
          navItems={navItems}
          sidebarSections={sidebarSections}
          user={user}
          onUserAction={onUserAction}
          onSearch={onSearch}
          onNotificationClick={onNotificationClick}
          showSearch={showSearch}
          showNotifications={showNotifications}
          notificationCount={notificationCount}
          searchPlaceholder={searchPlaceholder}
          logo={logo}
          sidebarCollapsible={sidebarCollapsible}
          sidebarDefaultCollapsed={sidebarDefaultCollapsed}
          responsive={responsive}
          mobileBreakpoint={mobileBreakpoint}
          tabletBreakpoint={tabletBreakpoint}
          desktopBreakpoint={desktopBreakpoint}
        >
          <AdminDashboard
            tenantTheme={tenantTheme}
            title={dashboardData.title || 'Admin Dashboard'}
            subtitle={dashboardData.subtitle}
            currentTenant={currentTenant}
            bannerCarousel={bannerCarousel}
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
            onRetentionPointClick={onRetentionPointClick}
            onEngagementSegmentClick={onEngagementSegmentClick}
            onTrendsPointClick={onTrendsPointClick}
            onActivityClick={onActivityClick}
            onSurveyView={onSurveyView}
            onSurveyEdit={onSurveyEdit}
            onSurveyShare={onSurveyShare}
            onPermissionApprove={onPermissionApprove}
            onPermissionDeny={onPermissionDeny}
            onPermissionViewDetails={onPermissionViewDetails}
          />
        </AppLayout>
      </div>
    </>
  );
};

export const AdminDashboardLayout = withSSR(AdminDashboardLayoutComponent);
