import { defaultTheme, TenantTheme } from '../theme';

export interface GroupDashboardCardStyles {
  container: string;
  header: string;
  title: string;
  memberAvatars: string;
  avatar: string;
  avatarOverflow: string;
  roleBadge: string;
  activeUsers: string;
  progressBar: string;
  progressFill: string;
  statusSection: string;
  statusIcon: string;
  statusLabel: string;
  statusBadge: string;
  footer: string;
  userAvatar: string;
  addUserButton: string;
  counters: string;
  counter: string;
  actions: string;
  actionButton: string;
  editButton: string;
}

export const getGroupDashboardCardStyles = (
  tenantTheme: TenantTheme = defaultTheme,
  variant: 'default' | 'compact' | 'minimal' = 'default'
): GroupDashboardCardStyles => {
  const colors = tenantTheme?.colors || defaultTheme.colors;
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'p-4',
          title: 'text-base',
          subtitle: 'text-sm',
          progress: 'h-2',
        };
      case 'minimal':
        return {
          container: 'p-3',
          title: 'text-sm',
          subtitle: 'text-xs',
          progress: 'h-1.5',
        };
      case 'default':
      default:
        return {
          container: 'p-6',
          title: 'text-lg',
          subtitle: 'text-base',
          progress: 'h-3',
        };
    }
  };

  const styles = getVariantStyles();

  return {
    container: `${styles.container} bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200`,
    header: 'flex items-center justify-between mb-4',
    title: `${styles.title} font-semibold text-gray-900`,
    memberAvatars: 'flex items-center -space-x-2',
    avatar: 'w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600',
    avatarOverflow: 'w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600',
    roleBadge: 'px-3 py-1 rounded-full text-sm font-medium',
    activeUsers: 'mb-4',
    progressBar: 'flex-1 bg-gray-200 rounded-full overflow-hidden',
    progressFill: `${styles.progress} bg-purple-500 transition-all duration-300`,
    statusSection: 'flex items-center justify-between mb-4',
    statusIcon: 'w-4 h-4 text-purple-600',
    statusLabel: `${styles.subtitle} text-gray-700`,
    statusBadge: 'px-2 py-1 rounded-full text-xs font-medium',
    footer: 'flex items-center justify-between pt-4 border-t border-gray-100',
    userAvatar: 'w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center',
    addUserButton: 'w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors duration-200',
    counters: 'flex items-center space-x-4',
    counter: 'flex items-center space-x-1 text-gray-600',
    actions: 'mt-4 pt-4 border-t border-gray-100',
    actionButton: 'text-sm text-gray-600 hover:text-gray-900 font-medium',
    editButton: 'p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200',
  };
};

export const getRoleColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'super admin':
      return 'bg-blue-100 text-blue-800';
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'moderator':
      return 'bg-yellow-100 text-yellow-800';
    case 'member':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'backlog':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-yellow-500';
  if (percentage >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

export const getAvatarInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatUserCount = (count: number): string => {
  if (count === 1) return 'User';
  return 'Users';
};

export const formatProgressPercentage = (current: number, max: number): number => {
  if (max === 0) return 0;
  return Math.round((current / max) * 100);
};

export const getResponsiveGridClasses = (variant: 'default' | 'compact' | 'minimal' = 'default'): string => {
  switch (variant) {
    case 'compact':
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';
    case 'minimal':
      return 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3';
    case 'default':
    default:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  }
};

export const getCardHoverEffects = (): string => {
  return 'hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer';
};

export const getLoadingSkeleton = (): string => {
  return 'animate-pulse bg-gray-200 rounded-lg';
};

export const getErrorState = (): string => {
  return 'bg-red-50 border-red-200 text-red-800';
};

export const getEmptyState = (): string => {
  return 'bg-gray-50 border-gray-200 text-gray-500';
};

export const getSuccessState = (): string => {
  return 'bg-green-50 border-green-200 text-green-800';
};

export const getWarningState = (): string => {
  return 'bg-yellow-50 border-yellow-200 text-yellow-800';
};

export const getInfoState = (): string => {
  return 'bg-blue-50 border-blue-200 text-blue-800';
};

// Animation utilities
export const getFadeInAnimation = (delay: number = 0): string => {
  return `animate-fade-in-${delay}`;
};

export const getSlideInAnimation = (direction: 'left' | 'right' | 'up' | 'down' = 'up'): string => {
  return `animate-slide-in-${direction}`;
};

export const getBounceAnimation = (): string => {
  return 'animate-bounce';
};

export const getPulseAnimation = (): string => {
  return 'animate-pulse';
};

export const getSpinAnimation = (): string => {
  return 'animate-spin';
};

// Responsive utilities
export const getResponsiveText = (size: 'sm' | 'md' | 'lg' | 'xl'): string => {
  const sizes = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
  };
  return sizes[size];
};

export const getResponsiveSpacing = (size: 'sm' | 'md' | 'lg' | 'xl'): string => {
  const sizes = {
    sm: 'p-2 sm:p-3',
    md: 'p-3 sm:p-4',
    lg: 'p-4 sm:p-6',
    xl: 'p-6 sm:p-8',
  };
  return sizes[size];
};

export const getResponsiveGrid = (cols: { mobile: number; tablet: number; desktop: number }): string => {
  return `grid grid-cols-${cols.mobile} md:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;
};

// Accessibility utilities
export const getFocusRing = (): string => {
  return 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
};

export const getScreenReaderOnly = (): string => {
  return 'sr-only';
};

export const getHighContrast = (): string => {
  return 'contrast-more:border-gray-800 contrast-more:text-gray-900';
};

// Dark mode utilities
export const getDarkModeClasses = (): string => {
  return 'dark:bg-gray-800 dark:border-gray-700 dark:text-white';
};

export const getDarkModeHover = (): string => {
  return 'dark:hover:bg-gray-700 dark:hover:border-gray-600';
};

export const getDarkModeText = (): string => {
  return 'dark:text-gray-100';
};

export const getDarkModeBorder = (): string => {
  return 'dark:border-gray-600';
};

// Print utilities
export const getPrintHidden = (): string => {
  return 'print:hidden';
};

export const getPrintVisible = (): string => {
  return 'print:block';
};

export const getPrintText = (): string => {
  return 'print:text-black';
};

export const getPrintBackground = (): string => {
  return 'print:bg-white';
};
