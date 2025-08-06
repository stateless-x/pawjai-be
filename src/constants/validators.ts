// === VALIDATION HELPER FUNCTIONS ===
// Utility functions for working with enums

import {
  GENDER_ENUM,
  SPECIES_ENUM,
  SIZE_ENUM,
  ACTIVITY_LEVEL_ENUM,
  GROOMING_NEEDS_ENUM,
  TRAINING_DIFFICULTY_ENUM,
  Gender,
  Species,
  Size,
  ActivityLevel,
  GroomingNeeds,
  TrainingDifficulty,
  BREED_DETAIL_TYPES,
  BreedDetailType,
  DOG_SPECIFIC_FIELDS,
  CAT_SPECIFIC_FIELDS,
  SHARED_BREED_FIELDS
} from './enums';

export const isValidGender = (value: string): value is Gender => {
  return GENDER_ENUM.includes(value as Gender);
};

export const isValidSpecies = (value: string): value is Species => {
  return SPECIES_ENUM.includes(value as Species);
};

export const isValidSize = (value: string): value is Size => {
  return SIZE_ENUM.includes(value as Size);
};

export const isValidActivityLevel = (value: string): value is ActivityLevel => {
  return ACTIVITY_LEVEL_ENUM.includes(value as ActivityLevel);
};

export const isValidGroomingNeeds = (value: string): value is GroomingNeeds => {
  return GROOMING_NEEDS_ENUM.includes(value as GroomingNeeds);
};

export const isValidTrainingDifficulty = (value: string): value is TrainingDifficulty => {
  return TRAINING_DIFFICULTY_ENUM.includes(value as TrainingDifficulty);
};

// === BREED-SPECIFIC VALIDATORS ===
// Utility functions for working with breed details

export const isDogBreed = (species: string): species is 'dog' => {
  return species === 'dog';
};

export const isCatBreed = (species: string): species is 'cat' => {
  return species === 'cat';
};

export const getBreedDetailTable = (species: Species): BreedDetailType => {
  return BREED_DETAIL_TYPES[species];
};

export const hasDogSpecificFields = (species: Species): boolean => {
  return isDogBreed(species);
};

export const hasCatSpecificFields = (species: Species): boolean => {
  return isCatBreed(species);
};

// === FIELD VALIDATION HELPERS ===
// Check if a field is valid for a specific species

export const isValidFieldForSpecies = (field: string, species: Species): boolean => {
  if (isDogBreed(species)) {
    return [...SHARED_BREED_FIELDS, ...DOG_SPECIFIC_FIELDS].includes(field as any);
  }
  if (isCatBreed(species)) {
    return [...SHARED_BREED_FIELDS, ...CAT_SPECIFIC_FIELDS].includes(field as any);
  }
  return SHARED_BREED_FIELDS.includes(field as any);
}; 