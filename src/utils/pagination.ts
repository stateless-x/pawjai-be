// === PAGINATION UTILITIES ===
// Shared pagination types and utilities for all services

// === PAGINATION TYPES ===
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// === PAGINATION CONSTANTS ===
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// === PAGINATION UTILITIES ===
export function validatePaginationOptions(options: PaginationOptions = {}): Required<PaginationOptions> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, options.limit || DEFAULT_PAGE_SIZE));
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
}

export function calculatePaginationInfo(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
}

export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

// === PAGINATION HELPERS ===
export function createPaginatedResponse<T>(
  data: T[], 
  total: number, 
  page: number, 
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: calculatePaginationInfo(total, page, limit)
  };
}

// === VALIDATION HELPERS ===
export function isValidPage(page: number): boolean {
  return page > 0 && Number.isInteger(page);
}

export function isValidLimit(limit: number): boolean {
  return limit > 0 && limit <= MAX_PAGE_SIZE && Number.isInteger(limit);
}

export function sanitizePaginationOptions(options: PaginationOptions): Required<PaginationOptions> {
  return validatePaginationOptions(options);
} 