import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import {
  getUserDashboardStyles,
  userDashboardClasses,
  userDashboardCSS
} from './styles';

export interface UserDashboardProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  title?: string;
  subtitle?: string;
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
  variant?: 'default' | 'compact' | 'detailed';
  loading?: boolean;
  onCourseClick?: (course: { id: string; title: string; description?: string; progress: number; status: 'not-started' | 'in-progress' | 'completed'; instructor: string; duration: string; thumbnail?: string; lastAccessed?: string }) => void;
  onActivityClick?: (activity: { id: string; type: 'course' | 'quiz' | 'assignment' | 'announcement'; title: string; description?: string; time: string; status: 'new' | 'completed' | 'pending'; courseTitle?: string }) => void;
  onAnnouncementClick?: (announcement: { id: string; title: string; content: string; author: string; createdAt: string; priority: 'low' | 'medium' | 'high'; isRead: boolean }) => void;
}

const UserDashboardComponent: React.FC<UserDashboardProps> = ({
  tenantTheme = defaultTheme,
  title = 'Welcome to Ideavibes',
  subtitle = 'Your learning management dashboard',
  currentTenant,
  user,
  stats = {
    totalCourses: 0,
    activeStudents: 0,
    completionRate: 0
  },
  myCourses = [],
  recentActivities = [],
  announcements = [],
  quickActions = [],
  variant = 'default',
  loading = false,
  onCourseClick,
  onActivityClick,
  onAnnouncementClick,
  className = '',
  style,
  ...props
}) => {
  const { styles, userDashboardClasses } = getUserDashboardStyles(tenantTheme, variant);

  if (loading) {
    return (
      <>
        <style>{userDashboardCSS}</style>
        <div className={`${userDashboardClasses.container} ${className}`} style={{ ...styles.container, ...style }}>
          <div className={userDashboardClasses.loading} style={styles.loading}>
            <div className={userDashboardClasses.spinner} style={styles.spinner} />
            <p style={styles.loadingText}>Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{userDashboardCSS}</style>
      <div className={`${userDashboardClasses.container} ${className}`} style={{ ...styles.container, ...style }} {...props}>
        {/* Header */}
        <div className={userDashboardClasses.header} style={styles.header}>
          <div className={userDashboardClasses.headerContent} style={styles.headerContent}>
            <div>
              <h1 className={userDashboardClasses.title} style={styles.title}>
                {title}
              </h1>
              {subtitle && (
                <p className={userDashboardClasses.subtitle} style={styles.subtitle}>
                  {subtitle}
                </p>
              )}
            </div>
            {currentTenant && (
              <div className={userDashboardClasses.tenantInfo} style={styles.tenantInfo}>
                <div className={userDashboardClasses.tenantLabel} style={styles.tenantLabel}>
                  Current Tenant
                </div>
                <div className={userDashboardClasses.tenantName} style={styles.tenantName}>
                  {currentTenant.name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className={userDashboardClasses.statsGrid} style={styles.statsGrid}>
          <div className={userDashboardClasses.statCard} style={styles.statCard}>
            <div className={userDashboardClasses.statIcon} style={styles.statIcon}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className={userDashboardClasses.statContent} style={styles.statContent}>
              <div className={userDashboardClasses.statValue} style={styles.statValue}>
                {stats.totalCourses}
              </div>
              <div className={userDashboardClasses.statLabel} style={styles.statLabel}>
                Total Courses
              </div>
            </div>
          </div>

          <div className={userDashboardClasses.statCard} style={styles.statCard}>
            <div className={userDashboardClasses.statIcon} style={styles.statIcon}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className={userDashboardClasses.statContent} style={styles.statContent}>
              <div className={userDashboardClasses.statValue} style={styles.statValue}>
                {stats.activeStudents}
              </div>
              <div className={userDashboardClasses.statLabel} style={styles.statLabel}>
                Active Students
              </div>
            </div>
          </div>

          <div className={userDashboardClasses.statCard} style={styles.statCard}>
            <div className={userDashboardClasses.statIcon} style={styles.statIcon}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className={userDashboardClasses.statContent} style={styles.statContent}>
              <div className={userDashboardClasses.statValue} style={styles.statValue}>
                {stats.completionRate}%
              </div>
              <div className={userDashboardClasses.statLabel} style={styles.statLabel}>
                Completion Rate
              </div>
            </div>
          </div>

          {stats.myCourses && (
            <div className={userDashboardClasses.statCard} style={styles.statCard}>
              <div className={userDashboardClasses.statIcon} style={styles.statIcon}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className={userDashboardClasses.statContent} style={styles.statContent}>
                <div className={userDashboardClasses.statValue} style={styles.statValue}>
                  {stats.myCourses}
                </div>
                <div className={userDashboardClasses.statLabel} style={styles.statLabel}>
                  My Courses
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className={userDashboardClasses.quickActions} style={styles.quickActions}>
            <h3 className={userDashboardClasses.sectionTitle} style={styles.sectionTitle}>
              Quick Actions
            </h3>
            <div className={userDashboardClasses.actionsGrid} style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className={userDashboardClasses.actionButton}
                  style={styles.actionButton}
                  onClick={action.onClick}
                >
                  {action.icon && (
                    <span className={userDashboardClasses.actionIcon} style={styles.actionIcon}>
                      {action.icon}
                    </span>
                  )}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className={userDashboardClasses.mainGrid} style={styles.mainGrid}>
          {/* My Courses */}
          {myCourses.length > 0 && (
            <div className={userDashboardClasses.coursesSection} style={styles.coursesSection}>
              <div className={userDashboardClasses.sectionHeader} style={styles.sectionHeader}>
                <h3 className={userDashboardClasses.sectionTitle} style={styles.sectionTitle}>
                  My Courses
                </h3>
                <button className={userDashboardClasses.viewAllButton} style={styles.viewAllButton}>
                  View All
                </button>
              </div>
              <div className={userDashboardClasses.coursesGrid} style={styles.coursesGrid}>
                {myCourses.slice(0, 4).map((course) => (
                  <div
                    key={course.id}
                    className={userDashboardClasses.courseCard}
                    style={styles.courseCard}
                    onClick={() => onCourseClick?.(course)}
                  >
                    {course.thumbnail && (
                      <div className={userDashboardClasses.courseThumbnail} style={styles.courseThumbnail}>
                        <img src={course.thumbnail} alt={course.title} />
                      </div>
                    )}
                    <div className={userDashboardClasses.courseContent} style={styles.courseContent}>
                      <h4 className={userDashboardClasses.courseTitle} style={styles.courseTitle}>
                        {course.title}
                      </h4>
                      <p className={userDashboardClasses.courseInstructor} style={styles.courseInstructor}>
                        {course.instructor}
                      </p>
                      <div className={userDashboardClasses.courseProgress} style={styles.courseProgress}>
                        <div className={userDashboardClasses.progressBar} style={styles.progressBar}>
                          <div
                            className={userDashboardClasses.progressFill}
                            style={{
                              ...styles.progressFill,
                              width: `${course.progress}%`,
                            }}
                          />
                        </div>
                        <span className={userDashboardClasses.progressText} style={styles.progressText}>
                          {course.progress}%
                        </span>
                      </div>
                      <div className={userDashboardClasses.courseStatus} style={styles.courseStatus}>
                        <span
                          className={userDashboardClasses.statusBadge}
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: course.status === 'completed' ? theme.colors.success : 
                                           course.status === 'in-progress' ? theme.colors.info : 
                                           theme.colors.warning,
                          }}
                        >
                          {course.status === 'completed' ? 'Completed' : 
                           course.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activities */}
          {recentActivities.length > 0 && (
            <div className={userDashboardClasses.activitiesSection} style={styles.activitiesSection}>
              <h3 className={userDashboardClasses.sectionTitle} style={styles.sectionTitle}>
                Recent Activities
              </h3>
              <div className={userDashboardClasses.activitiesList} style={styles.activitiesList}>
                {recentActivities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className={userDashboardClasses.activityItem}
                    style={styles.activityItem}
                    onClick={() => onActivityClick?.(activity)}
                  >
                    <div className={userDashboardClasses.activityIcon} style={styles.activityIcon}>
                      {activity.type === 'course' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {activity.type === 'quiz' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {activity.type === 'assignment' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                      {activity.type === 'announcement' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      )}
                    </div>
                    <div className={userDashboardClasses.activityContent} style={styles.activityContent}>
                      <h4 className={userDashboardClasses.activityTitle} style={styles.activityTitle}>
                        {activity.title}
                      </h4>
                      {activity.courseTitle && (
                        <p className={userDashboardClasses.activityCourse} style={styles.activityCourse}>
                          {activity.courseTitle}
                        </p>
                      )}
                      <p className={userDashboardClasses.activityTime} style={styles.activityTime}>
                        {activity.time}
                      </p>
                    </div>
                    <div className={userDashboardClasses.activityStatus} style={styles.activityStatus}>
                      <span
                        className={userDashboardClasses.statusDot}
                        style={{
                          ...styles.statusDot,
                          backgroundColor: activity.status === 'completed' ? theme.colors.success : 
                                         activity.status === 'pending' ? theme.colors.warning : 
                                         theme.colors.info,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Announcements */}
          {announcements.length > 0 && (
            <div className={userDashboardClasses.announcementsSection} style={styles.announcementsSection}>
              <h3 className={userDashboardClasses.sectionTitle} style={styles.sectionTitle}>
                Announcements
              </h3>
              <div className={userDashboardClasses.announcementsList} style={styles.announcementsList}>
                {announcements.slice(0, 3).map((announcement) => (
                  <div
                    key={announcement.id}
                    className={userDashboardClasses.announcementItem}
                    style={styles.announcementItem}
                    onClick={() => onAnnouncementClick?.(announcement)}
                  >
                    <div className={userDashboardClasses.announcementHeader} style={styles.announcementHeader}>
                      <h4 className={userDashboardClasses.announcementTitle} style={styles.announcementTitle}>
                        {announcement.title}
                      </h4>
                      <span
                        className={userDashboardClasses.priorityBadge}
                        style={{
                          ...styles.priorityBadge,
                          backgroundColor: announcement.priority === 'high' ? theme.colors.error : 
                                         announcement.priority === 'medium' ? theme.colors.warning : 
                                         theme.colors.info,
                        }}
                      >
                        {announcement.priority}
                      </span>
                    </div>
                    <p className={userDashboardClasses.announcementContent} style={styles.announcementContent}>
                      {announcement.content}
                    </p>
                    <div className={userDashboardClasses.announcementFooter} style={styles.announcementFooter}>
                      <span className={userDashboardClasses.announcementAuthor} style={styles.announcementAuthor}>
                        {announcement.author}
                      </span>
                      <span className={userDashboardClasses.announcementDate} style={styles.announcementDate}>
                        {announcement.createdAt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const UserDashboard = withSSR(UserDashboardComponent);
