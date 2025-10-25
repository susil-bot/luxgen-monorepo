import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import {
  UserRetention,
  EngagementBreakdown,
  EngagementTrends,
  RecentActivities,
  LastSurvey,
  PermissionRequest
} from '../index';
import {
  getAdminDashboardStyles,
  adminDashboardCSS
} from './styles';

export interface AdminDashboardProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  title?: string;
  subtitle?: string;
  currentTenant?: {
    name: string;
    subdomain: string;
    logo?: string;
  };
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
  variant?: 'default' | 'compact' | 'detailed';
  loading?: boolean;
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

const AdminDashboardComponent: React.FC<AdminDashboardProps> = ({
  tenantTheme = defaultTheme,
  title = 'Admin Dashboard',
  subtitle,
  currentTenant,
  stats = {
    totalCourses: 0,
    activeStudents: 0,
    completionRate: 0
  },
  retentionData = [],
  engagementData = [],
  trendsData = [],
  activitiesData = [],
  surveyData,
  permissionData = [],
  quickActions = [],
  variant = 'default',
  loading = false,
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
  const { styles, adminDashboardClasses } = getAdminDashboardStyles(tenantTheme, { variant });

  if (loading) {
    return (
      <>
        <style>{adminDashboardCSS}</style>
        <div className={`${adminDashboardClasses.container} ${className}`} style={{ ...styles.container, ...style }}>
          <div className={adminDashboardClasses.loading} style={styles.loading}>
            <div className={adminDashboardClasses.spinner} style={styles.spinner} />
            <p style={styles.loadingText}>Loading admin dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{adminDashboardCSS}</style>
      <div className={`${adminDashboardClasses.container} ${className}`} style={{ ...styles.container, ...style }} {...props}>
        {/* Header */}
        <div className={adminDashboardClasses.header} style={styles.header}>
          <div className={adminDashboardClasses.headerContent} style={styles.headerContent}>
            <div>
              <h1 className={adminDashboardClasses.title} style={styles.title}>
                {title}
              </h1>
              {subtitle && (
                <p className={adminDashboardClasses.subtitle} style={styles.subtitle}>
                  {subtitle}
                </p>
              )}
            </div>
            {currentTenant && (
              <div className={adminDashboardClasses.tenantInfo} style={styles.tenantInfo}>
                <div className={adminDashboardClasses.tenantLabel} style={styles.tenantLabel}>
                  Current Tenant
                </div>
                <div className={adminDashboardClasses.tenantName} style={styles.tenantName}>
                  {currentTenant.name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className={adminDashboardClasses.statsGrid} style={styles.statsGrid}>
          <div className={adminDashboardClasses.statCard} style={styles.statCard}>
            <div className={adminDashboardClasses.statIcon} style={styles.statIcon}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className={adminDashboardClasses.statContent} style={styles.statContent}>
              <div className={adminDashboardClasses.statValue} style={styles.statValue}>
                {stats.totalCourses}
              </div>
              <div className={adminDashboardClasses.statLabel} style={styles.statLabel}>
                Total Courses
              </div>
            </div>
          </div>

          <div className={adminDashboardClasses.statCard} style={styles.statCard}>
            <div className={adminDashboardClasses.statIcon} style={styles.statIcon}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className={adminDashboardClasses.statContent} style={styles.statContent}>
              <div className={adminDashboardClasses.statValue} style={styles.statValue}>
                {stats.activeStudents}
              </div>
              <div className={adminDashboardClasses.statLabel} style={styles.statLabel}>
                Active Students
              </div>
            </div>
          </div>

          <div className={adminDashboardClasses.statCard} style={styles.statCard}>
            <div className={adminDashboardClasses.statIcon} style={styles.statIcon}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className={adminDashboardClasses.statContent} style={styles.statContent}>
              <div className={adminDashboardClasses.statValue} style={styles.statValue}>
                {stats.completionRate}%
              </div>
              <div className={adminDashboardClasses.statLabel} style={styles.statLabel}>
                Completion Rate
              </div>
            </div>
          </div>

          {stats.totalUsers && (
            <div className={adminDashboardClasses.statCard} style={styles.statCard}>
              <div className={adminDashboardClasses.statIcon} style={styles.statIcon}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className={adminDashboardClasses.statContent} style={styles.statContent}>
                <div className={adminDashboardClasses.statValue} style={styles.statValue}>
                  {stats.totalUsers}
                </div>
                <div className={adminDashboardClasses.statLabel} style={styles.statLabel}>
                  Total Users
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className={adminDashboardClasses.quickActions} style={styles.quickActions}>
            <h3 className={adminDashboardClasses.sectionTitle} style={styles.sectionTitle}>
              Quick Actions
            </h3>
            <div className={adminDashboardClasses.actionsGrid} style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className={adminDashboardClasses.actionButton}
                  style={styles.actionButton}
                  onClick={action.onClick}
                >
                  {action.icon && (
                    <span className={adminDashboardClasses.actionIcon} style={styles.actionIcon}>
                      {action.icon}
                    </span>
                  )}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className={adminDashboardClasses.chartsSection} style={styles.chartsSection}>
          <div className={adminDashboardClasses.chartsGrid} style={styles.chartsGrid}>
            {/* User Retention Trends */}
            {retentionData.length > 0 && (
              <div className={adminDashboardClasses.chartContainer} style={styles.chartContainer}>
                <UserRetention
                  title="User Retention Trends"
                  data={retentionData}
                  height={300}
                  color={tenantTheme.colors.primary}
                  showGrid={true}
                  showLegend={true}
                  variant={variant}
                  onDataPointClick={onRetentionPointClick}
                />
              </div>
            )}

            {/* Engagement Breakdown */}
            {engagementData.length > 0 && (
              <div className={adminDashboardClasses.chartContainer} style={styles.chartContainer}>
                <EngagementBreakdown
                  title="Engagement Breakdown"
                  data={engagementData}
                  size={300}
                  onSegmentClick={onEngagementSegmentClick}
                />
              </div>
            )}

            {/* Engagement Trends */}
            {trendsData.length > 0 && (
              <div className={adminDashboardClasses.chartContainer} style={styles.chartContainer}>
                <EngagementTrends
                  title="Engagement Trends"
                  data={trendsData}
                  height={300}
                  onDataPointClick={onTrendsPointClick}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className={adminDashboardClasses.bottomSection} style={styles.bottomSection}>
          <div className={adminDashboardClasses.bottomGrid} style={styles.bottomGrid}>
            {/* Recent Activities */}
            {activitiesData.length > 0 && (
              <div className={adminDashboardClasses.activityContainer} style={styles.activityContainer}>
                <RecentActivities
                  title="Recent Activities"
                  activities={activitiesData}
                  variant={variant}
                  onActivityClick={onActivityClick}
                />
              </div>
            )}

            {/* Last Survey */}
            {surveyData && (
              <div className={adminDashboardClasses.surveyContainer} style={styles.surveyContainer}>
                <LastSurvey
                  title="Last Survey"
                  survey={surveyData}
                  variant={variant}
                  onViewSurvey={onSurveyView}
                  onEditSurvey={onSurveyEdit}
                  onShareSurvey={onSurveyShare}
                />
              </div>
            )}

            {/* Permission Requests */}
            {permissionData.length > 0 && (
              <div className={adminDashboardClasses.permissionsContainer} style={styles.permissionsContainer}>
                <PermissionRequest
                  title="Permission Requests"
                  requests={permissionData}
                  variant={variant}
                  onApprove={onPermissionApprove}
                  onDeny={onPermissionDeny}
                  onViewDetails={onPermissionViewDetails}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const AdminDashboard = withSSR(AdminDashboardComponent);