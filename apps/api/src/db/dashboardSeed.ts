import { logger } from '../utils/logger';
import { connectDB } from './connect';
import { User, Group, Tenant } from '@luxgen/db';

export interface DashboardSeedData {
  activities: any[];
  surveys: any[];
  permissionRequests: any[];
  userRetention: any[];
  engagementData: any[];
}

export const seedDashboardData = async (): Promise<DashboardSeedData> => {
  try {
    console.log('🌱 Starting dashboard data seeding...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');
    
    // Get all tenants
    const tenants = await Tenant.find({});
    if (tenants.length === 0) {
      throw new Error('No tenants found. Please run main seed first.');
    }
    
    const seedData: DashboardSeedData = {
      activities: [],
      surveys: [],
      permissionRequests: [],
      userRetention: [],
      engagementData: [],
    };
    
    // Create dashboard data for each tenant
    for (const tenant of tenants) {
      console.log(`📊 Creating dashboard data for tenant: ${tenant.name}`);
      
      // Create activities
      const activities = await createDashboardActivities(tenant);
      seedData.activities.push(...activities);
      
      // Create surveys
      const surveys = await createDashboardSurveys(tenant);
      seedData.surveys.push(...surveys);
      
      // Create permission requests
      const requests = await createDashboardPermissionRequests(tenant);
      seedData.permissionRequests.push(...requests);
      
      // Create user retention data
      const retention = await createUserRetentionData(tenant);
      seedData.userRetention.push(...retention);
      
      // Create engagement data
      const engagement = await createEngagementData(tenant);
      seedData.engagementData.push(...engagement);
    }
    
    console.log('🎉 Dashboard data seeding completed successfully!');
    console.log(`📊 Summary: ${seedData.activities.length} activities, ${seedData.surveys.length} surveys, ${seedData.permissionRequests.length} requests`);
    
    return seedData;
  } catch (error) {
    console.error('❌ Dashboard data seeding error:', error);
    throw error;
  }
};

const createDashboardActivities = async (tenant: any) => {
  const activities = [];
  const tenantUsers = await User.find({ tenant: tenant._id });
  
  const activityTypes = [
    'course_completion',
    'course_start',
    'group_join',
    'group_leave',
    'survey_response',
    'assessment_completion',
    'profile_update',
    'permission_request',
  ];
  
  const statuses = ['completed', 'in_progress', 'pending', 'failed'];
  
  // Create 20-30 activities per tenant
  const activityCount = Math.floor(Math.random() * 11) + 20;
  
  for (let i = 0; i < activityCount; i++) {
    const user = tenantUsers[Math.floor(Math.random() * tenantUsers.length)];
    const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const activity = {
      id: `activity-${tenant._id}-${i}`,
      type: activityType,
      title: generateActivityTitle(activityType),
      description: generateActivityDescription(activityType, user),
      user: `${user.firstName} ${user.lastName}`,
      userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status,
      metadata: {
        tenantId: tenant._id,
        userId: user._id,
        activityId: `activity-${tenant._id}-${i}`,
      },
    };
    
    activities.push(activity);
  }
  
  return activities;
};

const createDashboardSurveys = async (tenant: any) => {
  const surveys = [];
  
  const surveyTemplates = [
    {
      title: 'Q1 2024 Employee Satisfaction Survey',
      description: 'Quarterly survey to measure employee satisfaction and engagement',
      status: 'active',
      progress: 75.0,
      totalQuestions: 20,
      completedQuestions: 15,
      responses: 156,
    },
    {
      title: 'Training Effectiveness Assessment',
      description: 'Survey to evaluate the effectiveness of training programs',
      status: 'completed',
      progress: 100.0,
      totalQuestions: 15,
      completedQuestions: 15,
      responses: 89,
    },
    {
      title: 'Workplace Culture Survey',
      description: 'Assessment of workplace culture and team dynamics',
      status: 'draft',
      progress: 25.0,
      totalQuestions: 25,
      completedQuestions: 6,
      responses: 0,
    },
  ];
  
  for (let i = 0; i < surveyTemplates.length; i++) {
    const template = surveyTemplates[i];
    const survey = {
      id: `survey-${tenant._id}-${i}`,
      title: template.title,
      description: template.description,
      status: template.status,
      progress: template.progress,
      totalQuestions: template.totalQuestions,
      completedQuestions: template.completedQuestions,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: template.status === 'active' ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      responses: template.responses,
      metadata: {
        tenantId: tenant._id,
        surveyId: `survey-${tenant._id}-${i}`,
      },
    };
    
    surveys.push(survey);
  }
  
  return surveys;
};

const createDashboardPermissionRequests = async (tenant: any) => {
  const requests = [];
  const tenantUsers = await User.find({ tenant: tenant._id });
  
  const requestTypes = [
    'admin_access',
    'group_management',
    'reporting_access',
    'user_management',
    'course_creation',
    'survey_management',
  ];
  
  const statuses = ['pending', 'approved', 'denied'];
  
  // Create 5-10 permission requests per tenant
  const requestCount = Math.floor(Math.random() * 6) + 5;
  
  for (let i = 0; i < requestCount; i++) {
    const user = tenantUsers[Math.floor(Math.random() * tenantUsers.length)];
    const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const request = {
      id: `request-${tenant._id}-${i}`,
      user: `${user.firstName} ${user.lastName}`,
      userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`,
      requestType,
      description: generatePermissionRequestDescription(requestType),
      status,
      requestedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        tenantId: tenant._id,
        userId: user._id,
        reason: generatePermissionRequestReason(requestType),
      },
    };
    
    requests.push(request);
  }
  
  return requests;
};

const createUserRetentionData = async (tenant: any) => {
  const retentionData = [];
  
  // Generate 30 days of retention data
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    retentionData.push({
      period: date.toISOString().split('T')[0],
      retention: Math.random() * 40 + 50, // 50-90% retention
      users: Math.floor(Math.random() * 50) + 20, // 20-70 users
      tenantId: tenant._id,
    });
  }
  
  return retentionData;
};

const createEngagementData = async (tenant: any) => {
  const engagementData = [];
  
  // Generate 30 days of engagement data
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    engagementData.push({
      date: date.toISOString().split('T')[0],
      activeUsers: Math.floor(Math.random() * 30) + 20,
      completedCourses: Math.floor(Math.random() * 15) + 5,
      newUsers: Math.floor(Math.random() * 8) + 2,
      tenantId: tenant._id,
    });
  }
  
  return engagementData;
};

// Helper functions
const generateActivityTitle = (type: string): string => {
  const titles = {
    course_completion: 'Course Completed',
    course_start: 'Course Started',
    group_join: 'Joined Group',
    group_leave: 'Left Group',
    survey_response: 'Survey Response',
    assessment_completion: 'Assessment Completed',
    profile_update: 'Profile Updated',
    permission_request: 'Permission Request',
  };
  
  return titles[type as keyof typeof titles] || 'Activity';
};

const generateActivityDescription = (type: string, user: any): string => {
  const descriptions = {
    course_completion: `${user.firstName} ${user.lastName} completed "Advanced React Patterns"`,
    course_start: `${user.firstName} ${user.lastName} started "TypeScript Fundamentals"`,
    group_join: `${user.firstName} ${user.lastName} joined "Development Team"`,
    group_leave: `${user.firstName} ${user.lastName} left "Marketing Team"`,
    survey_response: `${user.firstName} ${user.lastName} responded to "Q1 2024 Feedback Survey"`,
    assessment_completion: `${user.firstName} ${user.lastName} completed "JavaScript Assessment"`,
    profile_update: `${user.firstName} ${user.lastName} updated their profile information`,
    permission_request: `${user.firstName} ${user.lastName} requested admin access`,
  };
  
  return descriptions[type as keyof typeof descriptions] || 'Activity performed';
};

const generatePermissionRequestDescription = (type: string): string => {
  const descriptions = {
    admin_access: 'Request for admin privileges to manage user accounts',
    group_management: 'Request to create and manage new groups',
    reporting_access: 'Request for access to advanced reporting features',
    user_management: 'Request to manage user accounts and permissions',
    course_creation: 'Request to create and manage courses',
    survey_management: 'Request to create and manage surveys',
  };
  
  return descriptions[type as keyof typeof descriptions] || 'Permission request';
};

const generatePermissionRequestReason = (type: string): string => {
  const reasons = {
    admin_access: 'Need to manage team members and system settings',
    group_management: 'Organizing new project teams and departments',
    reporting_access: 'Generate team performance and analytics reports',
    user_management: 'Manage user onboarding and account maintenance',
    course_creation: 'Develop training content for team development',
    survey_management: 'Create feedback surveys for team improvement',
  };
  
  return reasons[type as keyof typeof reasons] || 'Business requirement';
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDashboardData().then(() => {
    console.log('✅ Dashboard seed script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Dashboard seed script failed:', error);
    process.exit(1);
  });
}
