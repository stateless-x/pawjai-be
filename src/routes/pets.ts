import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { petService } from '../services';
import { ApiResponses } from '../utils';

export default async function petRoutes(fastify: FastifyInstance) {
  // Get all pets for the authenticated user
  fastify.get('/my-pets', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      
      const userPets = await petService.getMyPets(userId);
      return reply.send(ApiResponses.success(userPets, 'User pets retrieved successfully'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve user pets'));
    }
  });

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
      fastify.log.error(error);
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
      fastify.log.error(error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send(ApiResponses.notFound('Pet', petId));
      }
      if (error instanceof Error && error.message.includes('Access denied')) {
        return reply.status(403).send(ApiResponses.forbidden(error.message));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve pet'));
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
      fastify.log.error(error);
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
      fastify.log.error(error);
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
    try {
      const { petId } = request.params as { petId: string };
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      
      const result = await petService.deletePet(petId, userId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({ error: error.message });
      }
      if (error instanceof Error && error.message.includes('Access denied')) {
        return reply.status(403).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
} 