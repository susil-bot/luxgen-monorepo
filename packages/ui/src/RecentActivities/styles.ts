import { TenantTheme } from '../types';

// Helper function to get variant-specific styles
const getVariantStyles = (variant: 'default' | 'compact' | 'detailed') => {
  switch (variant) {
    case 'compact':
      return {
        containerPadding: '12px',
        titleSize: '1rem',
        avatarSize: '32px',
        itemPadding: '8px',
        nameSize: '0.875rem',
        actionSize: '0.75rem',
        timeSize: '0.75rem',
      };
    case 'detailed':
      return {
        containerPadding: '24px',
        titleSize: '1.25rem',
        avatarSize: '48px',
        itemPadding: '16px',
        nameSize: '1rem',
        actionSize: '0.875rem',
        timeSize: '0.875rem',
      };
    default: // default variant
      return {
        containerPadding: '20px',
        titleSize: '1.125rem',
        avatarSize: '40px',
        itemPadding: '12px',
        nameSize: '0.875rem',
        actionSize: '0.75rem',
        timeSize: '0.75rem',
      };
  }
};

// Main function to get all styles for the RecentActivities component
export const getRecentActivitiesStyles = (
  tenantTheme: TenantTheme,
  variant: 'default' | 'compact' | 'detailed'
) => {
  const variantStyles = getVariantStyles(variant);

  return {
    container: {
      backgroundColor: tenantTheme.colors.surface || '#FFFFFF',
      borderRadius: '12px',
      padding: variantStyles.containerPadding,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      border: `1px solid ${tenantTheme.colors.border || '#E2E8F0'}`,
      fontFamily: tenantTheme.fonts.primary,
      color: tenantTheme.colors.text,
    },

    title: {
      fontSize: variantStyles.titleSize,
      fontWeight: '600',
      color: tenantTheme.colors.text,
      margin: 0,
      marginBottom: '16px',
    },

    activitiesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },

    activityItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: variantStyles.itemPadding,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: `1px solid transparent`,
    },

    activityAvatar: {
      width: variantStyles.avatarSize,
      height: variantStyles.avatarSize,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: '0.875rem',
      flexShrink: 0,
    },

    activityContent: {
      flex: 1,
      minWidth: 0,
    },

    activityName: {
      fontSize: variantStyles.nameSize,
      fontWeight: '600',
      color: tenantTheme.colors.text,
      margin: 0,
      marginBottom: '2px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    activityAction: {
      fontSize: variantStyles.actionSize,
      color: tenantTheme.colors.textSecondary || '#64748B',
      margin: 0,
      marginBottom: '2px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    activityTime: {
      fontSize: variantStyles.timeSize,
      color: tenantTheme.colors.textSecondary || '#64748B',
      margin: 0,
    },

    activityStatus: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      flexShrink: 0,
    },

    emptyState: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '120px',
      backgroundColor: tenantTheme.colors.background || '#F8FAFC',
      borderRadius: '8px',
      border: `2px dashed ${tenantTheme.colors.border || '#E2E8F0'}`,
      color: tenantTheme.colors.textSecondary || '#64748B',
      fontSize: '0.875rem',
    },
  };
};

// CSS classes for additional styling
export const recentActivitiesClasses = {
  container: 'recent-activities-container',
  title: 'recent-activities-title',
  activitiesList: 'recent-activities-list',
  activityItem: 'recent-activities-item',
  activityAvatar: 'recent-activities-avatar',
  activityContent: 'recent-activities-content',
  activityName: 'recent-activities-name',
  activityAction: 'recent-activities-action',
  activityTime: 'recent-activities-time',
  activityStatus: 'recent-activities-status',
  emptyState: 'recent-activities-empty',
};

// CSS styles for additional hover effects and animations
export const recentActivitiesCSS = `
  .recent-activities-container {
    transition: all 0.2s ease;
  }

  .recent-activities-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .recent-activities-item {
    transition: all 0.2s ease;
  }

  .recent-activities-item:hover {
    background-color: #F8FAFC;
    border-color: #E2E8F0;
    transform: translateX(4px);
  }

  .recent-activities-avatar {
    transition: all 0.2s ease;
  }

  .recent-activities-item:hover .recent-activities-avatar {
    transform: scale(1.1);
  }
`;