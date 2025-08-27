import type { Config } from 'drizzle-kit';
import { config  as loadEnv } from 'dotenv';

// Only load .env.local in development
if (process.env.NODE_ENV !== "production") {
  loadEnv({ path: ".env.local" });
}

export default {
  schema: './src/db/schema.ts',
  out: './db/drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: true,
} satisfies Config; 