#!/usr/bin/env node

const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2).join(' ');

async function main() {
  try {
    console.log('🔄 Backfilling course.commerce from description meta...');
    const apiDir = path.join(__dirname, '../apps/api');
    process.chdir(apiDir);
    execSync(`npx ts-node src/scripts/backfill-course-commerce.ts ${args}`, { stdio: 'inherit' });
    console.log('✅ Course commerce backfill finished.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Course commerce backfill failed:', error);
    process.exit(1);
  }
}

main();
