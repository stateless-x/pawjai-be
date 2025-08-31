import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { config } from 'dotenv';

// Import configurations
import { configureRateLimiting } from './config/rate-limit';

// Import services
import { startupService } from './services/startupService';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import petRoutes from './routes/pets';
import breedRoutes from './routes/breeds';
import subscriptionRoutes from './routes/subscriptions';
import petRecordRoutes from './routes/petRecord';
import lookupTypesRoutes from './routes/lookupTypes';

config();

const fastify = Fastify({
  logger: true,
});

// Register plugins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'https://pawjai.co',
      'https://www.pawjai.co',
      'http://localhost:3000',
      'https://pawjai-be-production.up.railway.app',
    ];

await fastify.register(cors, {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204
});

await fastify.register(helmet);

// Register multipart plugin with file size limits
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Allow only 1 file per request
    fieldSize: 1024 * 1024, // 1MB for text fields
  }
});

// Configure rate limiting
try {
  await configureRateLimiting(fastify);
} catch (error) {
  console.error('Failed to configure rate limiting:', error);
  // Continue without rate limiting rather than crashing the server
}

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  try {
    const startupHealth = await startupService.healthCheck();
    const migrationHealth = await startupService.healthCheck();
    
    return {
      status: startupHealth.healthy ? 'ok' : 'warning',
      timestamp: new Date().toISOString(),
      startup: startupHealth,
      migrations: migrationHealth
    };
  } catch (error) {
    fastify.log.error('Health check failed:', error);
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    };
  }
});

// Migration status endpoint
fastify.get('/api/migrations/status', async (request, reply) => {
  try {
    const status = await startupService.getStatus();
    const migrationStatus = await startupService.healthCheck();
    
    return {
      startup: status,
      migrations: migrationStatus,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    fastify.log.error('Migration status check failed:', error);
    reply.status(500).send({ error: 'Failed to get migration status' });
  }
});


// CORS debug endpoint
fastify.get('/cors-debug', async (request, reply) => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    origin: request.headers.origin,
    referer: request.headers.referer,
    allowedOrigins: allowedOrigins,
    userAgent: request.headers['user-agent']
  };
});

// Register routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(userRoutes, { prefix: '/api/users' });
await fastify.register(petRoutes, { prefix: '/api/pets' });
await fastify.register(breedRoutes, { prefix: '/api/breeds' });
await fastify.register(subscriptionRoutes, { prefix: '/api/subscriptions' });
await fastify.register(petRecordRoutes, { prefix: '/api' });
await fastify.register(lookupTypesRoutes, { prefix: '/api/lookup-types' });

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({ error: 'Internal Server Error' });
});

// Start server
const port = process.env.PORT ? parseInt(process.env.PORT) : 4001;
const host = '0.0.0.0';

try {
  // Initialize startup services (including migrations)
  fastify.log.info('🚀 Initializing startup services...');
  const startupResult = await startupService.initialize();
  
  if (!startupResult.success) {
    fastify.log.warn('⚠️  Startup completed with warnings:', startupResult.message);
  } else {
    fastify.log.info('✅ Startup services initialized successfully');
  }
  
  // Start the server
  await fastify.listen({ port, host });
  fastify.log.info(`🚀 Server is running on http://localhost:${port}`);
  fastify.log.info(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
  fastify.log.info(`📊 Startup status: ${startupResult.message}`);
  
} catch (err) {
  fastify.log.error('💥 Failed to start server:', err);
  
  // Log startup status if available
  try {
    const status = startupService.getStatus();
    fastify.log.error('Startup status at failure:', status);
  } catch (statusError) {
    fastify.log.error('Could not get startup status:', statusError);
  }
  
  process.exit(1);
} 