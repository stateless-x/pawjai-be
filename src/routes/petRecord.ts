import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '@/middleware/auth';
import { AuthenticatedRequest } from '@/types';
import { petRecordService } from '@/services/petRecordServices';
import { ApiResponses } from '@/utils';

export default async function petRecordRoutes(fastify: FastifyInstance) {
  
  // Create a new pet record
  fastify.post('/pets/:petId/records', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const petId = (request.params as any).petId;
      const userId = authenticatedRequest.user.id;
      
      if (!petId) {
        return reply.status(400).send(ApiResponses.error('Pet ID is required'));
      }
      
      const result = await petRecordService.createRecord(petId, userId, request.body as any);
      
      return reply.status(201).send(ApiResponses.created(result.data, 'Pet record created successfully'));
    } catch (error: any) {
      fastify.log.error('Error creating pet record:', error);
      
      if (error.message.includes('Pet not found') || error.message.includes('access denied')) {
        return reply.status(404).send(ApiResponses.notFound('Pet'));
      }
      
      if (error.message.includes('Invalid') && error.message.includes('type ID')) {
        return reply.status(400).send(ApiResponses.error(error.message));
      }
      
      return reply.status(500).send(ApiResponses.internalError('Failed to create pet record'));
    }
  });

  // Create records for multiple pets (bulk create)
  fastify.post('/pets/bulk-records', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;
      const { petIds, ...recordData } = request.body as any;
      
      if (!petIds || !Array.isArray(petIds) || petIds.length === 0) {
        return reply.status(400).send(ApiResponses.error('Pet IDs array is required and must not be empty'));
      }
      
      const result = await petRecordService.bulkCreateRecords(petIds, userId, recordData);
      
      return reply.status(201).send(ApiResponses.created(result.data, `Pet records created successfully for ${petIds.length} pets`));
    } catch (error: any) {
      fastify.log.error('Error bulk creating pet records:', error);
      
      if (error.message.includes('Some pets not found') || error.message.includes('access denied')) {
        return reply.status(404).send(ApiResponses.notFound('Some pets - please check pet ownership and existence'));
      }
      
      if (error.message.includes('Invalid') && error.message.includes('type ID')) {
        return reply.status(400).send(ApiResponses.error(error.message));
      }
      
      return reply.status(500).send(ApiResponses.internalError('Failed to bulk create pet records'));
    }
  });
  
  // Get pet records with filtering and pagination
  fastify.get('/pets/:petId/records', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const petId = (request.params as any).petId;
      const userId = authenticatedRequest.user.id;
      
      if (!petId) {
        return reply.status(400).send(ApiResponses.error('Pet ID is required'));
      }
      
      const query = request.query as any;
      
      const result = await petRecordService.getRecords(petId, userId, query);
      
      return reply.status(200).send(ApiResponses.success(result.data, 'Pet records retrieved successfully'));
    } catch (error: any) {
      fastify.log.error('Error fetching pet records:', error);
      
      if (error.message.includes('Pet not found') || error.message.includes('access denied')) {
        return reply.status(404).send(ApiResponses.notFound('Pet'));
      }
      
      return reply.status(500).send(ApiResponses.internalError('Failed to fetch pet records'));
    }
  });
  
  // Update a pet record
  fastify.patch('/records/:id', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const recordId = (request.params as any).id;
      const userId = authenticatedRequest.user.id;
      
      if (!recordId) {
        return reply.status(400).send(ApiResponses.error('Record ID is required'));
      }
      
      const result = await petRecordService.updateRecord(recordId, userId, request.body as any);
      
      return reply.status(200).send(ApiResponses.updated(result.data, 'Pet record updated successfully'));
    } catch (error: any) {
      fastify.log.error('Error updating pet record:', error);
      
      if (error.message.includes('Record not found') || error.message.includes('access denied')) {
        return reply.status(404).send(ApiResponses.notFound('Record'));
      }
      
      return reply.status(500).send(ApiResponses.internalError('Failed to update pet record'));
    }
  });
  
  // Soft delete a pet record
  fastify.delete('/records/:id', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authenticatedRequest = request as AuthenticatedRequest;
      const recordId = (request.params as any).id;
      const userId = authenticatedRequest.user.id;
      
      if (!recordId) {
        return reply.status(400).send(ApiResponses.error('Record ID is required'));
      }
      
      const result = await petRecordService.deleteRecord(recordId, userId);
      
      return reply.status(200).send(ApiResponses.deleted('Pet record deleted successfully'));
    } catch (error: any) {
      fastify.log.error('Error deleting pet record:', error);
      
      if (error.message.includes('Record not found') || error.message.includes('access denied')) {
        return reply.status(404).send(ApiResponses.notFound('Record'));
      }
      
      return reply.status(500).send(ApiResponses.internalError('Failed to delete pet record'));
    }
  });
  
  // Get all lookup types in a single call
  fastify.get('/lookups/all-types', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      const species = query?.species;
      
      const result = await petRecordService.getAllLookupTypes(species);
      
      return reply.status(200).send(ApiResponses.success(result.data, 'All lookup types retrieved successfully'));
    } catch (error: any) {
      fastify.log.error('Error fetching all lookup types:', error);
      return reply.status(500).send(ApiResponses.internalError('Failed to fetch all lookup types'));
    }
  });
}
