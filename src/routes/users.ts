import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth } from '@/middleware/auth';
import { AuthenticatedRequest } from '@/types';
import { userService, petService, subscriptionService } from '@/services';
import { ApiResponses } from '@/utils';
import { z } from 'zod';
import { bunnyService } from '@/utils/bunny';
import { randomUUID } from 'crypto';

const startPhoneVerificationBodySchema = z.object({
  phoneNumber: z.string(),
});

const verifyPhoneVerificationBodySchema = z.object({
  code: z.string(),
  profile: z.any(), // Using any() here because we will parse with a stricter schema in the service
});


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
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      const profileData = request.body as any;
      
      fastify.log.info(`Onboarding profile request for user: ${userId}`);
      fastify.log.info('Profile data received:', profileData);

      const profile = await userService.saveOnboardingProfile(userId, profileData);
      
      fastify.log.info('Profile saved successfully:', profile);
      return reply.status(201).send(ApiResponses.created(profile, 'Profile setup completed successfully'));
    } catch (error) {
      fastify.log.error('Error in /onboarding/profile endpoint:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        return reply.status(400).send(ApiResponses.validationError({ message: error.message }));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to save profile setup'));
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