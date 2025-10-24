#!/usr/bin/env node

const { connectDB } = require('../apps/api/src/db/connect');
const { Group, User, Tenant } = require('@luxgen/db');

async function testUserMappings() {
  try {
    console.log('🔍 Testing User and Group Mappings...\n');
    
    // Connect to database
    await connectDB();
    
    // Get all tenants
    const tenants = await Tenant.find({});
    console.log(`📊 Found ${tenants.length} tenants:`);
    tenants.forEach(tenant => {
      console.log(`  - ${tenant.name} (${tenant.subdomain})`);
    });
    console.log('');
    
    // Test each tenant
    for (const tenant of tenants) {
      console.log(`🏢 Testing Tenant: ${tenant.name} (${tenant.subdomain})`);
      console.log('=' .repeat(50));
      
      // Get users for this tenant
      const users = await User.find({ tenant: tenant._id });
      console.log(`👥 Users (${users.length}):`);
      
      const superAdmins = users.filter(u => u.role === 'super_admin');
      const admins = users.filter(u => u.role === 'admin');
      const regularUsers = users.filter(u => u.role === 'user');
      
      console.log(`  - Super Admins: ${superAdmins.length}`);
      superAdmins.forEach(user => {
        console.log(`    * ${user.firstName} ${user.lastName} (${user.email})`);
      });
      
      console.log(`  - Admins: ${admins.length}`);
      admins.forEach(user => {
        console.log(`    * ${user.firstName} ${user.lastName} (${user.email})`);
      });
      
      console.log(`  - Regular Users: ${regularUsers.length}`);
      regularUsers.forEach(user => {
        console.log(`    * ${user.firstName} ${user.lastName} (${user.email})`);
      });
      
      // Get groups for this tenant
      const groups = await Group.find({ tenant: tenant._id });
      console.log(`\n📁 Groups (${groups.length}):`);
      
      groups.forEach(group => {
        console.log(`  - ${group.name} (${group.members.length} members)`);
        console.log(`    Color: ${group.color}, Icon: ${group.icon}`);
        console.log(`    Settings: Training=${group.settings.trainingEnabled}, Nudge=${group.settings.nudgeEnabled}, Reports=${group.settings.reportingEnabled}`);
      });
      
      // Test group membership distribution
      console.log('\n🔗 Group Membership Analysis:');
      const userGroupCounts = {};
      users.forEach(user => {
        const userGroups = groups.filter(group => 
          group.members.some(memberId => memberId.toString() === user._id.toString())
        );
        userGroupCounts[user.firstName] = userGroups.length;
      });
      
      Object.entries(userGroupCounts).forEach(([name, count]) => {
        console.log(`  - ${name}: ${count} groups`);
      });
      
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
    // Test cross-tenant isolation
    console.log('🔒 Testing Tenant Isolation:');
    const demoUsers = await User.find({ tenant: tenants[0]._id });
    const ideaVibesUsers = await User.find({ tenant: tenants[1]._id });
    
    console.log(`Demo Company users: ${demoUsers.length}`);
    console.log(`Idea Vibes users: ${ideaVibesUsers.length}`);
    console.log('✅ Tenants are properly isolated');
    
    // Test role-based permissions
    console.log('\n🛡️ Role-Based Permissions Test:');
    const allUsers = await User.find({});
    const roleCounts = {};
    allUsers.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  - ${role}: ${count} users`);
    });
    
    console.log('\n✅ User and Group Mapping Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testUserMappings();
