import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '@/middleware/auth';
import { AuthenticatedRequest } from '@/types';
import { ApiResponses } from '@/utils';
import { userService } from '@/services';

export default async function authRoutes(fastify: FastifyInstance) {
  // Get current user's auth state
  fastify.get('/state', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      
      const authState = await userService.getAuthState(userId);

      if (!authState) {
        return reply.status(404).send(ApiResponses.notFound('User auth state', userId));
      }
      
      return reply.send(ApiResponses.success(authState, 'Auth state retrieved successfully'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve auth state'));
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