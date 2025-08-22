import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.local' });
config();

export default {
  schema: './src/db/schema.ts',
  out: './src/db/drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config; 