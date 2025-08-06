import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export default async function authRoutes(fastify: FastifyInstance) {
  // Test endpoint to verify authentication
  fastify.get('/test', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      
      return reply.send({
        message: 'Authentication successful!',
        user: {
          id: authenticatedRequest.user.id,
          email: authenticatedRequest.user.email,
          role: authenticatedRequest.user.role,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get current user info
  fastify.get('/me', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      
      return reply.send({
        user: {
          id: authenticatedRequest.user.id,
          email: authenticatedRequest.user.email,
          role: authenticatedRequest.user.role,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
} 