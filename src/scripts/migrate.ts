import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function runMigrations() {
  console.log('🚀 Starting database migration...');
  
  try {
    // Create the postgres client
    const client = postgres(connectionString!, { max: 1 });
    
    // Create the drizzle database instance
    const db = drizzle(client);
    
    // Check current schema before migration
    console.log('🔍 Checking current database schema...');
    const result = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pets' ORDER BY ordinal_position`);
    
    console.log('📋 Current pets table columns:');
    result.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Run migrations
    console.log('🔄 Running migrations...');
    await migrate(db, { migrationsFolder: './db/drizzle' as string });
    
    console.log('✅ Database migration completed successfully!');
    
    // Close the connection
    await client.end();
    
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    
    // Provide helpful error messages
    if (error instanceof Error && error.message?.includes('column "date_of_birth" does not exist')) {
      console.log('\n💡 This error occurs because the migration is trying to rename a column that doesn\'t exist.');
      console.log('   Your database already has the correct column names.');
      console.log('   You can safely ignore this migration or manually apply the weight_kg removal.');
    }
    
    process.exit(1);
  }
}

runMigrations(); 