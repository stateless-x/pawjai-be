import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';

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

export type SupabaseJwtPayload = z.infer<typeof supabaseJwtSchema>;

let jwkSet: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwkSetExpiry: number | null = null;
const JWK_CACHE_DURATION = 24 * 60 * 60 * 1000; 

async function getJWKSet() {
  const now = Date.now();
  
  if (!jwkSet || !jwkSetExpiry || now > jwkSetExpiry) {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is not configured');
    }
    
    const jwksUrl = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
    jwkSet = createRemoteJWKSet(new URL(jwksUrl));
    jwkSetExpiry = now + JWK_CACHE_DURATION;
  }
  
  return jwkSet;
}

export function clearJWKCache() {
  jwkSet = null;
  jwkSetExpiry = null;
}

export async function verifySupabaseJWT(token: string): Promise<SupabaseJwtPayload> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not configured');
  }

  try {
    const jwks = await getJWKSet();
    const SUPABASE_JWT_ISSUER = `${supabaseUrl}/auth/v1`;
    const { payload } = await jwtVerify(token, jwks, { 
      issuer: SUPABASE_JWT_ISSUER 
    });
    const validatedPayload = supabaseJwtSchema.parse(payload);
    const now = Math.floor(Date.now() / 1000);
    if (validatedPayload.exp < now) {
      throw new Error('Token has expired');
    }

    return validatedPayload;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('JWT')) {
        throw new Error(`JWT verification failed: ${error.message}`);
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('Unable to fetch JWK set - network error');
      }
    }
    throw error;
  }
}

/**
 * Extract user information from a verified JWT payload
 * @param payload - The verified JWT payload
 * @returns User information object
 */
export function extractUserFromJWT(payload: SupabaseJwtPayload) {
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}

/**
 * Check if a token is expired without verifying it
 * @param token - The JWT token to check
 * @returns True if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    // Decode the token without verification (just to check expiration)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp < now;
  } catch {
    // If we can't decode the token, assume it's expired/invalid
    return true;
  }
} 