import { pgTable, uuid, text, timestamp, date, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { 
  GENDER_ENUM, 
  SPECIES_ENUM, 
  SIZE_ENUM, 
  ACTIVITY_LEVEL_ENUM, 
  GROOMING_NEEDS_ENUM, 
  TRAINING_DIFFICULTY_ENUM 
} from '../constants';

// === ENUMS ===
export const genderEnum = pgEnum('gender', GENDER_ENUM);
export const speciesEnum = pgEnum('species', SPECIES_ENUM);
export const sizeEnum = pgEnum('size', SIZE_ENUM);
export const activityLevelEnum = pgEnum('activity_level', ACTIVITY_LEVEL_ENUM);
export const groomingNeedsEnum = pgEnum('grooming_needs', GROOMING_NEEDS_ENUM);
export const trainingDifficultyEnum = pgEnum('training_difficulty', TRAINING_DIFFICULTY_ENUM);

// === USER PROFILES (Identity) ===
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(), // Matches auth.users.id
  firstName: text('first_name'),
  lastName: text('last_name'),
  phoneNumber: text('phone_number'),
  birthDate: date('birth_date'),
  gender: genderEnum('gender'),
  province: text('province'),
  profileImage: text('profile_image'),
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
  dateOfBirth: date('date_of_birth'),
  weightKg: numeric('weight_kg'),
  gender: genderEnum('gender'),
  neutered: boolean('neutered'),
  notes: text('notes'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === TYPES ===
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type UserPersonalization = typeof userPersonalization.$inferSelect;
export type NewUserPersonalization = typeof userPersonalization.$inferInsert;

export type Breed = typeof breeds.$inferSelect;
export type NewBreed = typeof breeds.$inferInsert;

export type DogBreedDetail = typeof dogBreedDetails.$inferSelect;
export type NewDogBreedDetail = typeof dogBreedDetails.$inferInsert;

export type CatBreedDetail = typeof catBreedDetails.$inferSelect;
export type NewCatBreedDetail = typeof catBreedDetails.$inferInsert;

export type Pet = typeof pets.$inferSelect;
export type NewPet = typeof pets.$inferInsert;