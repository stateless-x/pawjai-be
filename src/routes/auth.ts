import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponses } from '../utils';

export default async function authRoutes(fastify: FastifyInstance) {
  // Test endpoint to verify authentication
  fastify.get('/test', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      
      return reply.send(ApiResponses.success({
        user: {
          id: authenticatedRequest.user.id,
          email: authenticatedRequest.user.email,
          role: authenticatedRequest.user.role,
        }
      }, 'Authentication successful!'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Internal server error'));
    }
  });

  // Get current user info
  fastify.get('/me', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      
      return reply.send(ApiResponses.success({
        user: {
          id: authenticatedRequest.user.id,
          email: authenticatedRequest.user.email,
          role: authenticatedRequest.user.role,
        }
      }, 'User information retrieved successfully'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Internal server error'));
    }
  });
} 