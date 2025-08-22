// === ENUM DEFINITIONS ===
// These enums are used throughout the application for type safety and consistency

export const GENDER_ENUM = ['male', 'female', 'other', 'unknown'] as const;
export type Gender = typeof GENDER_ENUM[number];

export const SPECIES_ENUM = ['dog', 'cat', 'other'] as const;
export type Species = typeof SPECIES_ENUM[number];

export const SIZE_ENUM = ['toy', 'small', 'medium', 'large', 'giant'] as const;
export type Size = typeof SIZE_ENUM[number];

export const ACTIVITY_LEVEL_ENUM = ['low', 'moderate', 'high'] as const;
export type ActivityLevel = typeof ACTIVITY_LEVEL_ENUM[number];

export const GROOMING_NEEDS_ENUM = ['low', 'moderate', 'high'] as const;
export type GroomingNeeds = typeof GROOMING_NEEDS_ENUM[number];

export const TRAINING_DIFFICULTY_ENUM = ['easy', 'moderate', 'hard'] as const;
export type TrainingDifficulty = typeof TRAINING_DIFFICULTY_ENUM[number];

// === PET RECORD ENUMS ===
export const RECORD_TYPE_ENUM = ['activity', 'symptom', 'vet_visit', 'medication'] as const;
export type RecordType = typeof RECORD_TYPE_ENUM[number];

export const VIBE_RATING_ENUM = [1, 2, 3, 4, 5] as const;
export type VibeRating = typeof VIBE_RATING_ENUM[number];

// === BREED DETAIL TYPES ===
// These help identify which detail table to use for each species
export const BREED_DETAIL_TYPES = {
  dog: 'dog_breed_details',
  cat: 'cat_breed_details'
} as const;
export type BreedDetailType = typeof BREED_DETAIL_TYPES[keyof typeof BREED_DETAIL_TYPES];

// === SPECIES-SPECIFIC FIELDS ===
// Fields that are specific to certain species
export const DOG_SPECIFIC_FIELDS = [
  'size',
  'weightMinKg', 
  'weightMaxKg',
  'activityLevel',
  'trainingDifficulty',
  'exerciseNeedsEn',
  'exerciseNeedsTh',
  'wellnessRoutineEn',
  'wellnessRoutineTh'
] as const;

export const CAT_SPECIFIC_FIELDS = [
  // Cats don't have size, weight, activity level, or training difficulty
  // They only have grooming needs, temperament, and feeding notes
] as const;

export const SHARED_BREED_FIELDS = [
  'species',
  'nameEn',
  'nameTh', 
  'descriptionEn',
  'descriptionTh',
  'imageUrl',
  'lifespanMinYears',
  'lifespanMaxYears',
  'originCountry'
] as const;

// === SUBSCRIPTION ENUMS ===
export const SUBSCRIPTION_PLAN_ENUM = ['free', 'premium'] as const;
export type SubscriptionPlan = typeof SUBSCRIPTION_PLAN_ENUM[number];

export const SUBSCRIPTION_STATUS_ENUM = ['active', 'canceled', 'past_due', 'incomplete'] as const;
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS_ENUM[number];

export const BILLING_CYCLE_ENUM = ['monthly', 'yearly'] as const;
export type BillingCycle = typeof BILLING_CYCLE_ENUM[number]; 