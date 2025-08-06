import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { userService } from '../services';
import { ApiResponses } from '../utils';

export default async function userRoutes(fastify: FastifyInstance) {
  // Get user profile (requires authentication)
  fastify.get('/profile', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      
      const profile = await userService.getUserProfile(userId);
      return reply.send(ApiResponses.success(profile, 'User profile retrieved successfully'));
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send(ApiResponses.notFound('User profile'));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve user profile'));
    }
  });

  // Get user profile by ID (admin only or own profile)
  fastify.get('/profile/:userId', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string };
    const authenticatedRequest = request as AuthenticatedRequest;
    const currentUserId = authenticatedRequest.user.id;
    
    try {
      // Users can only access their own profile unless they're admin
      if (userId !== currentUserId && authenticatedRequest.user.role !== 'admin') {
        return reply.status(403).send(ApiResponses.forbidden('You can only access your own profile'));
      }
      
      const profile = await userService.getUserProfileByAdmin(userId);
      return reply.send(ApiResponses.success(profile, 'User profile retrieved successfully'));
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send(ApiResponses.notFound('User profile', userId));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve user profile'));
    }
  });

  // Create or update user profile (requires authentication)
  fastify.post('/profile', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      const profileData = request.body as any;

      const profile = await userService.createOrUpdateUserProfile(userId, profileData);
      return reply.status(201).send(ApiResponses.created(profile, 'User profile created/updated successfully'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to create/update user profile'));
    }
  });

  // Get user personalization
  fastify.get('/personalization/:userId', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string };
    const authenticatedRequest = request as AuthenticatedRequest;
    const currentUserId = authenticatedRequest.user.id;
    
    try {
      // Users can only access their own personalization unless they're admin
      if (userId !== currentUserId && authenticatedRequest.user.role !== 'admin') {
        return reply.status(403).send(ApiResponses.forbidden('You can only access your own personalization'));
      }
      
      const personalization = await userService.getUserPersonalizationByAdmin(userId);
      return reply.send(ApiResponses.success(personalization, 'User personalization retrieved successfully'));
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send(ApiResponses.notFound('User personalization', userId));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve user personalization'));
    }
  });

  // Create or update user personalization
  fastify.post('/personalization/:userId', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string };
    const authenticatedRequest = request as AuthenticatedRequest;
    const currentUserId = authenticatedRequest.user.id;
    
    try {
      // Users can only update their own personalization unless they're admin
      if (userId !== currentUserId && authenticatedRequest.user.role !== 'admin') {
        return reply.status(403).send(ApiResponses.forbidden('You can only update your own personalization'));
      }
      
      const personalizationData = request.body as any;
      const personalization = await userService.createOrUpdateUserPersonalization(userId, personalizationData);
      return reply.status(201).send(ApiResponses.created(personalization, 'User personalization created/updated successfully'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to create/update user personalization'));
    }
  });
} 