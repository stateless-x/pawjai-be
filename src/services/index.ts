// === SERVICES INDEX ===
// Central export point for all services

export { breedService } from './breedService';
export { petService } from './petService';
export { userService } from './userService';

// Re-export pagination types for convenience
export type { PaginationOptions, PaginatedResponse } from '../utils';
export { 
  validatePaginationOptions, 
  calculatePaginationInfo, 
  createPaginatedResponse,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE 
} from '../utils';

// Re-export types from types folder
export type { BreedFilters, BreedWithDetails, BreedNameResponse } from '../types'; 