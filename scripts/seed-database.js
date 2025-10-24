#!/usr/bin/env node

const path = require('path');
const { execSync } = require('child_process');

async function main() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Run the seeding from the API directory
    const apiDir = path.join(__dirname, '../apps/api');
    process.chdir(apiDir);
    
    // Use ts-node to run the TypeScript file
    execSync('npx ts-node src/db/seed.ts', { stdio: 'inherit' });
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

main();
