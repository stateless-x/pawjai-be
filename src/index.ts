import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { config } from 'dotenv';

// Import configurations
import { configureRateLimiting } from './config/rate-limit';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import petRoutes from './routes/pets';
import breedRoutes from './routes/breeds';
import subscriptionRoutes from './routes/subscriptions';

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
      'http://localhost:3000', // For local development
    ];

await fastify.register(cors, {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

await fastify.register(helmet);

// Configure rate limiting
await configureRateLimiting(fastify);

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(userRoutes, { prefix: '/api/users' });
await fastify.register(petRoutes, { prefix: '/api/pets' });
await fastify.register(breedRoutes, { prefix: '/api/breeds' });
await fastify.register(subscriptionRoutes, { prefix: '/api/subscriptions' });

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
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
} 