import { db } from '@/db';
import { userProfiles, userPersonalization, pets, userAuthStates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { genderSchema, speciesSchema, onboardingProfileSchema, onboardingPetSchemaStrict, completeOnboardingSchemaStrict } from '@/constants';
import { toIsoDateOrUndefined } from '@/utils/date';
import { subscriptionService } from '@/services/subscriptionService';

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

const userAuthStateSchema = z.object({
  isAuthenticated: z.boolean().optional(),
  pendingEmailConfirmation: z.string().nullable().optional(),
  emailConfirmationSent: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
  currentAuthStep: z.enum(['idle','signing-up','signing-in','email-confirmation','onboarding','completed']).optional(),
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
        return null; // Return null instead of throwing error
      }

      return profile[0];
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async ensureUserProfile(userId: string) {
    try {
      const existingProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      if (existingProfile.length > 0) {
        return existingProfile[0];
      }

      // Create a minimal default profile
      const [newProfile] = await db
        .insert(userProfiles)
        .values({
          id: userId,
          firstName: '',
          lastName: '',
          phoneNumber: '',
        })
        .returning();

      return newProfile;
    } catch (error) {
      throw new Error(`Failed to ensure user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        const updatedProfile = await db
          .update(userProfiles)
          .set({
            ...validatedData,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.id, userId))
          .returning();

        await subscriptionService.ensure(userId);
        return updatedProfile[0];
      } else {
        const newProfile = await db
          .insert(userProfiles)
          .values({
            id: userId,
            ...validatedData,
          })
          .returning();

        await subscriptionService.ensure(userId);
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
      const validatedData = onboardingProfileSchema.parse(profileData);

      // Validate gender value
      if (validatedData.ownerGender && !['male', 'female', 'other', 'unknown'].includes(validatedData.ownerGender)) {
        throw new Error(`Invalid gender value: ${validatedData.ownerGender}`);
      }

      const birthDate = toIsoDateOrUndefined(
        validatedData.ownerBirthYear,
        validatedData.ownerBirthMonth,
        validatedData.ownerBirthDay,
      );

      const profilePayload = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phoneNumber: validatedData.phoneNumber,
        birthDate,
        gender: validatedData.ownerGender as 'male' | 'female' | 'other' | 'unknown',
        province: validatedData.ownerProvince,
        marketingConsent: validatedData.marketingConsent || false,
        marketingConsentAt: validatedData.marketingConsent ? new Date() : null,
        tosConsent: validatedData.ownerAgreeTerms || false,
        tosConsentAt: validatedData.ownerAgreeTerms ? new Date() : null,
        tosVersion: validatedData.tosVersion || '1.0',
      };

      console.log('Profile payload:', profilePayload);

      console.log('Checking for existing profile for user:', userId);
      const existingProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);
      console.log('Existing profile found:', existingProfile.length > 0);

      if (existingProfile.length > 0) {
        console.log('Updating existing profile...');
        const updatedProfile = await db
          .update(userProfiles)
          .set({
            ...profilePayload,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.id, userId))
          .returning();
        console.log('Profile updated successfully');

        try {
          await subscriptionService.ensure(userId);
        } catch (subscriptionError) {
          console.error('Subscription service error:', subscriptionError);
          // Don't fail the profile creation if subscription fails
        }
        return updatedProfile[0];
      } else {
        console.log('Creating new profile...');
        const newProfile = await db
          .insert(userProfiles)
          .values({
            id: userId,
            ...profilePayload,
          })
          .returning();
        console.log('Profile created successfully');

        try {
          await subscriptionService.ensure(userId);
        } catch (subscriptionError) {
          console.error('Subscription service error:', subscriptionError);
          // Don't fail the profile creation if subscription fails
        }
        return newProfile[0];
      }
    } catch (error) {
      console.error('Error in saveOnboardingProfile:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      throw new Error(`Failed to save onboarding profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveOnboardingPet(userId: string, petData: z.infer<typeof onboardingPetSchemaStrict>) {
    try {
      const validatedData = onboardingPetSchemaStrict.parse(petData);

      const dateOfBirth = toIsoDateOrUndefined(
        validatedData.petBirthYear,
        validatedData.petBirthMonth,
        validatedData.petBirthDay,
      );

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

      const newPet = await db
        .insert(pets)
        .values(petPayload)
        .returning();

      return newPet[0];
    } catch (error) {
      throw new Error(`Failed to save onboarding pet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async completeOnboarding(userId: string, onboardingData: z.infer<typeof completeOnboardingSchemaStrict>) {
    try {
      const validatedData = completeOnboardingSchemaStrict.parse(onboardingData);

      const profile = await this.saveOnboardingProfile(userId, validatedData.profile);
      const pet = await this.saveOnboardingPet(userId, validatedData.pet);

      return {
        profile,
        pet,
        message: 'Onboarding completed successfully'
      };
    } catch (error) {
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