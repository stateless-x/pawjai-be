import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { seedBreeds } from '../seed/breeds';

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function updateBreeds() {
  console.log('🚀 Updating breeds on server...');
  
  try {
    // Create the postgres client
    const client = postgres(connectionString!, { max: 1 });
    
    // Create the drizzle database instance
    const db = drizzle(client);
    
    // Update breeds by clearing existing and seeding new ones
    console.log('🔄 Clearing existing breeds and seeding new ones...');
    await seedBreeds({ clearExisting: true });
    
    console.log('✅ Breeds updated successfully!');
    
    // Close the connection
    await client.end();
    
  } catch (error) {
    console.error('❌ Failed to update breeds:', error);
    process.exit(1);
  }
}

updateBreeds(); 