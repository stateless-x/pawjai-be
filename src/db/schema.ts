import { pgTable, uuid, text, timestamp, date, numeric, integer, boolean, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import { 
  GENDER_ENUM, 
  SPECIES_ENUM, 
  SIZE_ENUM, 
  ACTIVITY_LEVEL_ENUM, 
  GROOMING_NEEDS_ENUM, 
  TRAINING_DIFFICULTY_ENUM,
  RECORD_TYPE_ENUM
} from '../constants';

// === ENUMS ===
export const genderEnum = pgEnum('gender', GENDER_ENUM);
export const speciesEnum = pgEnum('species', SPECIES_ENUM);
export const sizeEnum = pgEnum('size', SIZE_ENUM);
export const activityLevelEnum = pgEnum('activity_level', ACTIVITY_LEVEL_ENUM);
export const groomingNeedsEnum = pgEnum('grooming_needs', GROOMING_NEEDS_ENUM);
export const trainingDifficultyEnum = pgEnum('training_difficulty', TRAINING_DIFFICULTY_ENUM);
export const authStepEnum = pgEnum('auth_step', ['idle','signing-up','signing-in','email-confirmation','onboarding','completed']);
export const recordTypeEnum = pgEnum('record_type', RECORD_TYPE_ENUM);

// === USER PROFILES (Identity) ===
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(), // Matches auth.users.id
  firstName: text('first_name'),
  lastName: text('last_name'),
  phoneNumber: text('phone_number').notNull().unique(),
  phoneNumberVerified: boolean('phone_number_verified').notNull().default(false),
  countryCode: text('country_code').default('+66'),
  birthDate: date('birth_date'),
  gender: genderEnum('gender'),
  country: text('country').default('Thailand'),
  profileImage: text('profile_image'),
  marketingConsent: boolean('marketing_consent').notNull().default(false),
  marketingConsentAt: timestamp('marketing_consent_at'),
  tosConsent: boolean('tos_consent').notNull().default(false),
  tosConsentAt: timestamp('tos_consent_at'),
  tosVersion: text('tos_version'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === USER AUTH STATE (Store pawjai-auth-storage server-side) ===
export const userAuthStates = pgTable('user_auth_states', {
  userId: uuid('user_id').primaryKey(),
  isAuthenticated: boolean('is_authenticated').default(false),
  pendingEmailConfirmation: text('pending_email_confirmation'),
  emailConfirmationSent: boolean('email_confirmation_sent').default(false),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  currentAuthStep: authStepEnum('current_auth_step'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === USER PERSONALIZATION (Context / AI Parameters) ===
export const userPersonalization = pgTable('user_personalization', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'), // References auth.users.id
  houseType: text('house_type'),
  homeEnvironment: text('home_environment').array(),
  petPurpose: text('pet_purpose').array(),
  monthlyBudget: text('monthly_budget'),
  ownerLifestyle: text('owner_lifestyle'),
  ownerPetExperience: text('owner_pet_experience'),
  priority: text('priority').array(),
  referralSource: text('referral_source'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === SUBSCRIPTIONS (1:1 with user profile) ===
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['free','premium']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active','canceled','past_due','incomplete']);
export const billingCycleEnum = pgEnum('billing_cycle', ['monthly','yearly']);

export const userSubscriptions = pgTable('user_subscriptions', {
  userId: uuid('user_id').primaryKey().references(() => userProfiles.id),
  plan: subscriptionPlanEnum('plan').default('free'),
  status: subscriptionStatusEnum('status').default('active'),
  billingCycle: billingCycleEnum('billing_cycle').default('monthly'),
  priceCents: integer('price_cents').default(0),
  currency: text('currency').default('THB'),
  trialEndsAt: timestamp('trial_ends_at'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const breeds = pgTable('breeds', {
  id: uuid('id').primaryKey().defaultRandom(),
  species: speciesEnum('species').notNull(),
  nameEn: text('name_en').notNull(),
  nameTh: text('name_th').notNull(),
  descriptionEn: text('description_en'),
  descriptionTh: text('description_th'),
  imageUrl: text('image_url').array(),
  lifespanMinYears: integer('lifespan_min_years'),
  lifespanMaxYears: integer('lifespan_max_years'),
  originCountry: text('origin_country'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === DOG BREED DETAILS ===
export const dogBreedDetails = pgTable('dog_breed_details', {
  breedId: uuid('breed_id').primaryKey().references(() => breeds.id),
  size: sizeEnum('size'),
  weightMinKg: numeric('weight_min_kg'),
  weightMaxKg: numeric('weight_max_kg'),
  activityLevel: activityLevelEnum('activity_level'),
  groomingNeeds: groomingNeedsEnum('grooming_needs'),
  trainingDifficulty: trainingDifficultyEnum('training_difficulty'),
  temperamentEn: text('temperament_en'),
  temperamentTh: text('temperament_th'),
  feedingNotesEn: text('feeding_notes_en'),
  feedingNotesTh: text('feeding_notes_th'),
  exerciseNeedsEn: text('exercise_needs_en'),
  exerciseNeedsTh: text('exercise_needs_th'),
  wellnessRoutineEn: text('wellness_routine_en'),
  wellnessRoutineTh: text('wellness_routine_th'),
});

// === CAT BREED DETAILS ===
export const catBreedDetails = pgTable('cat_breed_details', {
  breedId: uuid('breed_id').primaryKey().references(() => breeds.id),
  groomingNeeds: groomingNeedsEnum('grooming_needs'),
  temperamentEn: text('temperament_en'),
  temperamentTh: text('temperament_th'),
  feedingNotesEn: text('feeding_notes_en'),
  feedingNotesTh: text('feeding_notes_th'),
});

// === PETS ===
export const pets = pgTable('pets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  breedId: uuid('breed_id').references(() => breeds.id),
  name: text('name').notNull(),
  species: speciesEnum('species'),
  dateOfBirth: date('birth_date'), // Updated to match the migration
  gender: genderEnum('gender'),
  neutered: boolean('neutered'),
  notes: text('notes'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === LOOKUP TABLES FOR PET RECORDS ===
export const activityTypes = pgTable('activity_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  species: speciesEnum('species'),
  nameEn: text('name_en').notNull(),
  nameTh: text('name_th').notNull(),
  descriptionEn: text('description_en'),
  descriptionTh: text('description_th'),
  iconUrl: text('icon_url'),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const symptomTypes = pgTable('symptom_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  species: speciesEnum('species'),
  nameEn: text('name_en').notNull(),
  nameTh: text('name_th').notNull(),
  descriptionEn: text('description_en'),
  descriptionTh: text('description_th'),
  iconUrl: text('icon_url'),
  severity: text('severity'), // mild, moderate, severe, emergency
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const vetVisitTypes = pgTable('vet_visit_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  species: speciesEnum('species'),
  nameEn: text('name_en').notNull(),
  nameTh: text('name_th').notNull(),
  descriptionEn: text('description_en'),
  descriptionTh: text('description_th'),
  iconUrl: text('icon_url'),
  isRoutine: boolean('is_routine').default(false),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const medicationTypes = pgTable('medication_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  species: speciesEnum('species'),
  nameEn: text('name_en').notNull(),
  nameTh: text('name_th').notNull(),
  descriptionEn: text('description_en'),
  descriptionTh: text('description_th'),
  iconUrl: text('icon_url'),
  category: text('category'), // preventive, treatment, supplement
  requiresPrescription: boolean('requires_prescription').default(false),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === PET RECORDS ===
export const petRecords = pgTable('pet_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  petId: uuid('pet_id').notNull().references(() => pets.id),
  recordType: recordTypeEnum('record_type').notNull(),
  typeId: uuid('type_id').notNull(), // References activity_types, symptom_types, etc.
  note: text('note'),
  vibe: integer('vibe'), // 1-5 rating
  imageUrl: text('image_url').array(),
  metadata: jsonb('metadata'), // Flexible JSON storage for type-specific data
  occurredAt: timestamp('occurred_at').notNull(),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Indices for performance
  petIdRecordTypeCreatedAtIdx: index('pet_records_pet_id_record_type_created_at_idx')
    .on(table.petId, table.recordType, table.createdAt),
  petIdOccurredAtIdx: index('pet_records_pet_id_occurred_at_idx')
    .on(table.petId, table.occurredAt),
  recordTypeTypeIdIdx: index('pet_records_record_type_type_id_idx')
    .on(table.recordType, table.typeId),
}));

// === TYPES ===
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type UserPersonalization = typeof userPersonalization.$inferSelect;
export type NewUserPersonalization = typeof userPersonalization.$inferInsert;
export type UserAuthState = typeof userAuthStates.$inferSelect;
export type NewUserAuthState = typeof userAuthStates.$inferInsert;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;

export type Breed = typeof breeds.$inferSelect;
export type NewBreed = typeof breeds.$inferInsert;

export type DogBreedDetail = typeof dogBreedDetails.$inferSelect;
export type NewDogBreedDetail = typeof dogBreedDetails.$inferInsert;

export type CatBreedDetail = typeof catBreedDetails.$inferSelect;
export type NewCatBreedDetail = typeof catBreedDetails.$inferInsert;

export type Pet = typeof pets.$inferSelect;
export type NewPet = typeof pets.$inferInsert;

// Pet Record Types
export type ActivityType = typeof activityTypes.$inferSelect;
export type NewActivityType = typeof activityTypes.$inferInsert;

export type SymptomType = typeof symptomTypes.$inferSelect;
export type NewSymptomType = typeof symptomTypes.$inferInsert;

export type VetVisitType = typeof vetVisitTypes.$inferSelect;
export type NewVetVisitType = typeof vetVisitTypes.$inferInsert;

export type MedicationType = typeof medicationTypes.$inferSelect;
export type NewMedicationType = typeof medicationTypes.$inferInsert;

export type PetRecord = typeof petRecords.$inferSelect;
export type NewPetRecord = typeof petRecords.$inferInsert;