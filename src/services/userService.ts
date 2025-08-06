import { db } from '../db';
import { userProfiles, userPersonalization } from '../db/schema';
import { eq, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';
import { genderSchema } from '../constants';
import { PaginationOptions, PaginatedResponse, validatePaginationOptions, calculatePaginationInfo, calculateOffset } from '../utils';

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

export class UserService {
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

  async getAllUserProfiles(options?: PaginationOptions): Promise<PaginatedResponse<any>> {
    try {
      const { page, limit, sortBy, sortOrder } = validatePaginationOptions(options || {});
      const offset = calculateOffset(page, limit);

      // Get total count
      const [{ count: total }] = await db.select({ count: count() }).from(userProfiles);

      // Get paginated data
      const sortColumn = sortBy === 'firstName' ? userProfiles.firstName : 
                        sortBy === 'lastName' ? userProfiles.lastName : 
                        userProfiles.createdAt;
      const sortDirection = sortOrder === 'asc' ? asc : desc;

      const profiles = await db
        .select()
        .from(userProfiles)
        .orderBy(sortDirection(sortColumn))
        .limit(limit)
        .offset(offset);

      return {
        data: profiles,
        pagination: calculatePaginationInfo(total, page, limit)
      };
    } catch (error) {
      throw new Error(`Failed to get all user profiles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllUserPersonalizations(options?: PaginationOptions): Promise<PaginatedResponse<any>> {
    try {
      const { page, limit, sortBy, sortOrder } = validatePaginationOptions(options || {});
      const offset = calculateOffset(page, limit);

      // Get total count
      const [{ count: total }] = await db.select({ count: count() }).from(userPersonalization);

      // Get paginated data
      const sortColumn = sortBy === 'userId' ? userPersonalization.userId : 
                        userPersonalization.createdAt;
      const sortDirection = sortOrder === 'asc' ? asc : desc;

      const personalizations = await db
        .select()
        .from(userPersonalization)
        .orderBy(sortDirection(sortColumn))
        .limit(limit)
        .offset(offset);

      return {
        data: personalizations,
        pagination: calculatePaginationInfo(total, page, limit)
      };
    } catch (error) {
      throw new Error(`Failed to get all user personalizations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const userService = new UserService(); 