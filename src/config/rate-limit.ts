import { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

// Helper function to convert time window strings to milliseconds
function parseTimeWindow(timeWindow: string): number {
  try {
    const timeValue = parseInt(timeWindow);
    if (isNaN(timeValue)) {
      return 60 * 1000;
    }
    
    if (timeWindow.includes('minute')) {
      return timeValue * 60 * 1000;
    } else if (timeWindow.includes('hour')) {
      return timeValue * 60 * 60 * 1000;
    } else if (timeWindow.includes('second')) {
      return timeValue * 1000;
    } else if (timeWindow.includes('day')) {
      return timeValue * 24 * 60 * 60 * 1000;
    }
    // Default to minutes if no unit specified
    return timeValue * 60 * 1000;
  } catch (error) {
    return 60 * 1000;
  }
}

export async function configureRateLimiting(fastify: FastifyInstance) {
  try {
    // Check if rate limiting should be disabled
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      return;
    }

    // Get rate limiting configuration from environment variables with fallbacks
    const globalMax = parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '100') || 100;
    const globalWindow = parseTimeWindow(process.env.RATE_LIMIT_GLOBAL_WINDOW || '1 minute');

    // Check if rate limiting is already registered
    if (fastify.hasPlugin('@fastify/rate-limit')) {
      return;
    }

    // Global rate limiting - using minimal configuration to avoid compatibility issues
    const rateLimitConfig = {
      max: globalMax,
      timeWindow: globalWindow,
      errorResponseBuilder: (request: any, context: any) => ({
        code: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${context.after}`,
        expiresIn: context.ttl,
      }),
    };

    // Try with minimal config first, if that fails, try with even more minimal config
    try {
      await fastify.register(rateLimit, rateLimitConfig);
    } catch (firstError) {
      // Fallback to minimal configuration
      const minimalConfig = {
        max: globalMax,
        timeWindow: globalWindow,
      };
      
      await fastify.register(rateLimit, minimalConfig);
    }
  } catch (error) {
    // If rate limiting fails, continue without it rather than crashing the server
  }
}

// Rate limiting configuration for different endpoints
export const rateLimitConfig = {
  global: {
    max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '100') || 100,
    timeWindow: parseTimeWindow(process.env.RATE_LIMIT_GLOBAL_WINDOW || '1 minute'),
  },
  api: {
    max: parseInt(process.env.RATE_LIMIT_API_MAX || '30') || 30,
    timeWindow: parseTimeWindow(process.env.RATE_LIMIT_API_WINDOW || '1 minute'),
  },
  auth: {
    max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5') || 5,
    timeWindow: parseTimeWindow(process.env.RATE_LIMIT_AUTH_WINDOW || '15 minutes'),
  },
  upload: {
    max: 10,
    timeWindow: parseTimeWindow('1 hour'),
  },
}; 