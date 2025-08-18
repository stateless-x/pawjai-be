import { db } from '../db';
import { userProfiles, userPersonalization, pets, userAuthStates } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { genderSchema, speciesSchema } from '../constants';

// Validation schemas
const createUserProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  birthDate: z.string().optional(),
  gender: genderSchema.optional(),
  province: z.string().optional(),
});

const createUserPersonalizationSchema = z.object({
  houseType: z.string().optional(),
  homeEnvironment: z.array(z.string()).optional(),
  petPurpose: z.array(z.string()).optional(),
  monthlyBudget: z.string().optional(),
  ownerLifestyle: z.string().optional(),
  ownerPetExperience: z.string().optional(),
  priority: z.array(z.string()).optional(),
  referralSource: z.string().optional(),
});

// Auth state schema (mirror client AuthState essentials)
const userAuthStateSchema = z.object({
  isAuthenticated: z.boolean().optional(),
  pendingEmailConfirmation: z.string().nullable().optional(),
  emailConfirmationSent: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
  currentAuthStep: z.enum(['idle','signing-up','signing-in','email-confirmation','onboarding','completed']).optional(),
});

// Onboarding schemas
const onboardingProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  ownerBirthDay: z.string().optional(),
  ownerBirthMonth: z.string().optional(),
  ownerBirthYear: z.string().optional(),
  ownerGender: z.string().optional(),
  ownerProvince: z.string().optional(),
  ownerAgreeTerms: z.boolean().default(false),
  marketingConsent: z.boolean().optional(),
});

const onboardingPetSchema = z.object({
  petName: z.string().min(1, "Pet name is required"),
  petType: z.enum(["dog", "cat", "other"]),
  petBreed: z.string().min(1, "Pet breed is required"),
  petGender: z.enum(["male", "female", "unknown"]),
  neutered: z.enum(["yes", "no", "not_sure"]),
  petBirthDay: z.string().optional(),
  petBirthMonth: z.string().optional(),
  petBirthYear: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

const completeOnboardingSchema = z.object({
  profile: onboardingProfileSchema,
  pet: onboardingPetSchema,
});

export class UserService {
  // Auth state persistence
  async getAuthState(userId: string) {
    const rows = await db.select().from(userAuthStates).where(eq(userAuthStates.userId, userId)).limit(1);
    return rows[0] || null;
  }

  async upsertAuthState(userId: string, state: z.infer<typeof userAuthStateSchema>) {
    const validated = userAuthStateSchema.parse(state);
    const existing = await db.select().from(userAuthStates).where(eq(userAuthStates.userId, userId)).limit(1);
    if (existing.length > 0) {
      const [updated] = await db
        .update(userAuthStates)
        .set({
          ...validated,
          updatedAt: new Date(),
        })
        .where(eq(userAuthStates.userId, userId))
        .returning();
      return updated;
    }
    const [inserted] = await db
      .insert(userAuthStates)
      .values({ userId, ...validated })
      .returning();
    return inserted;
  }

  // Normal user methods
  async getUserProfile(userId: string) {
    try {
      const profile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      if (profile.length === 0) {
        throw new Error('User profile not found');
      }

      return profile[0];
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createOrUpdateUserProfile(userId: string, profileData: z.infer<typeof createUserProfileSchema>) {
    try {
      const validatedData = createUserProfileSchema.parse(profileData);

      const existingProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      if (existingProfile.length > 0) {
        // Update existing profile
        const updatedProfile = await db
          .update(userProfiles)
          .set({
            ...validatedData,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.id, userId))
          .returning();

        return updatedProfile[0];
      } else {
        // Create new profile
        const newProfile = await db
          .insert(userProfiles)
          .values({
            id: userId,
            ...validatedData,
          })
          .returning();

        return newProfile[0];
      }
    } catch (error) {
      throw new Error(`Failed to create/update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserPersonalization(userId: string) {
    try {
      const personalization = await db
        .select()
        .from(userPersonalization)
        .where(eq(userPersonalization.userId, userId))
        .limit(1);

      if (personalization.length === 0) {
        throw new Error('User personalization not found');
      }

      return personalization[0];
    } catch (error) {
      throw new Error(`Failed to get user personalization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createOrUpdateUserPersonalization(userId: string, personalizationData: z.infer<typeof createUserPersonalizationSchema>) {
    try {
      const validatedData = createUserPersonalizationSchema.parse(personalizationData);

      const existingPersonalization = await db
        .select()
        .from(userPersonalization)
        .where(eq(userPersonalization.userId, userId))
        .limit(1);

      if (existingPersonalization.length > 0) {
        // Update existing personalization
        const updatedPersonalization = await db
          .update(userPersonalization)
          .set({
            ...validatedData,
            updatedAt: new Date(),
          })
          .where(eq(userPersonalization.userId, userId))
          .returning();

        return updatedPersonalization[0];
      } else {
        // Create new personalization
        const newPersonalization = await db
          .insert(userPersonalization)
          .values({
            userId,
            ...validatedData,
          })
          .returning();

        return newPersonalization[0];
      }
    } catch (error) {
      throw new Error(`Failed to create/update user personalization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Onboarding methods
  async saveOnboardingProfile(userId: string, profileData: z.infer<typeof onboardingProfileSchema>) {
    try {
      console.log('UserService: Saving onboarding profile for user:', userId);
      console.log('UserService: Profile data received:', profileData);
      
      const validatedData = onboardingProfileSchema.parse(profileData);
      console.log('UserService: Profile data validated:', validatedData);
      
      // Convert date parts to ISO date string
      let birthDate: string | undefined;
      if (validatedData.ownerBirthDay && validatedData.ownerBirthMonth && validatedData.ownerBirthYear) {
        birthDate = `${validatedData.ownerBirthYear}-${validatedData.ownerBirthMonth}-${validatedData.ownerBirthDay}`;
      }

      const profilePayload = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phoneNumber: validatedData.phoneNumber,
        birthDate,
        gender: validatedData.ownerGender as any,
        province: validatedData.ownerProvince,
      };
      
      console.log('UserService: Profile payload prepared:', profilePayload);

      const existingProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      console.log('UserService: Existing profile check:', existingProfile.length > 0 ? 'Found' : 'Not found');

      if (existingProfile.length > 0) {
        // Update existing profile
        console.log('UserService: Updating existing profile');
        const updatedProfile = await db
          .update(userProfiles)
          .set({
            ...profilePayload,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.id, userId))
          .returning();

        console.log('UserService: Profile updated:', updatedProfile[0]);
        return updatedProfile[0];
      } else {
        // Create new profile
        console.log('UserService: Creating new profile');
        const newProfile = await db
          .insert(userProfiles)
          .values({
            id: userId,
            ...profilePayload,
          })
          .returning();

        console.log('UserService: Profile created:', newProfile[0]);
        return newProfile[0];
      }
    } catch (error) {
      console.error('UserService: Error saving onboarding profile:', error);
      throw new Error(`Failed to save onboarding profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveOnboardingPet(userId: string, petData: z.infer<typeof onboardingPetSchema>) {
    try {
      console.log('UserService: Saving onboarding pet for user:', userId);
      console.log('UserService: Pet data received:', petData);
      
      const validatedData = onboardingPetSchema.parse(petData);
      console.log('UserService: Pet data validated:', validatedData);
      
      // Convert date parts to ISO date string
      let dateOfBirth: string | undefined;
      if (validatedData.petBirthDay && validatedData.petBirthMonth && validatedData.petBirthYear) {
        dateOfBirth = `${validatedData.petBirthYear}-${validatedData.petBirthMonth}-${validatedData.petBirthDay}`;
      }

      // Convert neutered status to boolean
      const neutered = validatedData.neutered === 'yes' ? true : 
                      validatedData.neutered === 'no' ? false : 
                      null;

      const petPayload = {
        userId,
        name: validatedData.petName,
        species: validatedData.petType as any,
        dateOfBirth,
        gender: validatedData.petGender as any,
        neutered,
        imageUrl: validatedData.avatarUrl,
        notes: `Breed: ${validatedData.petBreed}`,
      };
      
      console.log('UserService: Pet payload prepared:', petPayload);

      const newPet = await db
        .insert(pets)
        .values(petPayload)
        .returning();

      console.log('UserService: Pet created:', newPet[0]);
      return newPet[0];
    } catch (error) {
      console.error('UserService: Error saving onboarding pet:', error);
      throw new Error(`Failed to save onboarding pet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async completeOnboarding(userId: string, onboardingData: z.infer<typeof completeOnboardingSchema>) {
    try {
      const validatedData = completeOnboardingSchema.parse(onboardingData);
      
      console.log('UserService: Completing onboarding for user:', userId);
      console.log('UserService: Profile data:', validatedData.profile);
      console.log('UserService: Pet data:', validatedData.pet);
      
      // Save profile (will create or update)
      const profile = await this.saveOnboardingProfile(userId, validatedData.profile);
      console.log('UserService: Profile saved:', profile);
      
      // Save pet
      const pet = await this.saveOnboardingPet(userId, validatedData.pet);
      console.log('UserService: Pet saved:', pet);
      
      return {
        profile,
        pet,
        message: 'Onboarding completed successfully'
      };
    } catch (error) {
      console.error('UserService: Error completing onboarding:', error);
      throw new Error(`Failed to complete onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Admin methods
  async getUserProfileByAdmin(userId: string) {
    try {
      const profile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      if (profile.length === 0) {
        throw new Error('User profile not found');
      }

      return profile[0];
    } catch (error) {
      throw new Error(`Failed to get user profile by admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserPersonalizationByAdmin(userId: string) {
    try {
      const personalization = await db
        .select()
        .from(userPersonalization)
        .where(eq(userPersonalization.userId, userId))
        .limit(1);

      if (personalization.length === 0) {
        throw new Error('User personalization not found');
      }

      return personalization[0];
    } catch (error) {
      throw new Error(`Failed to get user personalization by admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const userService = new UserService(); 