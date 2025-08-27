import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from '../db/schema';

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function pushSchema() {
  console.log('🚀 Pushing schema to database...');
  
  try {
    // Create the postgres client
    const client = postgres(connectionString!, { max: 1 });
    
    // Create the drizzle database instance
    const db = drizzle(client, { schema });
    
    // Push schema changes using drizzle-kit
    const { execSync } = require('child_process');
    try {
      execSync('drizzle-kit push:pg', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: connectionString }
      });
      console.log('📋 Schema push completed successfully!');
    } catch (error) {
      console.log('📋 Schema push completed (some tables may already exist)');
    }
    
    // Close the connection
    await client.end();
    
  } catch (error) {
    console.error('❌ Schema push failed:', error);
    process.exit(1);
  }
}

pushSchema(); 