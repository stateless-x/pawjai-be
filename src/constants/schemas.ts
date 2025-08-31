// === VALIDATION SCHEMAS ===
// Zod schemas for validation using the enum values

import { z } from 'zod';
import {
  GENDER_ENUM,
  SPECIES_ENUM,
  SIZE_ENUM,
  ACTIVITY_LEVEL_ENUM,
  GROOMING_NEEDS_ENUM,
  TRAINING_DIFFICULTY_ENUM,
  RECORD_TYPE_ENUM,
  VIBE_RATING_ENUM,
  SUBSCRIPTION_PLAN_ENUM,
  SUBSCRIPTION_STATUS_ENUM,
  BILLING_CYCLE_ENUM,
  LOOKUP_TYPE_ENUM,
  LOOKUP_TYPE_SORT_BY_ENUM,
  SORT_ORDER_ENUM,
  SYMPTOM_SEVERITY_ENUM,
  MEDICATION_CATEGORY_ENUM
} from './enums';

export const genderSchema = z.enum(GENDER_ENUM);
export const speciesSchema = z.enum(SPECIES_ENUM);
export const sizeSchema = z.enum(SIZE_ENUM);
export const activityLevelSchema = z.enum(ACTIVITY_LEVEL_ENUM);
export const groomingNeedsSchema = z.enum(GROOMING_NEEDS_ENUM);
export const trainingDifficultySchema = z.enum(TRAINING_DIFFICULTY_ENUM);

// Pet Records
export const recordTypeSchema = z.enum(RECORD_TYPE_ENUM);
export const vibeRatingSchema = z.number().int().min(1).max(5);

// Subscriptions
export const subscriptionPlanSchema = z.enum(SUBSCRIPTION_PLAN_ENUM);
export const subscriptionStatusSchema = z.enum(SUBSCRIPTION_STATUS_ENUM);
export const billingCycleSchema = z.enum(BILLING_CYCLE_ENUM);

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

// === PET RECORD SCHEMAS ===
export const createPetRecordSchema = z.object({
  recordType: recordTypeSchema,
  typeId: z.string().uuid(),
  note: z.string().optional(),
  vibe: vibeRatingSchema.optional(),
  imageUrl: z.array(z.string().url()).optional(),
  metadata: z.record(z.any()).optional(),
  occurredAt: z.string().datetime().optional(),
});

export const updatePetRecordSchema = z.object({
  note: z.string().optional(),
  vibe: vibeRatingSchema.optional(),
  imageUrl: z.array(z.string().url()).optional(),
  metadata: z.record(z.any()).optional(),
  occurredAt: z.string().datetime().optional(),
});

export const petRecordQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  kind: recordTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

// === LOOKUP TYPE SCHEMAS ===
export const createLookupTypeSchema = z.object({
  species: speciesSchema.optional(),
  nameEn: z.string().min(1),
  nameTh: z.string().min(1),
  descriptionEn: z.string().optional(),
  descriptionTh: z.string().optional(),
  iconUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateLookupTypeSchema = createLookupTypeSchema.partial();

// === LOOKUP TYPE QUERY PARAMETERS ===
export const lookupTypeQueryParamsSchema = z.object({
  species: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
  sortBy: z.enum(LOOKUP_TYPE_SORT_BY_ENUM).optional(),
  sortOrder: z.enum(SORT_ORDER_ENUM).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
  category: z.enum(MEDICATION_CATEGORY_ENUM).optional(),
  severity: z.enum(SYMPTOM_SEVERITY_ENUM).optional(),
  isRoutine: z.string().transform(val => val === 'true').optional(),
  requiresPrescription: z.string().transform(val => val === 'true').optional(),
});

// === LOOKUP TYPE PARAMETER SCHEMAS ===
export const lookupTypeParamSchema = z.enum(LOOKUP_TYPE_ENUM);
export const lookupTypeIdParamSchema = z.string().uuid();

// === SUBSCRIPTION SCHEMAS ===
export const subscriptionCreateSchema = z.object({
  plan: subscriptionPlanSchema.default('free'),
  status: subscriptionStatusSchema.default('active'),
  cycle: z.object({
    type: billingCycleSchema.default('monthly'),
    priceCents: z.number().int().nonnegative().default(0),
    currency: z.string().default('THB'),
  }).default({ type: 'monthly', priceCents: 0, currency: 'THB' }),
  trialEndsAt: z.string().datetime().optional(),
  currentPeriodEnd: z.string().datetime().optional(),
});

export const subscriptionUpdateSchema = subscriptionCreateSchema.partial();

export const onboardingProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  phoneNumber: z.string(),
  phoneNumberVerified: z.boolean().optional(),
  countryCode: z.string().optional(),
  ownerBirthDay: z.string().optional(),
  ownerBirthMonth: z.string().optional(),
  ownerBirthYear: z.string().optional(),
  ownerGender: z.string().optional(),
  ownerAgreeTerms: z.boolean(),
  marketingConsent: z.boolean().optional(),
  tosConsent: z.boolean().optional(),
  tosVersion: z.string().optional(),
});

// General pet schema for onboarding flows (flexible)
export const onboardingPetSchema = z.object({
	petName: z.string().min(1, "Pet name is required"),
	petType: z.enum(["dog", "cat", "other"]),
	petBreed: z.string().optional(),
	breedId: z.string().uuid().optional(),
	petGender: z.enum(["male", "female", "unknown"]),
	neutered: z.enum(["yes", "no", "not_sure"]),
	// Accept either birthDate or separate components
	birthDate: z.string().optional(),
	day: z.string().optional(),
	month: z.string().optional(),
	year: z.string().optional(),
	avatarUrl: z.string().url().optional(),
});

// Strict pet schema (e.g., when requiring a text breed name)
export const onboardingPetSchemaStrict = onboardingPetSchema.extend({
	petBreed: z.string().min(1, "Pet breed is required"),
});

export const completeOnboardingSchemaStrict = z.object({
	profile: onboardingProfileSchema,
	pet: onboardingPetSchemaStrict,
});

// === PET SCHEMAS ===
export const createPetSchema = z.object({
  breedId: z.string().uuid().optional(),
  name: z.string().min(1),
  species: speciesSchema,
  // Accept either birthDate (YYYY-MM-DD) or separate day/month/year
  birthDate: z.string().optional(),
  day: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
  gender: genderSchema.optional(),
  neutered: z.boolean().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().url().or(z.literal('')).optional(),
});

export const updatePetSchema = createPetSchema.partial();


// === USER SCHEMAS ===
export const createUserProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  phoneNumber: z.string(),
  phoneNumberVerified: z.boolean().optional(),
  countryCode: z.string().default('+66'),
  birthDate: z.string().optional(),
  gender: genderSchema.optional(),
  country: z.string().default('Thailand'),
  profileImage: z.string().url().or(z.literal('')).or(z.null()).optional(),
  marketingConsent: z.boolean().optional(),
  marketingConsentAt: z.string().datetime().optional(),
  tosConsent: z.boolean().optional(),
  tosConsentAt: z.string().datetime().optional(),
  tosVersion: z.string().optional(),
});

export const createUserPersonalizationSchema = z.object({
  houseType: z.string().optional(),
  homeEnvironment: z.array(z.string()).optional(),
  petPurpose: z.array(z.string()).optional(),
  monthlyBudget: z.string().optional(),
  ownerLifestyle: z.string().optional(),
  ownerPetExperience: z.string().optional(),
  priority: z.array(z.string()).optional(),
  referralSource: z.string().optional(),
});

export const userAuthStateSchema = z.object({
  isAuthenticated: z.boolean().optional(),
  pendingEmailConfirmation: z.string().nullable().optional(),
  emailConfirmationSent: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
  currentAuthStep: z.enum(['idle','signing-up','signing-in','email-confirmation','onboarding','completed']).optional(),
}); 