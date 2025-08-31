import { migrationService } from '../services/migrationService';

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
      
      // Check if we should continue despite the error
      if (result.details?.shouldContinue !== false) {
        console.log('\x1b[33m⚠️  Migration failed but continuing deployment...\x1b[0m');
        console.log('💡 The server will retry migrations on next startup');
        process.exit(0);
      } else {
        console.log('\x1b[31m💥 Critical migration error, stopping deployment\x1b[0m');
        process.exit(1);
      }
    }
    
  } catch (error) {
    console.error('\x1b[31m💥 Fatal error during migration process:\x1b[0m', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
    }
    
    // In production, we want to continue deployment even if migration fails
    // The server will handle retrying migrations on startup
    console.log('\x1b[33m⚠️  Continuing deployment despite migration error...\x1b[0m');
    console.log('💡 The server will retry migrations on next startup');
    process.exit(0);
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