import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '@/middleware/auth';
import { AuthenticatedRequest } from '@/types';
import { subscriptionService } from '@/services';
import { ApiResponses } from '@/utils';

export default async function subscriptionRoutes(fastify: FastifyInstance) {
	// Get current user's subscription (ensure created if missing)
	fastify.get('/me', { preHandler: requireAuth() }, async (request: FastifyRequest, reply: FastifyReply) => {
		const authReq = request as AuthenticatedRequest;
		const sub = await subscriptionService.ensure(authReq.user.id);
		return reply.send(ApiResponses.success(sub, 'Subscription retrieved'));
	});

	// Create or replace current user's subscription
	fastify.post('/me', { preHandler: requireAuth() }, async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const authReq = request as AuthenticatedRequest;
			const created = await subscriptionService.createOrUpdate(authReq.user.id, request.body as any);
			return reply.status(201).send(ApiResponses.created(created, 'Subscription saved'));
		} catch (error) {
			fastify.log.error(error);
			return reply.status(400).send(ApiResponses.validationError(error instanceof Error ? error.message : 'Invalid payload'));
		}
	});

	// Update partial fields
	fastify.put('/me', { preHandler: requireAuth() }, async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const authReq = request as AuthenticatedRequest;
			const updated = await subscriptionService.update(authReq.user.id, request.body as any);
			return reply.send(ApiResponses.updated(updated, 'Subscription updated'));
		} catch (error) {
			fastify.log.error(error);
			if (error instanceof Error && error.message.includes('not found')) {
				return reply.status(404).send(ApiResponses.notFound('Subscription'));
			}
			return reply.status(400).send(ApiResponses.validationError(error instanceof Error ? error.message : 'Invalid payload'));
		}
	});
} 