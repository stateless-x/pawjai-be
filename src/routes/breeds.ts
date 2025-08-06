import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { breedService } from '../services';
import { ApiResponses, PaginationOptions } from '../utils';
import { BreedFilters } from '../types';
import { SPECIES_ENUM } from '../constants';

export default async function breedRoutes(fastify: FastifyInstance) {
  // Get all breeds with optional filtering
  fastify.get('/', async (request: FastifyRequest<{
    Querystring: BreedFilters
  }>, reply: FastifyReply) => {
    try {
      const filters = request.query;
      const result = await breedService.getBreeds(filters);
      return reply.send(ApiResponses.paginated(result.data, result.pagination, 'Breeds retrieved successfully'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve breeds'));
    }
  });

  // Get breed names by species
  fastify.get('/names', async (request: FastifyRequest<{
    Querystring: PaginationOptions & { species: string }
  }>, reply: FastifyReply) => {
    const { species, ...paginationOptions } = request.query;
    
    try {
      if (!species || !SPECIES_ENUM.includes(species as typeof SPECIES_ENUM[number])) {
        return reply.status(400).send(ApiResponses.validationError('Invalid species. Must be "dog" or "cat"'));
      }

      const result = await breedService.getBreedNamesBySpecies(species as typeof SPECIES_ENUM[number], paginationOptions);
      
      return reply.send(ApiResponses.paginated(
        result.data, 
        result.pagination, 
        `${species} breed names retrieved successfully`
      ));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve breed names'));
    }
  });

  // Get a specific breed by name
  fastify.get('/:breedName', async (request: FastifyRequest<{ Params: { breedName: string } }>, reply: FastifyReply) => {
    const { breedName } = request.params;
    try {
      const breed = await breedService.getBreedByName(breedName);
      return reply.send(ApiResponses.success(breed, 'Breed retrieved successfully'));
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof Error && error.message.includes('not found')) {
          return reply.status(404).send(ApiResponses.notFound('Breed', breedName));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve breed'));
    }
  });

  // Create a new breed
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const requestBody = request.body as any;
      let breedData: any;
      let detailsData: any;
      
      if (requestBody.breed && requestBody.detail) {
        breedData = requestBody.breed;
        detailsData = requestBody.detail;
      } else {
        breedData = requestBody;
        detailsData = undefined;
      }
      
      const newBreed = await breedService.createBreed(breedData, detailsData);
      return reply.status(201).send(ApiResponses.created(newBreed, 'Breed created successfully'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to create breed'));
    }
  });

  // Update a breed
  fastify.put('/:breedId', async (request: FastifyRequest<{ Params: { breedId: string } }>, reply: FastifyReply) => {
    const { breedId } = request.params;
    
    try {
      const requestBody = request.body as any;
      
      // Handle nested structure: { breed: {...}, detail: {...} }
      let breedData: any;
      let detailsData: any;
      
      if (requestBody.breed && requestBody.detail) {
        // Nested structure
        breedData = requestBody.breed;
        detailsData = requestBody.detail;
      } else {
        // Flat structure (backward compatibility)
        breedData = requestBody;
        detailsData = undefined;
      }

      const updatedBreed = await breedService.updateBreed(breedId, breedData, detailsData);
      return reply.send(ApiResponses.updated(updatedBreed, 'Breed updated successfully'));
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send(ApiResponses.notFound('Breed', breedId));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to update breed'));
    }
  });

  // Delete a breed
  fastify.delete('/:breedId', async (request: FastifyRequest<{ Params: { breedId: string } }>, reply: FastifyReply) => {
    const { breedId } = request.params;
    
    try {
      const result = await breedService.deleteBreed(breedId);
      return reply.send(ApiResponses.deleted('Breed deleted successfully'));
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send(ApiResponses.notFound('Breed', breedId));
      }
      return reply.status(500).send(ApiResponses.internalError('Failed to delete breed'));
    }
  });

  // Get breed count
  fastify.get('/count', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await breedService.getBreedCount();
      return reply.send(ApiResponses.success(result, 'Breed count fetched successfully'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to fetch breed count'));
    }
  });
} 