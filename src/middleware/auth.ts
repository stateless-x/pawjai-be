import { FastifyRequest, FastifyReply } from 'fastify';
import { verifySupabaseJWT, extractUserFromJWT } from '../utils/jwt';

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email?: string;
    role?: string;
  };
}

export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    console.log('Auth: Starting authentication process');
    
    const authHeader = request.headers.authorization;
    console.log('Auth: Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      console.log('Auth: No authorization header found');
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authorization header is required',
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Auth: Token extracted, length:', token.length);
    console.log('Auth: Token starts with:', token.substring(0, 20) + '...');
    console.log('Auth: Token ends with:', '...' + token.substring(token.length - 20));
    console.log('Auth: Full token:', token);
    
    if (!token) {
      console.log('Auth: Empty token after Bearer removal');
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Bearer token is required',
      });
    }
    
    console.log('Auth: About to verify JWT token');
    const payload = await verifySupabaseJWT(token);
    console.log('Auth: JWT verification successful, payload sub:', payload.sub);
    
    const user = extractUserFromJWT(payload);
    console.log('Auth: User extracted:', user);
    
    (request as AuthenticatedRequest).user = user;
    console.log('Auth: Authentication completed successfully');

  } catch (error) {
    console.error('Auth: Authentication error:', error);
    console.error('Auth: Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Auth: Error message:', error instanceof Error ? error.message : 'No message');
    console.error('Auth: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error) {
      if (error.message.includes('JWT') || error.message.includes('token') || error.message.includes('expired')) {
        console.log('Auth: JWT/token related error, returning 401');
        return reply.status(401).send({
          error: 'Unauthorized',
          message: error.message,
        });
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        console.log('Auth: Network error, returning 500');
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Unable to verify token - authentication service unavailable',
        });
      }
    }

    console.log('Auth: Generic error, returning 500');
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
    if (!authHeader) {
      return;
    }
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return;
    }
    await authenticateUser(request, reply);
  } catch (error) {
    return;
  }
} 