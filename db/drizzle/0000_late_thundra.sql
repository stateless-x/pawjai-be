DO $$ BEGIN
 CREATE TYPE "activity_level" AS ENUM('low', 'moderate', 'high');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "auth_step" AS ENUM('idle', 'signing-up', 'signing-in', 'email-confirmation', 'onboarding', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "billing_cycle" AS ENUM('monthly', 'yearly');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "gender" AS ENUM('male', 'female', 'other', 'unknown');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "grooming_needs" AS ENUM('low', 'moderate', 'high');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "record_type" AS ENUM('activity', 'symptom', 'vet_visit', 'medication');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "size" AS ENUM('toy', 'small', 'medium', 'large', 'giant');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "species" AS ENUM('dog', 'cat', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "subscription_plan" AS ENUM('free', 'premium');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "subscription_status" AS ENUM('active', 'canceled', 'past_due', 'incomplete');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "training_difficulty" AS ENUM('easy', 'moderate', 'hard');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"species" "species",
	"name_en" text NOT NULL,
	"name_th" text NOT NULL,
	"description_en" text,
	"description_th" text,
	"icon_url" text,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "breeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"species" "species" NOT NULL,
	"name_en" text NOT NULL,
	"name_th" text NOT NULL,
	"description_en" text,
	"description_th" text,
	"image_url" text[],
	"lifespan_min_years" integer,
	"lifespan_max_years" integer,
	"origin_country" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cat_breed_details" (
	"breed_id" uuid PRIMARY KEY NOT NULL,
	"grooming_needs" "grooming_needs",
	"temperament_en" text,
	"temperament_th" text,
	"feeding_notes_en" text,
	"feeding_notes_th" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dog_breed_details" (
	"breed_id" uuid PRIMARY KEY NOT NULL,
	"size" "size",
	"weight_min_kg" numeric,
	"weight_max_kg" numeric,
	"activity_level" "activity_level",
	"grooming_needs" "grooming_needs",
	"training_difficulty" "training_difficulty",
	"temperament_en" text,
	"temperament_th" text,
	"feeding_notes_en" text,
	"feeding_notes_th" text,
	"exercise_needs_en" text,
	"exercise_needs_th" text,
	"wellness_routine_en" text,
	"wellness_routine_th" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "medication_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"species" "species",
	"name_en" text NOT NULL,
	"name_th" text NOT NULL,
	"description_en" text,
	"description_th" text,
	"icon_url" text,
	"category" text,
	"requires_prescription" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pet_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"record_type" "record_type" NOT NULL,
	"type_id" uuid NOT NULL,
	"note" text,
	"vibe" integer,
	"image_url" text[],
	"metadata" jsonb,
	"occurred_at" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"breed_id" uuid,
	"name" text NOT NULL,
	"species" "species",
	"date_of_birth" date,
	"weight_kg" numeric,
	"gender" "gender",
	"neutered" boolean,
	"notes" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "symptom_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"species" "species",
	"name_en" text NOT NULL,
	"name_th" text NOT NULL,
	"description_en" text,
	"description_th" text,
	"icon_url" text,
	"severity" text,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_auth_states" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"is_authenticated" boolean DEFAULT false,
	"pending_email_confirmation" text,
	"email_confirmation_sent" boolean DEFAULT false,
	"onboarding_completed" boolean DEFAULT false,
	"current_auth_step" "auth_step",
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_personalization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"house_type" text,
	"home_environment" text[],
	"pet_purpose" text[],
	"monthly_budget" text,
	"owner_lifestyle" text,
	"owner_pet_experience" text,
	"priority" text[],
	"referral_source" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone_number" text NOT NULL,
	"phone_number_verified" boolean DEFAULT false NOT NULL,
	"country_code" text DEFAULT '+66',
	"birth_date" date,
	"gender" "gender",
	"country" text DEFAULT 'Thailand',
	"profile_image" text,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"marketing_consent_at" timestamp,
	"tos_consent" boolean DEFAULT false NOT NULL,
	"tos_consent_at" timestamp,
	"tos_version" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_profiles_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_subscriptions" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"plan" "subscription_plan" DEFAULT 'free',
	"status" "subscription_status" DEFAULT 'active',
	"billing_cycle" "billing_cycle" DEFAULT 'monthly',
	"price_cents" integer DEFAULT 0,
	"currency" text DEFAULT 'THB',
	"trial_ends_at" timestamp,
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vet_visit_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"species" "species",
	"name_en" text NOT NULL,
	"name_th" text NOT NULL,
	"description_en" text,
	"description_th" text,
	"icon_url" text,
	"is_routine" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_records_pet_id_record_type_created_at_idx" ON "pet_records" ("pet_id","record_type","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_records_pet_id_occurred_at_idx" ON "pet_records" ("pet_id","occurred_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pet_records_record_type_type_id_idx" ON "pet_records" ("record_type","type_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cat_breed_details" ADD CONSTRAINT "cat_breed_details_breed_id_breeds_id_fk" FOREIGN KEY ("breed_id") REFERENCES "breeds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dog_breed_details" ADD CONSTRAINT "dog_breed_details_breed_id_breeds_id_fk" FOREIGN KEY ("breed_id") REFERENCES "breeds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pet_records" ADD CONSTRAINT "pet_records_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pets" ADD CONSTRAINT "pets_breed_id_breeds_id_fk" FOREIGN KEY ("breed_id") REFERENCES "breeds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
