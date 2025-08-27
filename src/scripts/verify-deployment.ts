import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { userProfiles } from '../db/schema';

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function verifyDeployment() {
  console.log('🔍 Verifying database deployment...');
  
  try {
    // Create the postgres client
    const client = postgres(connectionString!, { max: 1 });
    
    // Create the drizzle database instance
    const db = drizzle(client);
    
    // Test a simple query to verify the database is working
    const result = await db.select().from(userProfiles).limit(1);
    
    console.log('✅ Database verification successful!');
    console.log(`📊 Found ${result.length} user profiles`);
    
    // Close the connection
    await client.end();
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

verifyDeployment(); 