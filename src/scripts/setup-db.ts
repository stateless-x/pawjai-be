import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🚀 Setting up database for Railway deployment...');
  
  try {
    // Create the postgres client
    const client = postgres(connectionString!, { max: 1 });
    
    // Create the drizzle database instance
    const db = drizzle(client);
    
    // Create enums first
    console.log('📋 Creating enums...');
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'unknown');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE species AS ENUM ('dog', 'cat', 'other');
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

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE auth_step AS ENUM ('idle', 'signing-up', 'signing-in', 'email-confirmation', 'onboarding', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE record_type AS ENUM ('activity', 'symptom', 'vet_visit', 'medication');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE subscription_plan AS ENUM ('free', 'premium');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create tables with IF NOT EXISTS
    console.log('📋 Creating tables...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        phone_number TEXT UNIQUE,
        phone_number_verified BOOLEAN NOT NULL DEFAULT false,
        country_code TEXT DEFAULT '+66',
        birth_date DATE,
        gender gender,
        country TEXT DEFAULT 'Thailand',
        profile_image TEXT,
        marketing_consent BOOLEAN NOT NULL DEFAULT false,
        marketing_consent_at TIMESTAMP,
        tos_consent BOOLEAN NOT NULL DEFAULT false,
        tos_consent_at TIMESTAMP,
        tos_version TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_auth_states (
        user_id UUID PRIMARY KEY,
        is_authenticated BOOLEAN DEFAULT false,
        pending_email_confirmation TEXT,
        email_confirmation_sent BOOLEAN DEFAULT false,
        onboarding_completed BOOLEAN DEFAULT false,
        current_auth_step auth_step,
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
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        user_id UUID PRIMARY KEY,
        plan subscription_plan DEFAULT 'free',
        status subscription_status DEFAULT 'active',
        billing_cycle billing_cycle DEFAULT 'monthly',
        price_cents INTEGER DEFAULT 0,
        currency TEXT DEFAULT 'THB',
        trial_ends_at TIMESTAMP,
        current_period_end TIMESTAMP,
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
      CREATE TABLE IF NOT EXISTS pets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        breed_id UUID,
        name TEXT NOT NULL,
        species species NOT NULL,
        gender gender,
        birth_date DATE,
        weight_kg NUMERIC(5,2),
        size size,
        activity_level activity_level,
        grooming_needs grooming_needs,
        training_difficulty training_difficulty,
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS dog_breed_details (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        breed_id UUID NOT NULL,
        energy_level INTEGER,
        exercise_needs INTEGER,
        playfulness INTEGER,
        affection_level INTEGER,
        trainability INTEGER,
        watchdog_ability INTEGER,
        adaptability INTEGER,
        good_with_children INTEGER,
        good_with_other_dogs INTEGER,
        good_with_strangers INTEGER,
        grooming_requirements INTEGER,
        shedding_level INTEGER,
        barking_level INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cat_breed_details (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        breed_id UUID NOT NULL,
        energy_level INTEGER,
        playfulness INTEGER,
        affection_level INTEGER,
        vocalization INTEGER,
        intelligence INTEGER,
        independence INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name_en TEXT NOT NULL,
        name_th TEXT NOT NULL,
        description_en TEXT,
        description_th TEXT,
        category TEXT,
        duration_minutes INTEGER,
        calories_burned_per_hour INTEGER,
        difficulty_level INTEGER,
        equipment_needed TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS symptom_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name_en TEXT NOT NULL,
        name_th TEXT NOT NULL,
        description_en TEXT,
        description_th TEXT,
        category TEXT,
        severity_level INTEGER,
        common_causes TEXT[],
        recommended_actions TEXT[],
        when_to_see_vet TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vet_visit_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name_en TEXT NOT NULL,
        name_th TEXT NOT NULL,
        description_en TEXT,
        description_th TEXT,
        category TEXT,
        typical_duration_minutes INTEGER,
        cost_range_min INTEGER,
        cost_range_max INTEGER,
        frequency_recommendation TEXT,
        preparation_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS medication_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name_en TEXT NOT NULL,
        name_th TEXT NOT NULL,
        description_en TEXT,
        description_th TEXT,
        category TEXT,
        dosage_form TEXT,
        typical_dosage TEXT,
        frequency TEXT,
        duration TEXT,
        side_effects TEXT[],
        contraindications TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pet_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pet_id UUID NOT NULL,
        record_type record_type NOT NULL,
        type_id UUID,
        title TEXT,
        description TEXT,
        occurred_at TIMESTAMP NOT NULL,
        duration_minutes INTEGER,
        cost_cents INTEGER,
        location TEXT,
        notes TEXT,
        attachments JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    console.log('📋 Creating indexes...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS pet_records_pet_id_record_type_created_at_idx 
      ON pet_records(pet_id, record_type, created_at);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS pet_records_pet_id_occurred_at_idx 
      ON pet_records(pet_id, occurred_at);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS pet_records_record_type_type_id_idx 
      ON pet_records(record_type, type_id);
    `);

    console.log('✅ Database setup completed successfully!');
    
    // Close the connection
    await client.end();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase(); 