// === VALIDATION SCHEMAS ===
// Zod schemas for validation using the enum values

import { z } from 'zod';
import {
  GENDER_ENUM,
  SPECIES_ENUM,
  SIZE_ENUM,
  ACTIVITY_LEVEL_ENUM,
  GROOMING_NEEDS_ENUM,
  TRAINING_DIFFICULTY_ENUM
} from './enums';

export const genderSchema = z.enum(GENDER_ENUM);
export const speciesSchema = z.enum(SPECIES_ENUM);
export const sizeSchema = z.enum(SIZE_ENUM);
export const activityLevelSchema = z.enum(ACTIVITY_LEVEL_ENUM);
export const groomingNeedsSchema = z.enum(GROOMING_NEEDS_ENUM);
export const trainingDifficultySchema = z.enum(TRAINING_DIFFICULTY_ENUM);

// === BREED SCHEMAS ===
// Schemas for the new breed structure

export const baseBreedSchema = z.object({
  species: speciesSchema,
  nameEn: z.string().min(1),
  nameTh: z.string().min(1),
  descriptionEn: z.string().optional(),
  descriptionTh: z.string().optional(),
  imageUrl: z.array(z.string().url()).optional(),
  lifespanMinYears: z.number().positive().optional(),
  lifespanMaxYears: z.number().positive().optional(),
  originCountry: z.string().optional(),
});

export const dogBreedDetailSchema = z.object({
  size: sizeSchema.optional(),
  weightMinKg: z.string().optional(),
  weightMaxKg: z.string().optional(),
  activityLevel: activityLevelSchema.optional(),
  groomingNeeds: groomingNeedsSchema.optional(),
  trainingDifficulty: trainingDifficultySchema.optional(),
  temperamentEn: z.string().optional(),
  temperamentTh: z.string().optional(),
  feedingNotesEn: z.string().optional(),
  feedingNotesTh: z.string().optional(),
  exerciseNeedsEn: z.string().optional(),
  exerciseNeedsTh: z.string().optional(),
  wellnessRoutineEn: z.string().optional(),
  wellnessRoutineTh: z.string().optional(),
});

export const catBreedDetailSchema = z.object({
  groomingNeeds: groomingNeedsSchema.optional(),
  temperamentEn: z.string().optional(),
  temperamentTh: z.string().optional(),
  feedingNotesEn: z.string().optional(),
  feedingNotesTh: z.string().optional(),
});

export const breedWithDetailsSchema = z.object({
  breed: baseBreedSchema,
  dogDetails: dogBreedDetailSchema.optional(),
  catDetails: catBreedDetailSchema.optional(),
}); 