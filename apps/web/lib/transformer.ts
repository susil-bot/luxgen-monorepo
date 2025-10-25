import { UserMenu } from '@luxgen/ui';

export interface DashboardData {
  stats: {
    totalCourses: number;
    activeStudents: number;
    completionRate: number;
    totalGroups: number;
    pendingRequests: number;
    recentActivities: number;
  };
  userRetention: {
    period: string;
    retention: number;
    users: number;
  };
  engagementBreakdown: Array<{
    category: string;
    value: number;
    color: string;
  }>;
  engagementTrends: Array<{
    date: string;
    activeUsers: number;
    completedCourses: number;
    newUsers: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    user: string;
    userAvatar: string;
    timestamp: string;
    status: string;
    metadata: any;
  }>;
  lastSurvey: {
    id: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    totalQuestions: number;
    completedQuestions: number;
    createdAt: string;
    expiresAt: string;
    responses: number;
  };
  permissionRequests: Array<{
    id: string;
    user: string;
    userAvatar: string;
    requestType: string;
    description: string;
    status: string;
    requestedAt: string;
    metadata: any;
  }>;
}

export interface TransformedDashboardData {
  title: string;
  subtitle: string;
  currentTenant: string;
  stats: {
    totalCourses: number;
    activeStudents: number;
    completionRate: number;
    totalUsers: number;
  };
  retentionData: Array<{
    date: string;
    value: number;
    label: string;
  }>;
  engagementData: Array<{
    id: string;
    label: string;
    value: number;
    color: string;
    percentage: number;
  }>;
  trendsData: Array<{
    label: string;
    interactions: number;
    completions: number;
  }>;
  activitiesData: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    user: string;
    userAvatar: string;
    timestamp: string;
    status: string;
    metadata: any;
  }>;
  surveyData: {
    id: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    totalQuestions: number;
    completedQuestions: number;
    createdAt: string;
    expiresAt: string;
    totalResponses: number;
    targetResponses: number;
  };
  requestsData: Array<{
    id: string;
    user: string;
    userAvatar: string;
    requestType: string;
    description: string;
    status: string;
    requestedAt: string;
    metadata: any;
  }>;
}

/**
 * Default fallback data when GraphQL fails
 */
export const getDefaultDashboardData = (tenant: string): DashboardData => ({
  stats: {
    totalCourses: 12,
    activeStudents: 156,
    completionRate: 87,
    totalGroups: 8,
    pendingRequests: 3,
    recentActivities: 15,
  },
  userRetention: {
    period: '30d',
    retention: 85,
    users: 1200,
  },
  engagementBreakdown: [
    { category: 'Courses', value: 45, color: '#3B82F6' },
    { category: 'Groups', value: 30, color: '#10B981' },
    { category: 'Discussions', value: 25, color: '#F59E0B' },
  ],
  engagementTrends: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    activeUsers: Math.floor(Math.random() * 50) + 100,
    completedCourses: Math.floor(Math.random() * 20) + 10,
    newUsers: Math.floor(Math.random() * 10) + 5,
  })),
  recentActivities: [
    {
      id: '1',
      type: 'course_completed',
      title: 'Advanced React Patterns',
      description: 'John Doe completed the course',
      user: 'John Doe',
      userAvatar: 'https://via.placeholder.com/40',
      timestamp: new Date().toISOString(),
      status: 'completed',
      metadata: { courseId: 'react-advanced' },
    },
    {
      id: '2',
      type: 'group_joined',
      title: 'Frontend Developers',
      description: 'Sarah joined the group',
      user: 'Sarah Wilson',
      userAvatar: 'https://via.placeholder.com/40',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      metadata: { groupId: 'frontend-dev' },
    },
  ],
  lastSurvey: {
    id: 'survey-1',
    title: 'Q1 2024 Learning Feedback',
    description: 'Help us improve your learning experience',
    status: 'active',
    progress: 75,
    totalQuestions: 20,
    completedQuestions: 15,
    createdAt: '2024-01-15T00:00:00Z',
    expiresAt: '2024-02-15T00:00:00Z',
    responses: 45,
  },
  permissionRequests: [
    {
      id: 'req-1',
      user: 'Mike Johnson',
      userAvatar: 'https://via.placeholder.com/40',
      requestType: 'course_access',
      description: 'Request access to Advanced JavaScript course',
      status: 'pending',
      requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      metadata: { courseId: 'js-advanced' },
    },
  ],
});

/**
 * Transform GraphQL dashboard data to component format
 */
export const transformDashboardData = (
  graphqlData: any,
  tenant: string
): TransformedDashboardData => {
  // Use GraphQL data if available, otherwise use defaults
  const data = graphqlData?.getDashboardData || getDefaultDashboardData(tenant);

  return {
    title: `Welcome to ${tenant.charAt(0).toUpperCase() + tenant.slice(1)}`,
    subtitle: 'Your learning management dashboard',
    currentTenant: tenant,
    stats: {
      totalCourses: data.stats?.totalCourses || 12,
      activeStudents: data.stats?.activeStudents || 156,
      completionRate: data.stats?.completionRate || 87,
      totalUsers: data.stats?.totalGroups || 8,
    },
    retentionData: data.userRetention ? [{
      date: data.userRetention.period,
      value: data.userRetention.retention,
      label: data.userRetention.period,
    }] : [{
      date: '30d',
      value: 85,
      label: '30 days',
    }],
    engagementData: data.engagementBreakdown?.map((item: any) => ({
      id: item.category.toLowerCase().replace(/\s+/g, '-'),
      label: item.category,
      value: item.value,
      color: item.color,
      percentage: item.value,
    })) || [
      { id: 'courses', label: 'Courses', value: 45, color: '#3B82F6', percentage: 45 },
      { id: 'groups', label: 'Groups', value: 30, color: '#10B981', percentage: 30 },
      { id: 'discussions', label: 'Discussions', value: 25, color: '#F59E0B', percentage: 25 },
    ],
    trendsData: data.engagementTrends?.map((item: any) => ({
      label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      interactions: item.activeUsers,
      completions: item.completedCourses,
    })) || Array.from({ length: 7 }, (_, i) => ({
      label: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      interactions: Math.floor(Math.random() * 50) + 100,
      completions: Math.floor(Math.random() * 20) + 10,
    })),
    activitiesData: data.recentActivities?.map((activity: any) => ({
      id: activity.id,
      user: {
        name: activity.user,
        avatar: activity.userAvatar,
      },
      action: activity.description,
      time: new Date(activity.timestamp).toLocaleString(),
      status: activity.status === 'completed' || activity.status === 'active' ? 'online' : 'offline',
      avatarColor: activity.userAvatar ? undefined : '#3B82F6',
    })) || [
      {
        id: '1',
        user: { name: 'John Doe', avatar: undefined },
        action: 'Completed Advanced React Patterns course',
        time: '2 hours ago',
        status: 'online' as const,
        avatarColor: '#3B82F6',
      },
      {
        id: '2',
        user: { name: 'Sarah Wilson', avatar: undefined },
        action: 'Joined Frontend Developers group',
        time: '4 hours ago',
        status: 'online' as const,
        avatarColor: '#10B981',
      },
      {
        id: '3',
        user: { name: 'Mike Johnson', avatar: undefined },
        action: 'Started JavaScript Fundamentals',
        time: '6 hours ago',
        status: 'offline' as const,
        avatarColor: '#F59E0B',
      },
      {
        id: '4',
        user: { name: 'Emily Davis', avatar: undefined },
        action: 'Completed CSS Grid course',
        time: '1 day ago',
        status: 'online' as const,
        avatarColor: '#8B5CF6',
      },
    ],
    surveyData: data.lastSurvey ? {
      id: data.lastSurvey.id,
      title: data.lastSurvey.title,
      description: data.lastSurvey.description,
      status: data.lastSurvey.status,
      progress: data.lastSurvey.progress,
      totalQuestions: data.lastSurvey.totalQuestions,
      completedQuestions: data.lastSurvey.completedQuestions,
      createdAt: data.lastSurvey.createdAt,
      expiresAt: data.lastSurvey.expiresAt,
      totalResponses: data.lastSurvey.responses,
      targetResponses: 100,
    } : {
      id: 'default-survey',
      title: 'Default Survey',
      description: 'No survey data available',
      status: 'inactive',
      progress: 0,
      totalQuestions: 0,
      completedQuestions: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      totalResponses: 0,
      targetResponses: 100,
    },
    requestsData: data.permissionRequests?.map((request: any) => ({
      id: request.id,
      user: request.user,
      userAvatar: request.userAvatar,
      requestType: request.requestType,
      description: request.description,
      status: request.status,
      requestedAt: request.requestedAt,
      metadata: request.metadata,
    })) || [],
  };
};

/**
 * Transform user data for dashboard display
 */
export const transformUserData = (tenant: string): UserMenu => ({
  name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} User`,
  email: `user@${tenant}.com`,
  role: 'Admin',
  tenant: {
    name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} Company`,
    subdomain: tenant,
  },
});

/**
 * Handle dashboard action events
 */
export const handleDashboardAction = (action: string, data?: any) => {
  console.log('Dashboard action:', action, data);
  // Handle dashboard-specific actions
  switch (action) {
    case 'retention_click':
      console.log('User retention data point clicked:', data);
      break;
    case 'engagement_click':
      console.log('Engagement segment clicked:', data);
      break;
    case 'trend_click':
      console.log('Trend data point clicked:', data);
      break;
    case 'activity_click':
      console.log('Activity item clicked:', data);
      break;
    case 'survey_click':
      console.log('Survey clicked:', data);
      break;
    case 'request_click':
      console.log('Permission request clicked:', data);
      break;
    default:
      console.log('Unknown dashboard action:', action, data);
  }
};

/**
 * Handle user action events
 */
export const handleUserAction = (action: 'profile' | 'settings' | 'logout', router: any) => {
  switch (action) {
    case 'profile':
      router.push('/profile');
      break;
    case 'settings':
      router.push('/settings');
      break;
    case 'logout':
      router.push('/login');
      break;
  }
};
