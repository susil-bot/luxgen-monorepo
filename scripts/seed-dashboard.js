#!/usr/bin/env node

const { seedDashboardData } = require('../apps/api/src/db/dashboardSeed');

async function main() {
  try {
    console.log('🌱 Starting dashboard data seeding...');
    await seedDashboardData();
    console.log('✅ Dashboard data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Dashboard data seeding failed:', error);
    process.exit(1);
  }
}

main();
