import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { lookupTypeService } from '../services/lookupTypeService';
import type { 
  LookupTypeParams,
  LookupTypeIdParams,
  LookupTypeQuery
} from '../types';
import { 
  createLookupTypeSchema, 
  updateLookupTypeSchema,
  lookupTypeQueryParamsSchema,
  lookupTypeParamSchema,
  lookupTypeIdParamSchema
} from '../constants/schemas';

const lookupTypesRoutes: FastifyPluginAsync = async (fastify) => {


  /**
   * GET /lookup-types/:type
   * Get lookup types with flexible filtering
   */
  fastify.get<{ Params: LookupTypeParams; Querystring: LookupTypeQuery }>('/:type', async (request, reply) => {
    try {
      // Validate path parameter
      const typeResult = lookupTypeParamSchema.safeParse(request.params.type);
      if (!typeResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid lookup type. Must be one of: activity, symptom, vet_visit, medication'
        });
      }
      
      const type = typeResult.data;
      
      // Validate and parse query parameters
      const queryResult = lookupTypeQueryParamsSchema.safeParse(request.query);
      if (!queryResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid query parameters',
          details: queryResult.error.errors
        });
      }
      
      const result = await lookupTypeService.getLookupTypes(type, queryResult.data);
      
      return reply.send(result);
    } catch (error) {
      console.error('Error fetching lookup types:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /lookup-types/:type/all-species
   * Get all lookup types for a specific species
   */
  fastify.get<{ Params: LookupTypeParams; Querystring: { species: string } }>('/:type/all-species', async (request, reply) => {
    try {
      // Validate path parameter
      const typeResult = lookupTypeParamSchema.safeParse(request.params.type);
      if (!typeResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid lookup type. Must be one of: activity, symptom, vet_visit, medication'
        });
      }
      
      const type = typeResult.data;
      
      // Validate species query parameter
      const { species } = request.query;
      if (!species || typeof species !== 'string') {
        return reply.status(400).send({
          success: false,
          error: 'Species parameter is required'
        });
      }
      
      const result = await lookupTypeService.getAllLookupTypesForSpecies(species);
      
      return reply.send(result);
    } catch (error) {
      console.error('Error fetching all lookup types for species:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /lookup-types/:type/:id
   * Get a single lookup type by ID
   */
  fastify.get<{ Params: LookupTypeIdParams }>('/:type/:id', async (request, reply) => {
    try {
      // Validate path parameters
      const typeResult = lookupTypeParamSchema.safeParse(request.params.type);
      const idResult = lookupTypeIdParamSchema.safeParse(request.params.id);
      
      if (!typeResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid lookup type. Must be one of: activity, symptom, vet_visit, medication'
        });
      }
      
      if (!idResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid ID format'
        });
      }
      
      const type = typeResult.data;
      const id = idResult.data;
      
      const result = await lookupTypeService.getLookupTypeById(type, id);
      
      return reply.send(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: error.message
        });
      }
      
      console.error('Error fetching lookup type by ID:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /lookup-types/:type
   * Create a new lookup type
   */
  fastify.post<{ Params: LookupTypeParams; Body: any }>('/:type', async (request, reply) => {
    try {
      // Validate path parameter
      const typeResult = lookupTypeParamSchema.safeParse(request.params.type);
      if (!typeResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid lookup type. Must be one of: activity, symptom, vet_visit, medication'
        });
      }
      
      const type = typeResult.data;
      
      // Validate request body
      const bodyResult = createLookupTypeSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid request body',
          details: bodyResult.error.errors
        });
      }
      
      const result = await lookupTypeService.createLookupType(type, bodyResult.data);
      
      return reply.status(201).send(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.message
        });
      }
      
      console.error('Error creating lookup type:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * PUT /lookup-types/:type/:id
   * Update an existing lookup type
   */
  fastify.put<{ Params: LookupTypeIdParams; Body: any }>('/:type/:id', async (request, reply) => {
    try {
      // Validate path parameters
      const typeResult = lookupTypeParamSchema.safeParse(request.params.type);
      const idResult = lookupTypeIdParamSchema.safeParse(request.params.id);
      
      if (!typeResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid lookup type. Must be one of: activity, symptom, vet_visit, medication'
        });
      }
      
      if (!idResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid ID format'
        });
      }
      
      const type = typeResult.data;
      const id = idResult.data;
      
      // Validate request body
      const bodyResult = updateLookupTypeSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid request body',
          details: bodyResult.error.errors
        });
      }
      
      const result = await lookupTypeService.updateLookupType(type, id, bodyResult.data);
      
      return reply.send(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: error.message
        });
      }
      
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.message
        });
      }
      
      console.error('Error updating lookup type:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * DELETE /lookup-types/:type/:id
   * Soft delete a lookup type (sets isActive to false)
   */
  fastify.delete<{ Params: LookupTypeIdParams }>('/:type/:id', async (request, reply) => {
    try {
      // Validate path parameters
      const typeResult = lookupTypeParamSchema.safeParse(request.params.type);
      const idResult = lookupTypeIdParamSchema.safeParse(request.params.id);
      
      if (!typeResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid lookup type. Must be one of: activity, symptom, vet_visit, medication'
        });
      }
      
      if (!idResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid ID format'
        });
      }
      
      const type = typeResult.data;
      const id = idResult.data;
      
      const result = await lookupTypeService.deleteLookupType(type, id);
      
      return reply.send(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: error.message
        });
      }
      
      console.error('Error deleting lookup type:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * DELETE /lookup-types/:type/:id/hard
   * Hard delete a lookup type (permanent removal)
   */
  fastify.delete<{ Params: LookupTypeIdParams }>('/:type/:id/hard', async (request, reply) => {
    try {
      // Validate path parameters
      const typeResult = lookupTypeParamSchema.safeParse(request.params.type);
      const idResult = lookupTypeIdParamSchema.safeParse(request.params.id);
      
      if (!typeResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid lookup type. Must be one of: activity, symptom, vet_visit, medication'
        });
      }
      
      if (!idResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid ID format'
        });
      }
      
      const type = typeResult.data;
      const id = idResult.data;
      
      const result = await lookupTypeService.hardDeleteLookupType(type, id);
      
      return reply.send(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: error.message
        });
      }
      
      console.error('Error hard deleting lookup type:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /lookup-types/:type/:id/restore
   * Restore a deleted lookup type (sets isActive to true)
   */
  fastify.post<{ Params: LookupTypeIdParams }>('/:type/:id/restore', async (request, reply) => {
    try {
      // Validate path parameters
      const typeResult = lookupTypeParamSchema.safeParse(request.params.type);
      const idResult = lookupTypeIdParamSchema.safeParse(request.params.id);
      
      if (!typeResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid lookup type. Must be one of: activity, symptom, vet_visit, medication'
        });
      }
      
      if (!idResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid ID format'
        });
      }
      
      const type = typeResult.data;
      const id = idResult.data;
      
      const result = await lookupTypeService.restoreLookupType(type, id);
      
      return reply.send(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: error.message
        });
      }
      
      console.error('Error restoring lookup type:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /lookup-types/:type/bulk
   * Bulk create lookup types (useful for seeding)
   */
  fastify.post<{ Params: LookupTypeParams; Body: any[] }>('/:type/bulk', async (request, reply) => {
    try {
      // Validate path parameter
      const typeResult = lookupTypeParamSchema.safeParse(request.params.type);
      if (!typeResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid lookup type. Must be one of: activity, symptom, vet_visit, medication'
        });
      }
      
      const type = typeResult.data;
      
      // Validate request body
      if (!Array.isArray(request.body)) {
        return reply.status(400).send({
          success: false,
          error: 'Request body must be an array'
        });
      }
      
      const result = await lookupTypeService.bulkCreateLookupTypes(type, request.body);
      
      return reply.status(201).send(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.message
        });
      }
      
      console.error('Error bulk creating lookup types:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /lookup-types/:type/stats
   * Get statistics for a lookup type
   */
  fastify.get<{ Params: LookupTypeParams }>('/:type/stats', async (request, reply) => {
    try {
      // Validate path parameter
      const typeResult = lookupTypeParamSchema.safeParse(request.params.type);
      if (!typeResult.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid lookup type. Must be one of: activity, symptom, vet_visit, medication'
        });
      }
      
      const type = typeResult.data;
      
      const result = await lookupTypeService.getLookupTypeStats(type);
      
      return reply.send(result);
    } catch (error) {
      console.error('Error fetching lookup type stats:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });
};

export default lookupTypesRoutes; 