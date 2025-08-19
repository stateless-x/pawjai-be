import { FastifyRequest, FastifyReply } from 'fastify';
import { verifySupabaseJWT, extractUserFromJWT } from '@/utils/jwt';
import { AuthenticatedRequest } from '@/types';

export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authorization header is required',
      });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Bearer token is required',
      });
    }

    const payload = await verifySupabaseJWT(token);
    const user = extractUserFromJWT(payload);

    (request as AuthenticatedRequest).user = user;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('JWT') || error.message.includes('token') || error.message.includes('expired')) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: error.message,
        });
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Unable to verify token - authentication service unavailable',
        });
      }
    }

    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

export function requireAuth() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticateUser(request, reply);
  };
}

export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return;
    const token = authHeader.replace('Bearer ', '');
    if (!token) return;
    await authenticateUser(request, reply);
  } catch {
    return;
  }
} 