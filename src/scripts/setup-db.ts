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

    // Clean up old auth state tables (if they exist)
    console.log('🧹 Cleaning up old auth state tables...');
    await db.execute(sql`DROP TABLE IF EXISTS user_auth_states;`);
    await db.execute(sql`DROP TYPE IF EXISTS auth_step;`);

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
      CREATE TABLE IF NOT EXISTS user_personalization (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES user_profiles(id),
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
        user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
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
        user_id UUID REFERENCES user_profiles(id),
        breed_id UUID REFERENCES breeds(id),
        name TEXT NOT NULL,
        species species,
        birth_date DATE,
        weight_kg NUMERIC,
        gender gender,
        neutered BOOLEAN,
        notes TEXT,
        image_url TEXT,
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
      CREATE TABLE IF NOT EXISTS activity_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        species species,
        name_en TEXT NOT NULL,
        name_th TEXT NOT NULL,
        description_en TEXT,
        description_th TEXT,
        icon_url TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS symptom_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        species species,
        name_en TEXT NOT NULL,
        name_th TEXT NOT NULL,
        description_en TEXT,
        description_th TEXT,
        icon_url TEXT,
        severity TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vet_visit_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        species species,
        name_en TEXT NOT NULL,
        name_th TEXT NOT NULL,
        description_en TEXT,
        description_th TEXT,
        icon_url TEXT,
        is_routine BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS medication_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        species species,
        name_en TEXT NOT NULL,
        name_th TEXT NOT NULL,
        description_en TEXT,
        description_th TEXT,
        icon_url TEXT,
        category TEXT,
        requires_prescription BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pet_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pet_id UUID NOT NULL REFERENCES pets(id),
        record_type record_type NOT NULL,
        type_id UUID NOT NULL,
        note TEXT,
        vibe INTEGER,
        image_url TEXT[],
        metadata JSONB,
        occurred_at TIMESTAMP NOT NULL,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
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