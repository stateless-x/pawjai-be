import { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

export async function configureRateLimiting(fastify: FastifyInstance) {
  // Get rate limiting configuration from environment variables
  const globalMax = parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '100');
  const globalWindow = process.env.RATE_LIMIT_GLOBAL_WINDOW || '1 minute';
  const apiMax = parseInt(process.env.RATE_LIMIT_API_MAX || '30');
  const apiWindow = process.env.RATE_LIMIT_API_WINDOW || '1 minute';
  const authMax = parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5');
  const authWindow = process.env.RATE_LIMIT_AUTH_WINDOW || '15 minutes';

  // Global rate limiting
  await fastify.register(rateLimit, {
    max: globalMax,
    timeWindow: globalWindow,
    errorResponseBuilder: (request: any, context: any) => ({
      code: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${context.after}`,
      expiresIn: context.ttl,
    }),
  });

  // API-specific rate limiting for more restrictive limits
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/api/')) {
      // Apply stricter rate limiting for API endpoints
      const clientId = request.ip || request.headers['x-forwarded-for'] || 'anonymous';
      const key = `api:${clientId}`;
      
      // This is a simplified rate limiting - in production, you might want to use Redis
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 minute
      const maxRequests = apiMax;
      
      // For now, we'll rely on the global rate limiting
      // In a production environment, you'd implement more sophisticated rate limiting here
    }
  });
}

// Rate limiting configuration for different endpoints
export const rateLimitConfig = {
  global: {
    max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '100'),
    timeWindow: process.env.RATE_LIMIT_GLOBAL_WINDOW || '1 minute',
  },
  api: {
    max: parseInt(process.env.RATE_LIMIT_API_MAX || '30'),
    timeWindow: process.env.RATE_LIMIT_API_WINDOW || '1 minute',
  },
  auth: {
    max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5'),
    timeWindow: process.env.RATE_LIMIT_AUTH_WINDOW || '15 minutes',
  },
  upload: {
    max: 10,
    timeWindow: '1 hour',
  },
}; 