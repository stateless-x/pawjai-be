import type { Config } from 'drizzle-kit';
import { config  as loadEnv } from 'dotenv';

if (process.env.NODE_ENV !== "production") {
  loadEnv({ path: ".env.local" });
} else {
  loadEnv();
}
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