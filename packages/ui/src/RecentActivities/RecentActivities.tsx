import React from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { 
  getRecentActivitiesStyles, 
  recentActivitiesClasses,
  recentActivitiesCSS 
} from './styles';

export interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  action: string;
  time: string;
  status: 'online' | 'offline';
  avatarColor?: string;
}

export interface RecentActivitiesProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  title?: string;
  activities: Activity[];
  maxItems?: number;
  showStatus?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  onActivityClick?: (activity: Activity) => void;
}

const RecentActivitiesComponent: React.FC<RecentActivitiesProps> = ({
  tenantTheme = defaultTheme,
  title = 'Recent Activities',
  activities,
  maxItems = 4,
  showStatus = true,
  className = '',
  variant = 'default',
  onActivityClick,
  ...props
}) => {
  const styles = getRecentActivitiesStyles(tenantTheme, variant);

  const displayActivities = activities.slice(0, maxItems);

  const getAvatarColor = (activity: Activity) => {
    if (activity.avatarColor) return activity.avatarColor;
    
    // Generate consistent color based on user name
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ];
    const hash = activity.user.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (activities.length === 0) {
    return (
      <>
        <style>{recentActivitiesCSS}</style>
        <div className={`${recentActivitiesClasses.container} ${className}`} style={styles.container}>
          <h3 className={recentActivitiesClasses.title} style={styles.title}>
            {title}
          </h3>
          <div className={recentActivitiesClasses.emptyState} style={styles.emptyState}>
            <p>No recent activities</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{recentActivitiesCSS}</style>
      <div className={`${recentActivitiesClasses.container} ${className}`} style={styles.container} {...props}>
        <h3 className={recentActivitiesClasses.title} style={styles.title}>
          {title}
        </h3>
        <div className={recentActivitiesClasses.activitiesList} style={styles.activitiesList}>
          {displayActivities.map((activity) => (
            <div
              key={activity.id}
              className={recentActivitiesClasses.activityItem}
              style={styles.activityItem}
              onClick={() => onActivityClick?.(activity)}
            >
              {/* Avatar */}
              <div
                className={recentActivitiesClasses.activityAvatar}
                style={{
                  ...styles.activityAvatar,
                  backgroundColor: getAvatarColor(activity)
                }}
              >
                {activity.user.avatar ? (
                  <img
                    src={activity.user.avatar}
                    alt={activity.user.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  activity.user.initials || getInitials(activity.user.name)
                )}
              </div>

              {/* Content */}
              <div className={recentActivitiesClasses.activityContent} style={styles.activityContent}>
                <div className={recentActivitiesClasses.activityName} style={styles.activityName}>
                  {activity.user.name}
                </div>
                <div className={recentActivitiesClasses.activityAction} style={styles.activityAction}>
                  {activity.action}
                </div>
                <div className={recentActivitiesClasses.activityTime} style={styles.activityTime}>
                  {activity.time}
                </div>
              </div>

              {/* Status */}
              {showStatus && (
                <div
                  className={recentActivitiesClasses.activityStatus}
                  style={{
                    ...styles.activityStatus,
                    backgroundColor: activity.status === 'online' ? '#10B981' : '#EF4444'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const RecentActivities = withSSR(RecentActivitiesComponent);