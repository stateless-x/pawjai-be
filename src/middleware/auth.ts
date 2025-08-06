import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Supabase JWT payload structure
const supabaseJwtSchema = z.object({
  aud: z.string(),
  exp: z.number(),
  sub: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  app_metadata: z.object({
    provider: z.string().optional(),
    providers: z.array(z.string()).optional(),
  }).optional(),
  user_metadata: z.record(z.any()).optional(),
  role: z.string().optional(),
  aal: z.string().optional(),
  amr: z.array(z.object({
    method: z.string(),
    timestamp: z.number(),
  })).optional(),
  session_id: z.string().optional(),
});

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

    // Verify the JWT token using Supabase's public key
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Supabase configuration is missing',
      });
    }

    // For now, we'll use the anon key to verify tokens
    // In production, you might want to fetch the public key from Supabase
    const decoded = jwt.verify(token, supabaseAnonKey) as any;
    
    // Validate the JWT payload structure
    const validatedPayload = supabaseJwtSchema.parse(decoded);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (validatedPayload.exp < now) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Token has expired',
      });
    }

    // Attach user information to the request
    (request as AuthenticatedRequest).user = {
      id: validatedPayload.sub,
      email: validatedPayload.email,
      role: validatedPayload.role,
    };

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }
    
    if (error instanceof z.ZodError) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid token payload',
      });
    }

    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

// Middleware factory for routes that require authentication
export function requireAuth() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticateUser(request, reply);
  };
}

// Optional authentication middleware
export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return; // No auth header, continue without authentication
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return; // No token, continue without authentication
    }

    // Try to authenticate, but don't fail if it doesn't work
    await authenticateUser(request, reply);
  } catch (error) {
    // Silently continue without authentication
    return;
  }
} 