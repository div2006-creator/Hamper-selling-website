require('dotenv').config();
const { initDb, getAdminStats } = require('./db');

async function seed() {
  console.log('🌱 Starting Supriszo & Co. PostgreSQL Data Seeder...');
  await initDb();
  const stats = await getAdminStats();
  console.log('📊 Current Database Stats:', stats);
  console.log('✅ Seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
