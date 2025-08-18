import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from './schema';

// Load environment variables from .env and .env.local
config({ path: '.env.local' });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the postgres client
const client = postgres(connectionString);

// Create the drizzle database instance
export const db = drizzle(client, { schema });

export default db; 