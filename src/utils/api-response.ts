// === API RESPONSE UTILITIES ===
// Centralized response format utilities for consistent API responses

// === RESPONSE TYPES ===
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    timestamp: string;
    version?: string;
    requestId?: string;
  };
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorApiResponse extends ApiResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// === SUCCESS RESPONSE HELPERS ===
export function createSuccessResponse<T>(
  data: T, 
  message?: string, 
  meta?: Partial<ApiResponse['meta']>
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

export function createPaginatedSuccessResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  },
  message?: string,
  meta?: Partial<ApiResponse['meta']>
): PaginatedApiResponse<T> {
  return {
    success: true,
    data,
    pagination,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

// === ERROR RESPONSE HELPERS ===
export function createErrorResponse(
  error: string,
  code?: string,
  details?: any,
  meta?: Partial<ApiResponse['meta']>
): ErrorApiResponse {
  return {
    success: false,
    error,
    code,
    details,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

export function createNotFoundResponse(
  resource: string,
  identifier?: string,
  meta?: Partial<ApiResponse['meta']>
): ErrorApiResponse {
  const message = identifier 
    ? `${resource} with identifier '${identifier}' not found`
    : `${resource} not found`;
  
  return createErrorResponse(message, 'NOT_FOUND', { resource, identifier }, meta);
}

export function createValidationErrorResponse(
  errors: any,
  meta?: Partial<ApiResponse['meta']>
): ErrorApiResponse {
  return createErrorResponse(
    'Validation failed',
    'VALIDATION_ERROR',
    { errors },
    meta
  );
}

export function createUnauthorizedResponse(
  message: string = 'Unauthorized access',
  meta?: Partial<ApiResponse['meta']>
): ErrorApiResponse {
  return createErrorResponse(message, 'UNAUTHORIZED', undefined, meta);
}

export function createForbiddenResponse(
  message: string = 'Access forbidden',
  meta?: Partial<ApiResponse['meta']>
): ErrorApiResponse {
  return createErrorResponse(message, 'FORBIDDEN', undefined, meta);
}

export function createInternalServerErrorResponse(
  message: string = 'Internal server error',
  meta?: Partial<ApiResponse['meta']>
): ErrorApiResponse {
  return createErrorResponse(message, 'INTERNAL_SERVER_ERROR', undefined, meta);
}

export function createBadRequestResponse(
  message: string = 'Bad request',
  meta?: Partial<ApiResponse['meta']>
): ErrorApiResponse {
  return createErrorResponse(message, 'BAD_REQUEST', undefined, meta);
}

// === HTTP STATUS HELPERS ===
export function createHttpResponse<T>(
  statusCode: number,
  data?: T,
  message?: string,
  meta?: Partial<ApiResponse['meta']>
): { statusCode: number; response: ApiResponse<T> } {
  const isSuccess = statusCode >= 200 && statusCode < 300;
  
  if (isSuccess) {
    return {
      statusCode,
      response: createSuccessResponse(data!, message, meta)
    };
  } else {
    return {
      statusCode,
      response: createErrorResponse(message || 'Request failed', undefined, undefined, meta)
    };
  }
}

// === COMMON RESPONSE PATTERNS ===
export const ApiResponses = {
  // Success responses
  success: <T>(data: T, message?: string) => createSuccessResponse(data, message),
  created: <T>(data: T, message?: string) => createSuccessResponse(data, message || 'Resource created successfully'),
  updated: <T>(data: T, message?: string) => createSuccessResponse(data, message || 'Resource updated successfully'),
  deleted: (message?: string) => createSuccessResponse(null, message || 'Resource deleted successfully'),
  
  // Paginated responses
  paginated: <T>(data: T[], pagination: any, message?: string) => 
    createPaginatedSuccessResponse(data, pagination, message),
  
  // Error responses
  notFound: (resource: string, identifier?: string) => createNotFoundResponse(resource, identifier),
  validationError: (errors: any) => createValidationErrorResponse(errors),
  unauthorized: (message?: string) => createUnauthorizedResponse(message),
  forbidden: (message?: string) => createForbiddenResponse(message),
  internalError: (message?: string) => createInternalServerErrorResponse(message),
  badRequest: (message?: string) => createBadRequestResponse(message),
  gone: (message?: string) => createGoneResponse(message),
  
  // Generic error
  error: (message: string, code?: string, details?: any) => createErrorResponse(message, code, details)
};

export function createGoneResponse(
  message: string = 'This resource is no longer available',
  meta?: Partial<ApiResponse['meta']>
): ErrorApiResponse {
  return createErrorResponse(message, 'GONE', undefined, meta);
}

// === RESPONSE CODES ===
export const ResponseCodes = {
  SUCCESS: 'SUCCESS',
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  CONFLICT: 'CONFLICT'
} as const; 