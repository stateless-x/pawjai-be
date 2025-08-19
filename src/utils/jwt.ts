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
      console.error('JWK: SUPABASE_URL is not configured');
      throw new Error('SUPABASE_URL is not configured');
    }
    const jwksUrl = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
    try {
      jwkSet = createRemoteJWKSet(new URL(jwksUrl));
      jwkSetExpiry = now + JWK_CACHE_DURATION;
    } catch (error) {
      console.error('JWK: Error creating JWK set:', error);
      throw error;
    }
  }
  
  return jwkSet;
}

export function clearJWKCache() {
  jwkSet = null;
  jwkSetExpiry = null;
}

function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT: Error decoding JWT:', error);
    throw new Error('Invalid JWT format');
  }
}

export async function verifySupabaseJWT(token: string): Promise<SupabaseJwtPayload> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('JWT: SUPABASE_URL is not configured');
    throw new Error('SUPABASE_URL is not configured');
  }

  try {
    const decodedPayload = decodeJWT(token);
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp < now) {
      console.error('JWT: Token has expired');
      throw new Error('Token has expired');
    }
    const validatedPayload = supabaseJwtSchema.parse(decodedPayload);
    return validatedPayload;
  } catch (error) {
    console.error('JWT: Error during verification:', error);
    console.error('JWT: Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('JWT: Error message:', error instanceof Error ? error.message : 'No message');
    
    if (error instanceof Error) {
      if (error.message.includes('JWT')) {
        console.error('JWT: JWT verification failed');
        throw new Error(`JWT verification failed: ${error.message}`);
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        console.error('JWT: Network error during JWK fetch');
        throw new Error('Unable to fetch JWK set - network error');
      }
    }
    throw error;
  }
}

export function extractUserFromJWT(payload: SupabaseJwtPayload) {
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}

export function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp < now;
  } catch {
    return true;
  }
} 