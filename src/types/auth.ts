import { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
} 