import { User, Group, Tenant } from '@luxgen/db';
import { logger } from '../../utils/logger';

export const dashboardResolvers = {
  Query: {
    getDashboardData: async (_: any, { tenant }: { tenant?: string }, context: any) => {
      try {
        const tenantId = tenant || context.tenant;
        logger.info(`Getting dashboard data for tenant: ${tenantId}`);

        // Get basic stats
        const stats = await getDashboardStats(tenantId);
        
        // Get chart data
        const userRetention = await getUserRetentionData(tenantId, '30d');
        const engagementBreakdown = await getEngagementBreakdown(tenantId);
        const engagementTrends = await getEngagementTrends(tenantId, 30);
        
        // Get activity data
        const recentActivities = await getRecentActivities(tenantId, 10);
        const lastSurvey = await getLastSurvey(tenantId);
        const permissionRequests = await getPermissionRequests(tenantId, 'pending', 5);

        return {
          stats,
          userRetention,
          engagementBreakdown,
          engagementTrends,
          recentActivities,
          lastSurvey,
          permissionRequests,
        };
      } catch (error) {
        logger.error('Error getting dashboard data:', error);
        throw new Error('Failed to fetch dashboard data');
      }
    },

    getDashboardStats: async (_: any, { tenant }: { tenant?: string }, context: any) => {
      return getDashboardStats(tenant || context.tenant);
    },

    getUserRetentionData: async (_: any, { tenant, period }: { tenant?: string; period?: string }, context: any) => {
      return getUserRetentionData(tenant || context.tenant, period || '30d');
    },

    getEngagementBreakdown: async (_: any, { tenant }: { tenant?: string }, context: any) => {
      return getEngagementBreakdown(tenant || context.tenant);
    },

    getEngagementTrends: async (_: any, { tenant, days }: { tenant?: string; days?: number }, context: any) => {
      return getEngagementTrends(tenant || context.tenant, days || 30);
    },

    getRecentActivities: async (_: any, { tenant, limit }: { tenant?: string; limit?: number }, context: any) => {
      return getRecentActivities(tenant || context.tenant, limit || 10);
    },

    getLastSurvey: async (_: any, { tenant }: { tenant?: string }, context: any) => {
      return getLastSurvey(tenant || context.tenant);
    },

    getPermissionRequests: async (_: any, { tenant, status, limit }: { tenant?: string; status?: string; limit?: number }, context: any) => {
      return getPermissionRequests(tenant || context.tenant, status || 'all', limit || 10);
    },
  },
};

// Helper functions
async function getDashboardStats(tenantId: string) {
  try {
    // Get tenant
    const tenant = await Tenant.findOne({ subdomain: tenantId });
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Get user counts
    const totalUsers = await User.countDocuments({ tenant: tenant._id });
    const activeUsers = await User.countDocuments({ 
      tenant: tenant._id, 
      isActive: true 
    });

    // Get group counts
    const totalGroups = await Group.countDocuments({ tenant: tenant._id });

    // Mock course data (since we don't have courses yet)
    const totalCourses = 12;
    const completionRate = 87.5;

    return {
      totalCourses,
      activeStudents: activeUsers,
      completionRate,
      totalGroups,
      pendingRequests: 3,
      recentActivities: 8,
    };
  } catch (error) {
    logger.error('Error getting dashboard stats:', error);
    return {
      totalCourses: 0,
      activeStudents: 0,
      completionRate: 0,
      totalGroups: 0,
      pendingRequests: 0,
      recentActivities: 0,
    };
  }
}

async function getUserRetentionData(tenantId: string, period: string) {
  // Mock data for user retention
  const periods = period === '30d' ? 30 : 7;
  const data = [];
  
  for (let i = periods - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      period: date.toISOString().split('T')[0],
      retention: Math.random() * 40 + 50, // 50-90% retention
      users: Math.floor(Math.random() * 50) + 20, // 20-70 users
    });
  }
  
  return data;
}

async function getEngagementBreakdown(tenantId: string) {
  return [
    { category: 'Active Learning', value: 45.2, color: '#3B82F6' },
    { category: 'Course Completion', value: 32.8, color: '#10B981' },
    { category: 'Group Participation', value: 15.6, color: '#F59E0B' },
    { category: 'Assessment Scores', value: 6.4, color: '#EF4444' },
  ];
}

async function getEngagementTrends(tenantId: string, days: number) {
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      activeUsers: Math.floor(Math.random() * 30) + 20,
      completedCourses: Math.floor(Math.random() * 15) + 5,
      newUsers: Math.floor(Math.random() * 8) + 2,
    });
  }
  
  return data;
}

async function getRecentActivities(tenantId: string, limit: number) {
  const activities = [
    {
      id: '1',
      type: 'course_completion',
      title: 'Course Completed',
      description: 'Sarah Johnson completed "Advanced React Patterns"',
      user: 'Sarah Johnson',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'completed',
      metadata: { courseId: 'react-advanced', score: 95 },
    },
    {
      id: '2',
      type: 'group_join',
      title: 'Joined Group',
      description: 'Michael Chen joined "Development Team"',
      user: 'Michael Chen',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: 'active',
      metadata: { groupId: 'dev-team' },
    },
    {
      id: '3',
      type: 'survey_response',
      title: 'Survey Response',
      description: 'Emma Williams responded to "Q1 2024 Feedback Survey"',
      user: 'Emma Williams',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      status: 'completed',
      metadata: { surveyId: 'q1-2024-feedback' },
    },
    {
      id: '4',
      type: 'permission_request',
      title: 'Permission Request',
      description: 'James Brown requested admin access',
      user: 'James Brown',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      status: 'pending',
      metadata: { requestType: 'admin_access' },
    },
    {
      id: '5',
      type: 'course_start',
      title: 'Course Started',
      description: 'Alex Thompson started "TypeScript Fundamentals"',
      user: 'Alex Thompson',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      status: 'in_progress',
      metadata: { courseId: 'typescript-fundamentals' },
    },
  ];

  return activities.slice(0, limit);
}

async function getLastSurvey(tenantId: string) {
  return {
    id: 'survey-1',
    title: 'Q1 2024 Employee Satisfaction Survey',
    description: 'Quarterly survey to measure employee satisfaction and engagement',
    status: 'active',
    progress: 75.0,
    totalQuestions: 20,
    completedQuestions: 15,
    createdAt: '2024-01-15T00:00:00Z',
    expiresAt: '2024-02-15T23:59:59Z',
    responses: 156,
  };
}

async function getPermissionRequests(tenantId: string, status: string, limit: number) {
  const requests = [
    {
      id: 'req-1',
      user: 'James Brown',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      requestType: 'admin_access',
      description: 'Request for admin privileges to manage user accounts',
      status: 'pending',
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      metadata: { reason: 'Need to manage team members' },
    },
    {
      id: 'req-2',
      user: 'Sarah Johnson',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      requestType: 'group_management',
      description: 'Request to create and manage new groups',
      status: 'pending',
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      metadata: { reason: 'Organizing new project teams' },
    },
    {
      id: 'req-3',
      user: 'Michael Chen',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      requestType: 'reporting_access',
      description: 'Request for access to advanced reporting features',
      status: 'approved',
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      metadata: { reason: 'Need to generate team performance reports' },
    },
  ];

  if (status === 'all') {
    return requests.slice(0, limit);
  }

  return requests.filter(req => req.status === status).slice(0, limit);
}
