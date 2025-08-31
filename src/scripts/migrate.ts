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
        console.log('❌ Migration still running after timeout, exiting');
        process.exit(1);
      }
    }

    // Run migrations
    const result = await migrationService.runMigrations();
    
    if (result.success) {
      console.log('✅ Migration completed successfully!');
      console.log('📋 Details:', result.details);
      process.exit(0);
    } else {
      console.log('❌ Migration failed:', result.message);
      
      // Check if we should continue despite the error
      if (result.details?.shouldContinue !== false) {
        console.log('⚠️  Migration failed but continuing deployment...');
        console.log('💡 The server will retry migrations on next startup');
        process.exit(0);
      } else {
        console.log('💥 Critical migration error, stopping deployment');
        process.exit(1);
      }
    }
    
  } catch (error) {
    console.error('💥 Fatal error during migration process:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
    }
    
    // In production, we want to continue deployment even if migration fails
    // The server will handle retrying migrations on startup
    console.log('⚠️  Continuing deployment despite migration error...');
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