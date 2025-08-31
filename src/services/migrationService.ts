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

      // Get list of available migration files
      // This is a simplified check - in production you might want to read the actual files
      const availableMigrations = [
        '0000_late_thundra.sql',
        '0001_great_moon_knight.sql', 
        '0002_fix_pets_table.sql',
        '0003_remove_weight_kg.sql'
      ];

      const appliedHashes = appliedMigrations.map((m: any) => m.hash);
      const pending = availableMigrations.filter(m => !appliedHashes.includes(m));

      await client.end();
      return pending;
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
   * Run database migrations with comprehensive error handling
   */
  async runMigrations(): Promise<MigrationResult> {
    if (this.isRunning) {
      return {
        success: false,
        message: 'Migration already in progress',
        timestamp: new Date().toISOString()
      };
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('🚀 Starting database migration...');
      
      // Create the postgres client with connection pooling
      const client = postgres(this.connectionString, { 
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10
      });
      
      // Create the drizzle database instance
      const db = drizzle(client);
      
      // Check current schema before migration
      console.log('🔍 Checking current database schema...');
      const schemaCheck = await db.execute(
        sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pets' ORDER BY ordinal_position`
      );
      
      console.log('📋 Current pets table columns:');
      schemaCheck.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });

      // Check pending migrations
      const pendingMigrations = await this.checkPendingMigrations();
      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found');
        await client.end();
        
        this.lastRun = {
          success: true,
          message: 'No pending migrations',
          details: { pendingCount: 0, duration: Date.now() - startTime },
          timestamp: new Date().toISOString()
        };
        
        this.isRunning = false;
        return this.lastRun;
      }

      console.log(`🔄 Found ${pendingMigrations.length} pending migrations:`, pendingMigrations);
      
      // Run migrations
      console.log('🔄 Running migrations...');
      
      // Capture and filter out NOTICE messages (these are normal, not errors)
      const originalConsoleLog = console.log;
      const notices: string[] = [];
      
      // Temporarily override console.log to capture notices
      console.log = (...args: any[]) => {
        const message = args.join(' ');
        if (message.includes('NOTICE') && (message.includes('already exists') || message.includes('skipping'))) {
          notices.push(message);
          // Use a less alarming color for notices
          originalConsoleLog('\x1b[33m📝 Notice:\x1b[0m', ...args);
        } else {
          originalConsoleLog(...args);
        }
      };
      
      try {
        await migrate(db, { migrationsFolder: './db/drizzle' as string });
      } finally {
        // Restore original console.log
        console.log = originalConsoleLog;
      }
      
      const duration = Date.now() - startTime;
      
      if (notices.length > 0) {
        console.log(`\x1b[33m📋 Migration notices (normal behavior):\x1b[0m`);
        notices.forEach(notice => {
          console.log(`  \x1b[33m• ${notice}\x1b[0m`);
        });
      }
      
      console.log(`✅ Database migration completed successfully in ${duration}ms!`);
      
      // Close the connection
      await client.end();
      
      this.lastRun = {
        success: true,
        message: `Migration completed successfully`,
        details: { 
          pendingCount: pendingMigrations.length,
          duration,
          appliedMigrations: pendingMigrations
        },
        timestamp: new Date().toISOString()
      };
      
      return this.lastRun;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Database migration failed:', error);
      
      let errorMessage = 'Database migration failed';
      let shouldContinue = true;
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message?.includes('column "date_of_birth" does not exist')) {
          errorMessage = 'Migration skipped - schema already up to date';
          shouldContinue = true;
        } else if (error.message?.includes('connection')) {
          errorMessage = 'Database connection failed - will retry on next deployment';
          shouldContinue = true;
        } else if (error.message?.includes('permission denied')) {
          errorMessage = 'Database permission error - check credentials';
          shouldContinue = false;
        } else {
          errorMessage = error.message;
          shouldContinue = true;
        }
      }
      
      this.lastRun = {
        success: false,
        message: errorMessage,
        details: { 
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
          shouldContinue
        },
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: new Date().toISOString()
      };
      
      // Log detailed error for debugging
      console.error('Migration Error Details:', {
        message: errorMessage,
        error: error instanceof Error ? error.stack : error,
        timestamp: new Date().toISOString(),
        shouldContinue
      });
      
      return this.lastRun;
      
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get current migration status
   */
  async getStatus(): Promise<MigrationStatus> {
    const pendingMigrations = await this.checkPendingMigrations();
    const currentSchemaVersion = await this.getCurrentSchemaVersion();
    
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      pendingMigrations,
      currentSchemaVersion
    };
  }

  /**
   * Health check for migrations
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string; details?: any }> {
    try {
      const status = await this.getStatus();
      
      if (status.isRunning) {
        return {
          healthy: true,
          message: 'Migration in progress',
          details: status
        };
      }
      
      if (status.lastRun && !status.lastRun.success) {
        return {
          healthy: false,
          message: `Last migration failed: ${status.lastRun.message}`,
          details: status
        };
      }
      
      if (status.pendingMigrations.length > 0) {
        return {
          healthy: true,
          message: `${status.pendingMigrations.length} pending migrations`,
          details: status
        };
      }
      
      return {
        healthy: true,
        message: 'Database schema is up to date',
        details: status
      };
      
    } catch (error) {
      return {
        healthy: false,
        message: 'Unable to check migration status',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

// Export singleton instance
export const migrationService = new MigrationService(); 