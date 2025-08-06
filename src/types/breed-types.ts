// === BREED TYPES ===
// Centralized breed-related types and interfaces

import { type Breed, type DogBreedDetail, type CatBreedDetail } from '../db/schema';
import { type PaginationOptions } from '../utils';
import { SPECIES_ENUM, SIZE_ENUM, ACTIVITY_LEVEL_ENUM, GROOMING_NEEDS_ENUM, TRAINING_DIFFICULTY_ENUM } from '../constants';

// === BREED FILTERS ===
export interface BreedFilters extends PaginationOptions {
  species?: typeof SPECIES_ENUM[number];
  search?: string;
  size?: typeof SIZE_ENUM[number];
  activityLevel?: typeof ACTIVITY_LEVEL_ENUM[number];
  groomingNeeds?: typeof GROOMING_NEEDS_ENUM[number];
  trainingDifficulty?: typeof TRAINING_DIFFICULTY_ENUM[number];
}

// === BREED RESPONSE TYPES ===
export interface BreedWithDetails {
  breed: Breed;
  detail: DogBreedDetail | CatBreedDetail | null;
}

export interface BreedNameResponse {
  nameEn: string;
  nameTh: string;
}

// === BREED SERVICE TYPES ===
export interface CreateBreedData {
  breed: Partial<Breed>;
  detail?: Partial<DogBreedDetail | CatBreedDetail>;
}

export interface UpdateBreedData {
  breed?: Partial<Breed>;
  detail?: Partial<DogBreedDetail | CatBreedDetail>;
}

// === BREED API TYPES ===
export interface BreedApiResponse {
  success: boolean;
  data: BreedWithDetails;
  message?: string;
  meta?: {
    timestamp: string;
  };
}

export interface BreedListApiResponse {
  success: boolean;
  data: BreedWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  meta?: {
    timestamp: string;
  };
}

export interface BreedNamesApiResponse {
  success: boolean;
  data: BreedNameResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  meta?: {
    timestamp: string;
  };
} 