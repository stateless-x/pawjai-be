// === SEED INDEX ===
// Main orchestrator for all seeding operations

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { 
  userProfiles, 
  userPersonalization, 
  breeds, 
  pets,
  dogBreedDetails,
  catBreedDetails
} from '../db/schema';

export interface SeedOptions {
  clearExisting?: boolean;
  skipBreeds?: boolean;
  skipUsers?: boolean;
  skipPets?: boolean;
  skipSetup?: boolean;
}

// === FACTORY RESET FUNCTION ===
// Completely clears all data from all tables
export async function factoryReset() {
  console.log('🗑️ Starting factory reset - clearing all data...');
  
  try {
    // Check if tables exist and clear data in the correct order to respect foreign key constraints
    // 1. Clear pets first (depends on breeds and users)
    console.log('🐕 Clearing pets...');
    try {
      await db.delete(pets);
      console.log('✅ Pets cleared');
    } catch (error) {
      console.log('⚠️ Pets table does not exist or is empty');
    }
    
    // 2. Clear breed details (depends on breeds)
    console.log('📋 Clearing dog breed details...');
    try {
      await db.delete(dogBreedDetails);
      console.log('✅ Dog breed details cleared');
    } catch (error) {
      console.log('⚠️ Dog breed details table does not exist or is empty');
    }
    
    console.log('🐱 Clearing cat breed details...');
    try {
      await db.delete(catBreedDetails);
      console.log('✅ Cat breed details cleared');
    } catch (error) {
      console.log('⚠️ Cat breed details table does not exist or is empty');
    }
    
    // 3. Clear breeds
    console.log('🐕🐱 Clearing breeds...');
    try {
      await db.delete(breeds);
      console.log('✅ Breeds cleared');
    } catch (error) {
      console.log('⚠️ Breeds table does not exist or is empty');
    }
    
    // 4. Clear user personalization (depends on users)
    console.log('⚙️ Clearing user personalization...');
    try {
      await db.delete(userPersonalization);
      console.log('✅ User personalization cleared');
    } catch (error) {
      console.log('⚠️ User personalization table does not exist or is empty');
    }
    
    // 5. Clear user profiles
    console.log('👤 Clearing user profiles...');
    try {
      await db.delete(userProfiles);
      console.log('✅ User profiles cleared');
    } catch (error) {
      console.log('⚠️ User profiles table does not exist or is empty');
    }
    
    console.log('✅ Factory reset completed successfully!');
    console.log('📊 All data has been cleared from the database.');
    
  } catch (error) {
    console.error('❌ Factory reset failed:', error);
    throw error;
  }
}

// Database setup function to create tables if they don't exist
export async function setupDatabase() {
  console.log('🔧 Setting up database tables...');
  
  try {
    // Create enums first
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE gender AS ENUM ('male', 'female', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE species AS ENUM ('dog', 'cat');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE size AS ENUM ('toy', 'small', 'medium', 'large', 'giant');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE activity_level AS ENUM ('low', 'moderate', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE grooming_needs AS ENUM ('low', 'moderate', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE training_difficulty AS ENUM ('easy', 'moderate', 'hard');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        phone_number TEXT,
        birth_date DATE,
        gender gender,
        province TEXT,
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_personalization (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        house_type TEXT,
        home_environment TEXT[],
        pet_purpose TEXT[],
        monthly_budget TEXT,
        owner_lifestyle TEXT,
        owner_pet_experience TEXT,
        priority TEXT[],
        referral_source TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS breeds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        species species NOT NULL,
        name_en TEXT NOT NULL,
        name_th TEXT NOT NULL,
        description_en TEXT,
        description_th TEXT,
        image_url TEXT[],
        lifespan_min_years INTEGER,
        lifespan_max_years INTEGER,
        origin_country TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS dog_breed_details (
        breed_id UUID PRIMARY KEY REFERENCES breeds(id),
        size size,
        weight_min_kg NUMERIC,
        weight_max_kg NUMERIC,
        activity_level activity_level,
        grooming_needs grooming_needs,
        training_difficulty training_difficulty,
        temperament_en TEXT,
        temperament_th TEXT,
        feeding_notes_en TEXT,
        feeding_notes_th TEXT,
        exercise_needs_en TEXT,
        exercise_needs_th TEXT,
        wellness_routine_en TEXT,
        wellness_routine_th TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cat_breed_details (
        breed_id UUID PRIMARY KEY REFERENCES breeds(id),
        grooming_needs grooming_needs,
        temperament_en TEXT,
        temperament_th TEXT,
        feeding_notes_en TEXT,
        feeding_notes_th TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        breed_id UUID REFERENCES breeds(id),
        name TEXT NOT NULL,
        species species,
        date_of_birth DATE,
        weight_kg NUMERIC,
        gender gender,
        neutered BOOLEAN,
        notes TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  }
}

export async function runSeeds(options: SeedOptions = {}) {
  const {
    clearExisting = false,
    skipBreeds = false,
    skipUsers = false,
    skipPets = false,
    skipSetup = false
  } = options;

  console.log('🌱 Starting database seeding...');

  try {
    // Setup database tables if needed
    if (!skipSetup) {
      await setupDatabase();
    }

    // Import seed functions dynamically to avoid circular dependencies
    const { seedBreeds } = await import('./breeds');
    const { seedUserProfiles } = await import('./users');
    const { seedUserPersonalization } = await import('./userPersonalization');
    const { seedPets } = await import('./pets');

    // Seed breeds first (pets depend on breeds)
    if (!skipBreeds) {
      console.log('📝 Seeding breeds...');
      await seedBreeds({ clearExisting });
    }

    // Seed user profiles
    if (!skipUsers) {
      console.log('👤 Seeding user profiles...');
      await seedUserProfiles({ clearExisting });
      
      console.log('⚙️ Seeding user personalization...');
      await seedUserPersonalization({ clearExisting });
    }

    // Seed pets (depends on breeds and users)
    if (!skipPets) {
      console.log('🐕 Seeding pets...');
      await seedPets({ clearExisting });
    }

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Individual seed functions for selective seeding
export { seedBreeds } from './breeds';
export { seedUserProfiles } from './users';
export { seedUserPersonalization } from './userPersonalization';
export { seedPets } from './pets'; 