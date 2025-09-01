import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';

// Load environment variables
config();

export interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
  error?: Error;
  timestamp: string;
}

export interface MigrationStatus {
  isRunning: boolean;
  lastRun: MigrationResult | null;
  pendingMigrations: string[];
  currentSchemaVersion: string;
}

class MigrationService {
  private isRunning = false;
  private lastRun: MigrationResult | null = null;
  private connectionString: string;

  constructor() {
    this.connectionString = process.env.DATABASE_URL || '';
    if (!this.connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
  }

  /**
   * Check if there are pending migrations without running them
   */
  async checkPendingMigrations(): Promise<string[]> {
    try {
      const client = postgres(this.connectionString, { max: 1 });
      const db = drizzle(client);

      // Check if migrations table exists
      const migrationsTableExists = await db.execute(
        sql`SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '__drizzle_migrations'
        )`
      );

      if (!migrationsTableExists[0]?.exists) {
        await client.end();
        return ['Initial setup required'];
      }

      // Get list of applied migrations
      const appliedMigrations = await db.execute(
        sql`SELECT hash FROM __drizzle_migrations ORDER BY created_at`
      );

      // For Railway deployment, we'll run all migrations automatically
      // This ensures the database schema is always up to date
      await client.end();
      return ['Schema sync required'];
    } catch (error) {
      console.error('Error checking pending migrations:', error);
      return [];
    }
  }

  /**
   * Get current schema version
   */
  async getCurrentSchemaVersion(): Promise<string> {
    try {
      const client = postgres(this.connectionString, { max: 1 });
      const db = drizzle(client);

      const result = await db.execute(
        sql`SELECT hash FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1`
      );

      await client.end();
      return (result[0] as any)?.hash || 'no-migrations-applied';
    } catch (error) {
      console.error('Error getting current schema version:', error);
      return 'unknown';
    }
  }

  /**
   * Get current migration status
   */
  async getStatus(): Promise<MigrationStatus> {
    try {
      const pendingMigrations = await this.checkPendingMigrations();
      const currentSchemaVersion = await this.getCurrentSchemaVersion();

      return {
        isRunning: this.isRunning,
        lastRun: this.lastRun,
        pendingMigrations,
        currentSchemaVersion,
      };
    } catch (error) {
      console.error('Error getting migration status:', error);
      return {
        isRunning: false,
        lastRun: null,
        pendingMigrations: [],
        currentSchemaVersion: 'error',
      };
    }
  }

  /**
   * Run all pending migrations using Drizzle
   */
  async runMigrations(): Promise<MigrationResult> {
    if (this.isRunning) {
      return {
        success: false,
        message: 'Migration already in progress',
        timestamp: new Date().toISOString(),
      };
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('🚀 Starting Drizzle database migration...');
      
      const client = postgres(this.connectionString, { 
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10
      });
      
      const db = drizzle(client);

      // Check if migrations table exists
      console.log('🔍 Checking migration status...');
      const migrationsTableExists = await db.execute(
        sql`SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '__drizzle_migrations'
        )`
      );

      if (!migrationsTableExists[0]?.exists) {
        console.log('📋 No migrations table found, running initial setup...');
      }

      // Run Drizzle migrations
      console.log('🔄 Running Drizzle migrations...');
      await migrate(db, { migrationsFolder: './db/drizzle' });
      
      const duration = Date.now() - startTime;
      console.log(`✅ Database migration completed successfully in ${duration}ms!`);

      await client.end();

      const result: MigrationResult = {
        success: true,
        message: 'Database migration completed successfully',
        details: {
          duration,
          appliedMigrations: ['Drizzle migrations applied'],
        },
        timestamp: new Date().toISOString(),
      };

      this.lastRun = result;
      this.isRunning = false;
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Database migration failed:', error);
      
      const result: MigrationResult = {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: new Date().toISOString(),
      };

      this.lastRun = result;
      this.isRunning = false;
      return result;
    }
  }


}

export const migrationService = new MigrationService();

async function runMigrations() {
  console.log('🚀 Starting database migration process...');
  
  try {
    // Check current status first
    const status = await migrationService.getStatus();
    console.log('📊 Current migration status:', {
      isRunning: status.isRunning,
      pendingMigrations: status.pendingMigrations.length,
      currentSchemaVersion: status.currentSchemaVersion,
      lastRun: status.lastRun ? {
        success: status.lastRun.success,
        message: status.lastRun.message,
        timestamp: status.lastRun.timestamp
      } : null
    });

    if (status.isRunning) {
      console.log('⚠️  Migration already in progress, waiting...');
      // Wait a bit and check again
      await new Promise(resolve => setTimeout(resolve, 5000));
      const newStatus = await migrationService.getStatus();
      if (newStatus.isRunning) {
        console.log('\x1b[31m❌ Migration still running after timeout, exiting\x1b[0m');
        process.exit(1);
      }
    }

    // Run migrations
    const result = await migrationService.runMigrations();
    
    if (result.success) {
      console.log('\x1b[32m✅ Migration completed successfully!\x1b[0m');
      console.log('📋 Details:', result.details);
      process.exit(0);
    } else {
      console.log('\x1b[31m❌ Migration failed:\x1b[0m', result.message);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\x1b[31m💥 Fatal error during migration process:\x1b[0m', error);
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Migration process interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Migration process terminated');
  process.exit(0);
});

// Run migrations
runMigrations(); 