const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting to populate database with dummy data...\n');

const scripts = [
  'add-dummy-tools.js',
  'add-dummy-reviews.js', 
  'add-dummy-submissions.js',
  'add-dummy-testing-tasks.js'
];

for (const script of scripts) {
  try {
    console.log(`📋 Running ${script}...`);
    const scriptPath = path.join(__dirname, script);
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    console.log(`✅ ${script} completed successfully!\n`);
  } catch (error) {
    console.error(`❌ Error running ${script}:`, error.message);
    process.exit(1);
  }
}

console.log('🎉 All dummy data has been successfully added to the database!');
console.log('\n📊 Final Summary:');
console.log('- Tools: 10 popular SaaS tools');
console.log('- Categories: 6 tool categories');
console.log('- Reviews: 6 detailed reviews');
console.log('- Users: 15 users (admins, testers, vendors)');
console.log('- Tool Submissions: 5 pending submissions');
console.log('- Testing Tasks: 5 tasks in various states');
console.log('\n✨ Your BreakTool database is now populated with realistic data!');
