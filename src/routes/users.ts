import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth } from '@/middleware/auth';
import { AuthenticatedRequest } from '@/types';
import { userService, petService, subscriptionService } from '@/services';
import { ApiResponses } from '@/utils';
import { z } from 'zod';
import { bunnyService } from '@/utils/bunny';
import { randomUUID } from 'crypto';

export default async function userRoutes(fastify: FastifyInstance) {
  // Get dashboard data (profile, subscription, pets) in one call
  fastify.get('/dashboard', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      
      fastify.log.info(`Dashboard request for user: ${userId}`);
      
      // Fetch all dashboard data in parallel, ensuring defaults exist
      const [profileResult, subscriptionResult, petsResult] = await Promise.allSettled([
        userService.ensureUserProfile(userId), // Ensure profile exists
        subscriptionService.ensure(userId), // Ensure subscription exists
        petService.getMyPets(userId)
      ]);

      // Log the results for debugging
      fastify.log.info('Profile result:', { status: profileResult.status, value: profileResult.status === 'fulfilled' ? 'success' : profileResult.reason });
      fastify.log.info('Subscription result:', { status: subscriptionResult.status, value: subscriptionResult.status === 'fulfilled' ? subscriptionResult.value : subscriptionResult.reason });
      fastify.log.info('Pets result:', { status: petsResult.status, value: petsResult.status === 'fulfilled' ? `${petsResult.value.length} pets` : petsResult.reason });

      const dashboardData = {
        profile: profileResult.status === 'fulfilled' ? profileResult.value : null,
        subscription: subscriptionResult.status === 'fulfilled' ? subscriptionResult.value : null,
        pets: petsResult.status === 'fulfilled' ? petsResult.value : []
      };

      return reply.send(ApiResponses.success(dashboardData, 'Dashboard data retrieved successfully'));
    } catch (error) {
      fastify.log.error('Error in /dashboard endpoint:', error);
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve dashboard data'));
    }
  });

  // Get user profile (requires authentication)
  fastify.get('/profile', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      
      const profile = await userService.ensureUserProfile(userId);
      return reply.send(ApiResponses.success(profile, 'User profile retrieved successfully'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve user profile'));
    }
  });

  fastify.post('/profile/image', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const userId = authenticatedRequest.user.id;

    const data = await request.file();
    if (!data) {
      return reply.status(400).send(ApiResponses.badRequest('No file uploaded'));
    }

    try {
      const buffer = await data.toBuffer();
      const fileName = `${randomUUID()}-${data.filename}`;
      const path = bunnyService.getUserProfileImagePath(userId);
      
      const imageUrl = await bunnyService.upload(buffer, path, fileName);
      
      await userService.updateUserProfileImage(userId, imageUrl);

      return reply.send(ApiResponses.success({ imageUrl }, 'Profile image uploaded successfully'));
    } catch (error) {
      fastify.log.error('Error uploading profile image:', error);
      return reply.status(500).send(ApiResponses.internalError('Failed to upload profile image'));
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

  // Onboarding: Save profile setup
  fastify.post('/onboarding/profile', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('=== ONBOARDING PROFILE REQUEST START ===');
      
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      const profileData = request.body as any;
      
      console.log('User ID:', userId);
      console.log('Request body:', JSON.stringify(profileData, null, 2));

      console.log('Calling userService.saveOnboardingProfile...');
      const profile = await userService.saveOnboardingProfile(userId, profileData);
      
      console.log('Profile saved successfully');
      console.log('=== ONBOARDING PROFILE REQUEST END ===');
      return reply.status(201).send(ApiResponses.created(profile, 'Profile setup completed successfully'));
    } catch (error) {
      console.error('=== ONBOARDING PROFILE ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('=== END ERROR ===');
      
      // For debugging, return the actual error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('Phone number is already registered')) {
          return reply.status(409).send(ApiResponses.badRequest('Phone number is already registered by another user'));
        }
        if (error.message.includes('validation')) {
          return reply.status(400).send(ApiResponses.validationError({ message: error.message }));
        }
        if (error.message.includes('Required fields are missing')) {
          return reply.status(400).send(ApiResponses.badRequest('Required fields are missing'));
        }
        if (error.message.includes('Invalid data provided')) {
          return reply.status(400).send(ApiResponses.badRequest('Invalid data provided'));
        }
        if (error.message.includes('Database connection error')) {
          return reply.status(503).send(ApiResponses.internalError('Database connection error'));
        }
        if (error.message.includes('Database operation timed out')) {
          return reply.status(503).send(ApiResponses.internalError('Database operation timed out'));
        }
      }
      
      // Return the actual error message for debugging
      return reply.status(500).send({
        success: false,
        error: 'Failed to save profile setup',
        code: 'INTERNAL_SERVER_ERROR',
        debug: errorMessage, // This will show the actual error
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    }
  });

  // Onboarding: Complete onboarding (profile + pet)
  fastify.post('/onboarding/complete', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      const onboardingData = request.body as any;
      
      fastify.log.info(`Onboarding complete request for user: ${userId}`);
      fastify.log.info('Onboarding data received:', onboardingData);

      const result = await userService.completeOnboarding(userId, onboardingData);
      
      fastify.log.info('Onboarding completed successfully:', result);
      return reply.status(201).send(ApiResponses.created(result, 'Onboarding completed successfully'));
    } catch (error) {
      fastify.log.error('Error in /onboarding/complete endpoint:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return reply.status(400).send(ApiResponses.validationError({ message: error.message }));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to complete onboarding'));
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