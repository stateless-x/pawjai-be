import { migrationService, MigrationResult } from './migrationService';

export interface StartupResult {
  success: boolean;
  migrations: MigrationResult | null;
  message: string;
  timestamp: string;
}

class StartupService {
  private isInitialized = false;
  private startupResult: StartupResult | null = null;

  /**
   * Initialize the application on startup
   * This runs migrations and other startup tasks
   */
  async initialize(): Promise<StartupResult> {
    if (this.isInitialized) {
      return this.startupResult!;
    }

    console.log('🚀 Initializing application...');
    const startTime = Date.now();

    try {
      // Check if we're in production mode
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        console.log('🏭 Production mode detected, running startup migrations...');
        
        // Run migrations with retry logic
        const migrationResult = await this.runStartupMigrations();
        
        this.startupResult = {
          success: migrationResult.success || migrationResult.details?.shouldContinue !== false,
          migrations: migrationResult,
          message: migrationResult.success 
            ? 'Application initialized successfully with migrations'
            : `Application initialized with migration warnings: ${migrationResult.message}`,
          timestamp: new Date().toISOString()
        };
        
        // Log migration result with appropriate colors
        if (migrationResult.success) {
          console.log('\x1b[32m✅ Migrations completed successfully\x1b[0m');
        } else if (migrationResult.details?.shouldContinue !== false) {
          console.log('\x1b[33m⚠️  Migrations completed with warnings (continuing)\x1b[0m');
        } else {
          console.log('\x1b[31m❌ Migrations failed critically\x1b[0m');
        }
      } else {
        console.log('🛠️  Development mode detected, skipping startup migrations');
        
        this.startupResult = {
          success: true,
          migrations: null,
          message: 'Application initialized successfully (development mode)',
          timestamp: new Date().toISOString()
        };
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Application initialization completed in ${duration}ms`);
      console.log('📊 Startup result:', this.startupResult);
      
      this.isInitialized = true;
      return this.startupResult;
      
    } catch (error) {
      console.error('💥 Application initialization failed:', error);
      
      this.startupResult = {
        success: false,
        migrations: null,
        message: `Application initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
      
      // Log detailed error but don't crash the server
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      
      return this.startupResult;
    }
  }

  /**
   * Run migrations on startup with retry logic
   */
  private async runStartupMigrations(): Promise<MigrationResult> {
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Migration attempt ${attempt}/${maxRetries}...`);
        
        const result = await migrationService.runMigrations();
        
        if (result.success) {
          console.log(`✅ Migration successful on attempt ${attempt}`);
          return result;
        }
        
        // Check if we should retry
        if (result.details?.shouldContinue === false) {
          console.log('💥 Critical migration error, not retrying');
          return result;
        }
        
        if (attempt < maxRetries) {
          console.log(`⚠️  Migration failed, retrying in ${retryDelay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          console.log('⚠️  All migration attempts failed, continuing with warnings');
          return result;
        }
        
      } catch (error) {
        console.error(`❌ Migration attempt ${attempt} failed with error:`, error);
        
        if (attempt < maxRetries) {
          console.log(`⚠️  Retrying in ${retryDelay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          console.log('⚠️  All migration attempts failed, continuing with error');
          return {
            success: false,
            message: `Migration failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { attempts: maxRetries, shouldContinue: true },
            error: error instanceof Error ? error : new Error(String(error)),
            timestamp: new Date().toISOString()
          };
        }
      }
    }
    
    // This should never be reached, but just in case
    return {
      success: false,
      message: 'Migration failed after all attempts',
      details: { attempts: maxRetries, shouldContinue: true },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get current startup status
   */
  getStatus(): { isInitialized: boolean; result: StartupResult | null } {
    return {
      isInitialized: this.isInitialized,
      result: this.startupResult
    };
  }

  /**
   * Health check for startup service
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string; details?: any }> {
    if (!this.isInitialized) {
      return {
        healthy: false,
        message: 'Application not yet initialized',
        details: { status: 'pending' }
      };
    }

    if (!this.startupResult) {
      return {
        healthy: false,
        message: 'Startup result not available',
        details: { status: 'unknown' }
      };
    }

    if (!this.startupResult.success) {
      return {
        healthy: false,
        message: `Startup failed: ${this.startupResult.message}`,
        details: this.startupResult
      };
    }

    // Check migration health if migrations were run
    if (this.startupResult.migrations) {
      const migrationHealth = await migrationService.healthCheck();
      return {
        healthy: migrationHealth.healthy,
        message: `Startup successful. ${migrationHealth.message}`,
        details: {
          startup: this.startupResult,
          migrations: migrationHealth
        }
      };
    }

    return {
      healthy: true,
      message: 'Application initialized successfully',
      details: this.startupResult
    };
  }
}

// Export singleton instance
export const startupService = new StartupService(); 