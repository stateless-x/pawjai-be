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

  // Get breeds by species
  fastify.get('/species/:species', async (request: FastifyRequest<{ Params: { species: string } }>, reply: FastifyReply) => {
    const { species } = request.params;
    
    try {
      if (!SPECIES_ENUM.includes(species as typeof SPECIES_ENUM[number])) {
        return reply.status(400).send(ApiResponses.validationError('Invalid species. Must be "dog" or "cat"'));
      }

      const breeds = await breedService.getBreedsBySpecies(species as typeof SPECIES_ENUM[number]);
      return reply.send(ApiResponses.success(breeds, `${species} breeds retrieved successfully`));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve breeds by species'));
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

  // Get breed names for selector (with caching and language support)
  fastify.get('/selector', async (request: FastifyRequest<{
    Querystring: PaginationOptions & { 
      species: string; 
      language?: 'en' | 'th' 
    }
  }>, reply: FastifyReply) => {
    const { species, language = 'th', ...paginationOptions } = request.query;
    
    try {
      if (!species || !SPECIES_ENUM.includes(species as typeof SPECIES_ENUM[number])) {
        return reply.status(400).send(ApiResponses.validationError('Invalid species. Must be "dog" or "cat"'));
      }

      if (language && !['en', 'th'].includes(language)) {
        return reply.status(400).send(ApiResponses.validationError('Invalid language. Must be "en" or "th"'));
      }

      const result = await breedService.getBreedNamesForSelector(
        species as typeof SPECIES_ENUM[number], 
        language as 'en' | 'th',
        paginationOptions
      );
      
      return reply.send(ApiResponses.paginated(
        result.data, 
        result.pagination, 
        `${species} breed names for selector retrieved successfully`
      ));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to retrieve breed names for selector'));
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

  // Clear breed names cache (admin only)
  fastify.delete('/cache', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      breedService.clearBreedNamesCache();
      return reply.send(ApiResponses.success({ message: 'Cache cleared successfully' }, 'Breed names cache cleared'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to clear cache'));
    }
  });

  // Get cache stats (admin only)
  fastify.get('/cache/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = breedService.getCacheStats();
      return reply.send(ApiResponses.success(stats, 'Cache stats retrieved successfully'));
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send(ApiResponses.internalError('Failed to get cache stats'));
    }
  });
} 