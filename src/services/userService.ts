import { db } from '@/db';
import { userProfiles, userPersonalization, pets, userAuthStates } from '@/db/schema';
import { eq, ne, and } from 'drizzle-orm';
import { z } from 'zod';
import { 
  genderSchema, 
  onboardingProfileSchema, 
  onboardingPetSchemaStrict, 
  completeOnboardingSchemaStrict,
  createUserProfileSchema,
  createUserPersonalizationSchema,
  userAuthStateSchema
} from '@/constants';
import { toIsoDateOrUndefined } from '@/utils/date';
import { subscriptionService } from '@/services/subscriptionService';

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

  async updateUserProfileImage(userId: string, imageUrl: string) {
    try {
      const [updatedProfile] = await db
        .update(userProfiles)
        .set({
          profileImage: imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.id, userId))
        .returning();
      
      if (!updatedProfile) {
        throw new Error('User profile not found');
      }

      return updatedProfile;
    } catch (error) {
      throw new Error(`Failed to update user profile image: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            country: validatedData.country || 'Thailand',
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

  // Check if phone number is already in use by another user
  async isPhoneNumberInUse(phoneNumber: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query;
      if (excludeUserId) {
        query = db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(and(
            eq(userProfiles.phoneNumber, phoneNumber),
            ne(userProfiles.id, excludeUserId)
          ));
      } else {
        query = db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.phoneNumber, phoneNumber));
      }
      
      const result = await query.limit(1);
      return result.length > 0;
    } catch (error) {
      throw new Error(`Failed to check phone number availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        phoneNumberVerified: validatedData.phoneNumberVerified || false,
        countryCode: validatedData.countryCode || '+66',
        birthDate,
        gender: validatedData.ownerGender as 'male' | 'female' | 'other' | 'unknown',
        marketingConsent: validatedData.marketingConsent || false,
        marketingConsentAt: validatedData.marketingConsent ? new Date() : null,
        tosConsent: validatedData.ownerAgreeTerms || false,
        tosConsentAt: validatedData.ownerAgreeTerms ? new Date() : null,
        tosVersion: validatedData.tosVersion || '1.0',
      };

      // Check if phone number is already used by another user
      const existingPhoneUser = await db
        .select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.phoneNumber, validatedData.phoneNumber))
        .limit(1);

      if (existingPhoneUser.length > 0 && existingPhoneUser[0].id !== userId) {
        throw new Error(`Phone number ${validatedData.phoneNumber} is already registered by another user`);
      }

      // Check for existing profile for current user
      const existingProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      let savedProfile;
      if (existingProfile.length > 0) {
        // Update existing profile
        [savedProfile] = await db
          .update(userProfiles)
          .set({
            ...profilePayload,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.id, userId))
          .returning();
      } else {
        // Create new profile
        [savedProfile] = await db
          .insert(userProfiles)
          .values({
            id: userId,
            ...profilePayload,
          })
          .returning();
      }

      await this.upsertAuthState(userId, { currentAuthStep: 'onboarding' });
      
      try {
        await subscriptionService.ensure(userId);
      } catch (subscriptionError) {
        // Don't fail the entire operation if subscription creation fails
      }

      return savedProfile;
    } catch (error) {
      // Handle specific database constraint violations
      if (error instanceof Error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          throw new Error('Phone number is already registered by another user');
        }
        if (error.message.includes('violates not-null constraint')) {
          throw new Error('Required fields are missing');
        }
        if (error.message.includes('violates check constraint')) {
          throw new Error('Invalid data provided');
        }
        if (error.message.includes('connection')) {
          throw new Error('Database connection error');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Database operation timed out');
        }
        if (error.message.includes('foreign key')) {
          throw new Error('Database constraint violation');
        }
      }
      
      // Re-throw the original error if it's not a constraint violation
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