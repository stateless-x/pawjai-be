import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { config } from 'dotenv';

// Import configurations
import { configureRateLimiting } from './config/rate-limit';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import petRoutes from './routes/pets';
import breedRoutes from './routes/breeds';
import subscriptionRoutes from './routes/subscriptions';
import petRecordRoutes from './routes/petRecord';

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

// Register multipart plugin
fastify.register(multipart);

// Configure rate limiting
try {
  await configureRateLimiting(fastify);
} catch (error) {
  console.error('Failed to configure rate limiting:', error);
  // Continue without rate limiting rather than crashing the server
}

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Database test endpoint
fastify.get('/db-test', async (request, reply) => {
  try {
    console.log('=== DATABASE TEST START ===');
    const { db } = await import('@/db');
    const { userProfiles } = await import('@/db/schema');
    
    console.log('Database imported successfully');
    
    // Simple query to test database connection
    const result = await db.select().from(userProfiles).limit(1);
    
    console.log('Database query successful, result count:', result.length);
    console.log('=== DATABASE TEST END ===');
    
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Database connection is working',
      hasUsers: result.length > 0
    };
  } catch (error) {
    console.error('=== DATABASE TEST ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('=== END DATABASE TEST ERROR ===');
    
    return reply.status(500).send({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({ error: 'Internal Server Error' });
});

// Start server
const port = process.env.PORT ? parseInt(process.env.PORT) : 4001;
const host = '0.0.0.0';

try {
  await fastify.listen({ port, host });
  fastify.log.info(`Server is running on http://localhost:${port}`);
  fastify.log.info(`Allowed origins: ${allowedOrigins.join(', ')}`);
} catch (err) {
  fastify.log.error('Failed to start server:', err);
  process.exit(1);
} 