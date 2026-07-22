import { getTenantDomain } from '@luxgen/config';
import { hashPassword } from '@luxgen/auth';
import { logger } from '../utils/logger';
import { connectDB } from './connect';
import { Group, User, Tenant } from '@luxgen/db';
import type { IUser } from '@luxgen/db';
import { seedDashboardData } from './dashboardSeed';

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Create sample tenants
    console.log('🏢 Creating tenants...');
    const tenants = await createSampleTenants();
    console.log(`✅ Created ${tenants.length} tenants`);

    // Create sample users
    console.log('👥 Creating users...');
    const users = await createSampleUsers(tenants);
    console.log(`✅ Created ${users.length} users`);

    // Create sample groups
    console.log('📁 Creating groups...');
    const groups = await createSampleGroups(tenants, users);
    console.log(`✅ Created ${groups.length} groups`);

    // Create dashboard data
    console.log('📊 Creating dashboard data...');
    const dashboardData = await seedDashboardData();
    console.log(
      `✅ Created dashboard data: ${dashboardData.activities.length} activities, ${dashboardData.surveys.length} surveys, ${dashboardData.permissionRequests.length} requests`,
    );

    console.log('🎉 Database seeding completed successfully!');
    console.log(
      `📊 Summary: ${tenants.length} tenants, ${users.length} users, ${groups.length} groups, dashboard data seeded`,
    );
  } catch (error) {
    console.error('❌ Database seeding error:', error);
    throw error;
  }
};

/** Skip seeding when volume already has users (Docker / repeat dev starts). */
export async function seedDatabaseIfEmpty(): Promise<boolean> {
  await connectDB();
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    logger.info(`Database already seeded (${userCount} users) — skipping auto-seed`);
    return false;
  }
  logger.info('Empty database detected — running first-time seed');
  await seedDatabase();
  return true;
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  const ifEmpty = process.argv.includes('--if-empty');

  const run = async () => {
    if (ifEmpty) {
      await seedDatabaseIfEmpty();
    } else {
      await seedDatabase();
    }
  };

  run()
    .then(() => {
      console.log('✅ Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}

const createSampleTenants = async () => {
  const tenants = [
    {
      name: 'Demo Company',
      subdomain: 'demo',
      domain: getTenantDomain('demo'),
      status: 'active',
      metadata: {
        plan: 'enterprise',
        features: ['groups', 'training', 'reporting'],
        limits: {
          maxUsers: 1000,
          maxGroups: 100,
          maxStorage: '10GB',
        },
      },
    },
    {
      name: 'Idea Vibes',
      subdomain: 'ideavibes',
      domain: getTenantDomain('ideavibes'),
      status: 'active',
      metadata: {
        plan: 'pro',
        features: ['groups', 'training'],
        limits: {
          maxUsers: 500,
          maxGroups: 50,
          maxStorage: '5GB',
        },
      },
    },
    {
      name: 'ACME Corporation',
      subdomain: 'acme-corp',
      domain: getTenantDomain('acme-corp'),
      status: 'active',
      metadata: {
        plan: 'free',
        features: ['groups'],
        limits: {
          maxUsers: 100,
          maxGroups: 10,
          maxStorage: '1GB',
        },
      },
    },
  ];

  const createdTenants = [];
  for (const tenantData of tenants) {
    const existingTenant = await Tenant.findOne({ subdomain: tenantData.subdomain });
    if (!existingTenant) {
      const tenant = new Tenant(tenantData);
      await tenant.save();
      createdTenants.push(tenant);
      logger.info(`Created tenant: ${tenant.name} (${tenant.subdomain})`);
    } else {
      createdTenants.push(existingTenant);
      logger.info(`Tenant already exists: ${existingTenant.name} (${existingTenant.subdomain})`);
    }
  }

  return createdTenants;
};

const createSampleUsers = async (tenants: any[]) => {
  const users = [];

  // Create users for Demo Company (7 users)
  const demoUsers = [
    {
      firstName: 'Alex',
      lastName: 'Thompson',
      email: 'alex.thompson@demo.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[0]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: true },
        permissions: ['all'],
      },
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@demo.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[0]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'dark', notifications: true },
        permissions: ['manage_users', 'manage_groups', 'view_reports'],
      },
    },
    {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@demo.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[0]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: false },
        permissions: ['manage_groups', 'view_reports'],
      },
    },
    {
      firstName: 'Emma',
      lastName: 'Williams',
      email: 'emma.williams@demo.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[0]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: true },
        permissions: ['manage_users', 'view_reports'],
      },
    },
    {
      firstName: 'James',
      lastName: 'Brown',
      email: 'james.brown@demo.com',
      password: 'password123',
      role: 'USER',
      tenant: tenants[0]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'dark', notifications: true },
        permissions: ['view_groups'],
      },
    },
    {
      firstName: 'Lisa',
      lastName: 'Garcia',
      email: 'lisa.garcia@demo.com',
      password: 'password123',
      role: 'USER',
      tenant: tenants[0]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: false },
        permissions: ['view_groups'],
      },
    },
    {
      firstName: 'Robert',
      lastName: 'Martinez',
      email: 'robert.martinez@demo.com',
      password: 'password123',
      role: 'USER',
      tenant: tenants[0]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: true },
        permissions: ['view_groups'],
      },
    },
  ];

  // Create users for Idea Vibes (7 users)
  const ideaVibesUsers = [
    {
      firstName: 'David',
      lastName: 'Anderson',
      email: 'david.anderson@ideavibes.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[1]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'dark', notifications: true },
        permissions: ['all'],
      },
    },
    {
      firstName: 'Jennifer',
      lastName: 'Taylor',
      email: 'jennifer.taylor@ideavibes.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[1]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: true },
        permissions: ['manage_users', 'manage_groups'],
      },
    },
    {
      firstName: 'Christopher',
      lastName: 'Lee',
      email: 'christopher.lee@ideavibes.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[1]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'dark', notifications: false },
        permissions: ['manage_groups', 'view_reports'],
      },
    },
    {
      firstName: 'Amanda',
      lastName: 'White',
      email: 'amanda.white@ideavibes.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[1]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: true },
        permissions: ['manage_users', 'view_reports'],
      },
    },
    {
      firstName: 'Daniel',
      lastName: 'Harris',
      email: 'daniel.harris@ideavibes.com',
      password: 'password123',
      role: 'USER',
      tenant: tenants[1]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'dark', notifications: true },
        permissions: ['view_groups'],
      },
    },
    {
      firstName: 'Michelle',
      lastName: 'Clark',
      email: 'michelle.clark@ideavibes.com',
      password: 'password123',
      role: 'USER',
      tenant: tenants[1]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: false },
        permissions: ['view_groups'],
      },
    },
    {
      firstName: 'Kevin',
      lastName: 'Lewis',
      email: 'kevin.lewis@ideavibes.com',
      password: 'password123',
      role: 'USER',
      tenant: tenants[1]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: true },
        permissions: ['view_groups'],
      },
    },
  ];

  // Create users for ACME Corporation (6 users)
  const acmeUsers = [
    {
      firstName: 'Patricia',
      lastName: 'Robinson',
      email: 'patricia.robinson@acme-corp.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[2]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: true },
        permissions: ['all'],
      },
    },
    {
      firstName: 'Mark',
      lastName: 'Walker',
      email: 'mark.walker@acme-corp.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[2]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'dark', notifications: true },
        permissions: ['manage_users', 'manage_groups'],
      },
    },
    {
      firstName: 'Nancy',
      lastName: 'Hall',
      email: 'nancy.hall@acme-corp.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[2]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: false },
        permissions: ['manage_groups', 'view_reports'],
      },
    },
    {
      firstName: 'Steven',
      lastName: 'Allen',
      email: 'steven.allen@acme-corp.com',
      password: 'password123',
      role: 'ADMIN',
      tenant: tenants[2]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'dark', notifications: true },
        permissions: ['manage_users', 'view_reports'],
      },
    },
    {
      firstName: 'Donna',
      lastName: 'Young',
      email: 'donna.young@acme-corp.com',
      password: 'password123',
      role: 'USER',
      tenant: tenants[2]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'light', notifications: true },
        permissions: ['view_groups'],
      },
    },
    {
      firstName: 'Paul',
      lastName: 'King',
      email: 'paul.king@acme-corp.com',
      password: 'password123',
      role: 'USER',
      tenant: tenants[2]._id,
      isActive: true,
      metadata: {
        lastLogin: new Date(),
        preferences: { theme: 'dark', notifications: false },
        permissions: ['view_groups'],
      },
    },
  ];

  // Combine all users
  const allUsers = [...demoUsers, ...ideaVibesUsers, ...acmeUsers];

  for (const userData of allUsers) {
    const existingUser = await User.findOne({ email: userData.email }).select('+password');
    const hashedPassword = await hashPassword(userData.password);

    if (!existingUser) {
      const user = new User({
        ...userData,
        password: hashedPassword,
        status: 'ACTIVE' as IUser['status'],
      });
      await user.save();
      users.push(user);
      logger.info(
        `Created user: ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role} - Tenant: ${user.tenant}`,
      );
    } else {
      if (!existingUser.password?.startsWith('$2')) {
        existingUser.password = hashedPassword;
        existingUser.status = 'ACTIVE' as IUser['status'];
        await existingUser.save();
        logger.info(`Updated password hash for: ${existingUser.email}`);
      }
      users.push(existingUser);
      logger.info(
        `User already exists: ${existingUser.firstName} ${existingUser.lastName} (${existingUser.email}) - Role: ${existingUser.role}`,
      );
    }
  }

  return users;
};

const createSampleGroups = async (tenants: any[], users: any[]) => {
  const groups = [];

  for (const tenant of tenants) {
    const tenantUsers = users.filter((user) => user.tenant.toString() === tenant._id.toString());
    const admins = tenantUsers.filter((user) => user.role === 'ADMIN');
    const _learners = tenantUsers.filter((user) => user.role === 'USER');
    const students = _learners;

    const tenantGroups = [
      {
        name: 'Development Team',
        description: 'Software development and engineering team',
        color: '#3B82F6',
        icon: 'code',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins.slice(0, 2), ...students.slice(0, 2)].map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: true,
          reportingEnabled: true,
        },
        isActive: true,
      },
      {
        name: 'Marketing Team',
        description: 'Marketing and communications team',
        color: '#10B981',
        icon: 'megaphone',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins.slice(1, 3), ...students.slice(1, 3)].map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: false,
          reportingEnabled: true,
        },
        isActive: true,
      },
      {
        name: 'Sales Team',
        description: 'Sales and business development team',
        color: '#F59E0B',
        icon: 'trending-up',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins, ...students.slice(0, 3)].map((user) => user._id),
        settings: {
          trainingEnabled: false,
          nudgeEnabled: true,
          reportingEnabled: false,
        },
        isActive: true,
      },
      {
        name: 'Support Team',
        description: 'Customer support and help desk team',
        color: '#EF4444',
        icon: 'headphones',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins.slice(0, 1), ...students.slice(0, 2)].map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: true,
          reportingEnabled: true,
        },
        isActive: true,
      },
      {
        name: 'Management Team',
        description: 'Executive and management team',
        color: '#8B5CF6',
        icon: 'users',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins].map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: true,
          reportingEnabled: true,
        },
        isActive: true,
      },
      {
        name: 'Design Team',
        description: 'UI/UX design and creative team',
        color: '#EC4899',
        icon: 'palette',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins.slice(0, 1), ...students.slice(0, 2)].map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: true,
          reportingEnabled: false,
        },
        isActive: true,
      },
      {
        name: 'QA Team',
        description: 'Quality assurance and testing team',
        color: '#06B6D4',
        icon: 'shield-check',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins.slice(0, 2), ...students.slice(1, 3)].map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: false,
          reportingEnabled: true,
        },
        isActive: true,
      },
      {
        name: 'DevOps Team',
        description: 'Infrastructure and deployment team',
        color: '#84CC16',
        icon: 'server',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins, ...students].map((user) => user._id),
        settings: {
          trainingEnabled: false,
          nudgeEnabled: true,
          reportingEnabled: true,
        },
        isActive: true,
      },
      {
        name: 'Product Team',
        description: 'Product management and strategy team',
        color: '#F97316',
        icon: 'lightbulb',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: admins.slice(0, 1).map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: true,
          reportingEnabled: true,
        },
        isActive: true,
      },
      {
        name: 'HR Team',
        description: 'Human resources and talent acquisition',
        color: '#8B5CF6',
        icon: 'user-group',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins].map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: false,
          reportingEnabled: false,
        },
        isActive: true,
      },
      {
        name: 'Finance Team',
        description: 'Financial planning and accounting team',
        color: '#059669',
        icon: 'currency-dollar',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins.slice(0, 2), ...students.slice(0, 1)].map((user) => user._id),
        settings: {
          trainingEnabled: false,
          nudgeEnabled: true,
          reportingEnabled: true,
        },
        isActive: true,
      },
      {
        name: 'Legal Team',
        description: 'Legal compliance and contract management',
        color: '#7C2D12',
        icon: 'scale',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins.slice(1, 3), ...students.slice(1, 2)].map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: true,
          reportingEnabled: false,
        },
        isActive: true,
      },
      {
        name: 'Research Team',
        description: 'Market research and data analysis team',
        color: '#BE185D',
        icon: 'chart-bar',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins, ...students].map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: false,
          reportingEnabled: true,
        },
        isActive: true,
      },
      {
        name: 'Security Team',
        description: 'Cybersecurity and information security team',
        color: '#DC2626',
        icon: 'lock-closed',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins.slice(0, 1), ...students.slice(0, 1)].map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: true,
          reportingEnabled: true,
        },
        isActive: true,
      },
      {
        name: 'Innovation Team',
        description: 'Innovation and emerging technology team',
        color: '#7C3AED',
        icon: 'rocket-launch',
        tenant: tenant._id,
        createdBy: admins[0]?._id || tenantUsers[0]?._id,
        members: [...admins].map((user) => user._id),
        settings: {
          trainingEnabled: true,
          nudgeEnabled: true,
          reportingEnabled: true,
        },
        isActive: true,
      },
    ];

    for (const groupData of tenantGroups) {
      const existingGroup = await Group.findOne({
        name: groupData.name,
        tenant: tenant._id,
      });
      if (!existingGroup) {
        const group = new Group(groupData);
        await group.save();
        groups.push(group);
        logger.info(`Created group: ${group.name} for tenant ${tenant.name}`);
      } else {
        groups.push(existingGroup);
        logger.info(`Group already exists: ${existingGroup.name} for tenant ${tenant.name}`);
      }
    }
  }

  return groups;
};

export const clearDatabase = async (): Promise<void> => {
  try {
    logger.info('Clearing database...');

    // TODO: Implement database clearing
    // - Drop all collections
    // - Or delete all documents

    logger.info('Database cleared');
  } catch (error) {
    logger.error('Database clearing error:', error);
    throw error;
  }
};
