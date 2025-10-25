import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { PageLayout } from '../Layout';
import { UserDashboard } from '../UserDashboard';
import { getDefaultNavItems, getDefaultUser, getDefaultLogo } from '../Layout/DefaultNavigation';
import {
  getUserDashboardLayoutStyles,
  userDashboardLayoutClasses,
  userDashboardLayoutCSS
} from './styles';

export interface UserDashboardLayoutProps extends BaseComponentProps {
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
  dashboardData?: {
    title?: string;
    subtitle?: string;
    stats?: {
      totalCourses: number;
      activeStudents: number;
      completionRate: number;
      myCourses?: number;
      completedCourses?: number;
      inProgressCourses?: number;
    };
    myCourses?: Array<{
      id: string;
      title: string;
      description?: string;
      progress: number;
      status: 'not-started' | 'in-progress' | 'completed';
      instructor: string;
      duration: string;
      thumbnail?: string;
      lastAccessed?: string;
    }>;
    recentActivities?: Array<{
      id: string;
      type: 'course' | 'quiz' | 'assignment' | 'announcement';
      title: string;
      description?: string;
      time: string;
      status: 'new' | 'completed' | 'pending';
      courseTitle?: string;
    }>;
    announcements?: Array<{
      id: string;
      title: string;
      content: string;
      author: string;
      createdAt: string;
      priority: 'low' | 'medium' | 'high';
      isRead: boolean;
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
  responsive?: boolean;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  desktopBreakpoint?: number;
  onCourseClick?: (course: { id: string; title: string; description?: string; progress: number; status: 'not-started' | 'in-progress' | 'completed'; instructor: string; duration: string; thumbnail?: string; lastAccessed?: string }) => void;
  onActivityClick?: (activity: { id: string; type: 'course' | 'quiz' | 'assignment' | 'announcement'; title: string; description?: string; time: string; status: 'new' | 'completed' | 'pending'; courseTitle?: string }) => void;
  onAnnouncementClick?: (announcement: { id: string; title: string; content: string; author: string; createdAt: string; priority: 'low' | 'medium' | 'high'; isRead: boolean }) => void;
}

const UserDashboardLayoutComponent: React.FC<UserDashboardLayoutProps> = ({
  tenantTheme = defaultTheme,
  currentTenant,
  user = getDefaultUser(),
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
  responsive = true,
  mobileBreakpoint = 768,
  tabletBreakpoint = 1024,
  desktopBreakpoint = 1280,
  onCourseClick,
  onActivityClick,
  onAnnouncementClick,
  className = '',
  style,
  ...props
}) => {
  const { styles, userDashboardLayoutClasses } = getUserDashboardLayoutStyles(tenantTheme, variant);

  const navItems = getDefaultNavItems();
  const logo = getDefaultLogo();

  return (
    <>
      <style>{userDashboardLayoutCSS}</style>
      <div className={`${userDashboardLayoutClasses.container} ${className}`} style={{ ...styles.container, ...style }} {...props}>
        <PageLayout
          tenantTheme={tenantTheme}
          navItems={navItems}
          user={user}
          onUserAction={onUserAction}
          onSearch={onSearch}
          onNotificationClick={onNotificationClick}
          showSearch={showSearch}
          showNotifications={showNotifications}
          notificationCount={notificationCount}
          searchPlaceholder={searchPlaceholder}
          logo={logo}
          responsive={responsive}
          mobileBreakpoint={mobileBreakpoint}
          tabletBreakpoint={tabletBreakpoint}
          desktopBreakpoint={desktopBreakpoint}
        >
          <UserDashboard
            tenantTheme={tenantTheme}
            title={dashboardData.title || 'Welcome to Ideavibes'}
            subtitle={dashboardData.subtitle || 'Your learning management dashboard'}
            currentTenant={currentTenant}
            user={user}
            stats={dashboardData.stats}
            myCourses={dashboardData.myCourses}
            recentActivities={dashboardData.recentActivities}
            announcements={dashboardData.announcements}
            quickActions={dashboardData.quickActions}
            variant={variant}
            loading={loading}
            onCourseClick={onCourseClick}
            onActivityClick={onActivityClick}
            onAnnouncementClick={onAnnouncementClick}
          />
        </PageLayout>
      </div>
    </>
  );
};

export const UserDashboardLayout = withSSR(UserDashboardLayoutComponent);
