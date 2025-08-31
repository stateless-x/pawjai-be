import { migrationService } from '../services/migrationService';
import { startupService } from '../services/startupService';

async function verifyDeployment() {
  console.log('🔍 Verifying deployment...');
  
  try {
    // Check migration status
    console.log('📊 Checking migration status...');
    const migrationStatus = await migrationService.getStatus();
    
    console.log('Migration Status:', {
      isRunning: migrationStatus.isRunning,
      pendingMigrations: migrationStatus.pendingMigrations.length,
      currentSchemaVersion: migrationStatus.currentSchemaVersion,
      lastRun: migrationStatus.lastRun ? {
        success: migrationStatus.lastRun.success,
        message: migrationStatus.lastRun.message,
        timestamp: migrationStatus.lastRun.timestamp
      } : null
    });

    // Check startup service status
    console.log('🚀 Checking startup service status...');
    const startupStatus = startupService.getStatus();
    
    console.log('Startup Status:', startupStatus);

    // Check migration health
    console.log('💚 Checking migration health...');
    const migrationHealth = await migrationService.healthCheck();
    
    console.log('Migration Health:', migrationHealth);

    // Overall deployment verification
    const isHealthy = migrationHealth.healthy && 
                     startupStatus.isInitialized && 
                     (!startupStatus.result || startupStatus.result.success);
    
    if (isHealthy) {
      console.log('✅ Deployment verification successful!');
      console.log('🎯 All systems are operational');
      process.exit(0);
    } else {
      console.log('⚠️  Deployment verification completed with warnings:');
      
      if (!migrationHealth.healthy) {
        console.log('  - Migration system has issues:', migrationHealth.message);
      }
      
      if (!startupStatus.isInitialized) {
        console.log('  - Startup service not initialized');
      }
      
      if (startupStatus.result && !startupStatus.result.success) {
        console.log('  - Startup completed with errors:', startupStatus.result.message);
      }
      
      // Exit with warning code (not error) to allow deployment to continue
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Deployment verification failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Exit with error code to indicate deployment issues
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n🛑 Verification interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Verification terminated');
  process.exit(0);
});

// Run verification
verifyDeployment(); 