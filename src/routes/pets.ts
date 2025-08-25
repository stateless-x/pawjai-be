import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth } from '@/middleware/auth';
import { AuthenticatedRequest } from '@/types';
import { petService } from '@/services';
import { ApiResponses } from '@/utils';
import { randomUUID } from 'crypto';
import { bunnyService } from '@/utils/bunny';

export default async function petRoutes(fastify: FastifyInstance) {
  // Get all pets for a specific user (admin only)
  fastify.get('/user/:userId', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string };
    const authenticatedRequest = request as AuthenticatedRequest;
    
    try {
      // Only admins can view other users' pets
      if (authenticatedRequest.user.role !== 'admin') {
        return reply.status(403).send(ApiResponses.forbidden('Admin access required'));
      }
      
      const userPets = await petService.getUserPetsByAdmin(userId);
      return reply.send(ApiResponses.success(userPets, 'User pets retrieved successfully'));
    } catch (error) {
      fastify.log.error('Error in /user/:userId endpoint:', error);
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve user pets'));
    }
  });

  // Get a specific pet
  fastify.get('/:petId', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { petId } = request.params as { petId: string };
    const authenticatedRequest = request as AuthenticatedRequest;
    const userId = authenticatedRequest.user.id;
    
    try {
      const pet = await petService.getPetById(petId, userId);
      return reply.send(ApiResponses.success(pet, 'Pet retrieved successfully'));
    } catch (error) {
      fastify.log.error('Error in /:petId endpoint:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send(ApiResponses.notFound('Pet', petId));
      }
      if (error instanceof Error && error.message.includes('Access denied')) {
        return reply.status(403).send(ApiResponses.forbidden(error.message));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve pet'));
    }
  });

  fastify.post('/:petId/image', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { petId } = request.params as { petId: string };
    const authenticatedRequest = request as AuthenticatedRequest;
    const userId = authenticatedRequest.user.id;

    const data = await request.file();
    if (!data) {
      return reply.status(400).send(ApiResponses.badRequest('No file uploaded'));
    }

    try {
      fastify.log.info(`[Pet Upload] Step 1: Verifying pet ${petId} for user ${userId}`);
      // First, verify the pet belongs to the user
      await petService.getPetById(petId, userId);

      fastify.log.info(`[Pet Upload] Step 2: Converting uploaded file to buffer`);
      const buffer = await data.toBuffer();
      
      fastify.log.info(`[Pet Upload] Step 3: Calling BunnyService to upload`);
      const fileName = `${randomUUID()}-${data.filename}`;
      const path = bunnyService.getPetProfileImagePath(userId, petId);
      const imageUrl = await bunnyService.upload(buffer, path, fileName);
      
      fastify.log.info(`[Pet Upload] Step 4: Updating pet profile in database`);
      await petService.updatePetProfileImage(petId, userId, imageUrl);

      fastify.log.info(`[Pet Upload] Step 5: Sending success response`);
      return reply.send(ApiResponses.success({ imageUrl }, 'Pet profile image uploaded successfully'));
    } catch (error) {
      fastify.log.error(error, `A failure occurred during pet image upload for petId: ${petId}`);
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('Access denied'))) {
        return reply.status(404).send(ApiResponses.notFound('Pet', petId));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to upload pet image'));
    }
  });

  // Get all pets for the authenticated user
  fastify.get('/my-pets', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      
      fastify.log.info(`Fetching pets for user: ${userId}`);
      
      const userPets = await petService.getMyPets(userId);
      return reply.send(ApiResponses.success(userPets, 'User pets retrieved successfully'));
    } catch (error) {
      fastify.log.error('Error in /my-pets endpoint:', error);
      fastify.log.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve user pets'));
    }
  });

  // Create a new pet
  fastify.post('/', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      const petData = request.body as any;

      const newPet = await petService.createPet(userId, petData);
      return reply.status(201).send(ApiResponses.created(newPet, 'Pet created successfully'));
    } catch (error) {
      fastify.log.error('Error in POST / endpoint:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Breed with ID')) {
          return reply.status(400).send(ApiResponses.validationError(error.message));
        }
        if (error.message.includes('Failed to create pet')) {
          return reply.status(400).send(ApiResponses.validationError(error.message));
        }
      }
      
      return reply.status(500).send(ApiResponses.internalError('Failed to create pet'));
    }
  });

  // Update a pet
  fastify.put('/:petId', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { petId } = request.params as { petId: string };
    const authenticatedRequest = request as AuthenticatedRequest;
    const userId = authenticatedRequest.user.id;
    
    try {
      const petData = request.body as any;

      const updatedPet = await petService.updatePet(petId, userId, petData);
      return reply.send(ApiResponses.updated(updatedPet, 'Pet updated successfully'));
    } catch (error) {
      fastify.log.error('Error in PUT /:petId endpoint:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send(ApiResponses.notFound('Pet', petId));
      }
      if (error instanceof Error && error.message.includes('Access denied')) {
        return reply.status(403).send(ApiResponses.forbidden(error.message));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to update pet'));
    }
  });

  // Delete a pet
  fastify.delete('/:petId', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { petId } = request.params as { petId: string };
    const authenticatedRequest = request as AuthenticatedRequest;
    const userId = authenticatedRequest.user.id;
    
    try {
      const result = await petService.deletePet(petId, userId);
      return reply.send(ApiResponses.success(result, 'Pet deleted successfully'));
    } catch (error) {
      fastify.log.error('Error in DELETE /:petId endpoint:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send(ApiResponses.notFound('Pet', petId));
      }
      if (error instanceof Error && error.message.includes('Access denied')) {
        return reply.status(403).send(ApiResponses.forbidden(error.message));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to delete pet'));
    }
  });
} 