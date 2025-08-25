import { db } from '@/db';
import { pets, breeds, petRecords } from '@/db/schema';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';
import { speciesSchema, genderSchema, Species } from '@/constants';
import { PaginationOptions, PaginatedResponse, validatePaginationOptions, calculatePaginationInfo, calculateOffset } from '@/utils';
import { bunnyService } from '@/utils/bunny';

// Validation schemas
const createPetSchema = z.object({
  breedId: z.string().uuid().optional(),
  name: z.string().min(1),
  species: speciesSchema,
  dateOfBirth: z.string().optional(),
  weightKg: z.string().optional(),
  gender: genderSchema.optional(),
  neutered: z.boolean().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().url().or(z.literal('')).optional(),
});

const updatePetSchema = createPetSchema.partial().omit({ name: true });

// Onboarding pet schema (for compatibility with onboarding flow)
const onboardingPetSchema = z.object({
  petName: z.string().min(1, "Pet name is required"),
  petType: z.enum(["dog", "cat", "other"]),
  petBreed: z.string().optional(),
  breedId: z.string().uuid().optional(),
  petGender: z.enum(["male", "female", "unknown"]),
  neutered: z.enum(["yes", "no", "not_sure"]),
  petBirthDay: z.string().optional(),
  petBirthMonth: z.string().optional(),
  petBirthYear: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export class PetService {
  // Normal user methods
  async getMyPets(userId: string) {
    try {
      const userPets = await db
        .select({
          pet: {
            id: pets.id,
            userId: pets.userId,
            breedId: pets.breedId,
            name: pets.name,
            species: pets.species,
            dateOfBirth: pets.dateOfBirth,
            weightKg: pets.weightKg,
            gender: pets.gender,
            neutered: pets.neutered,
            notes: pets.notes,
            imageUrl: pets.imageUrl,
            createdAt: pets.createdAt,
            updatedAt: pets.updatedAt,
          },
          breedName: breeds.nameTh,
        })
        .from(pets)
        .leftJoin(breeds, eq(pets.breedId, breeds.id))
        .where(eq(pets.userId, userId));

      return userPets;
    } catch (error) {
      throw new Error(`Failed to get user pets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPetById(petId: string, userId?: string) {
    try {
      const pet = await db
        .select({
          pet: {
            id: pets.id,
            userId: pets.userId,
            breedId: pets.breedId,
            name: pets.name,
            species: pets.species,
            dateOfBirth: pets.dateOfBirth,
            weightKg: pets.weightKg,
            gender: pets.gender,
            neutered: pets.neutered,
            notes: pets.notes,
            imageUrl: pets.imageUrl,
            createdAt: pets.createdAt,
            updatedAt: pets.updatedAt,
          },
          breedName: breeds.nameTh,
        })
        .from(pets)
        .leftJoin(breeds, eq(pets.breedId, breeds.id))
        .where(eq(pets.id, petId))
        .limit(1);

      if (pet.length === 0) {
        throw new Error('Pet not found');
      }

      if (userId && pet[0].pet.userId !== userId) {
        throw new Error('Access denied: You can only access your own pets');
      }

      return pet[0];
    } catch (error) {
      throw new Error(`Failed to get pet by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createPet(userId: string, petData: z.infer<typeof createPetSchema>) {
    try {
      const validatedData = createPetSchema.parse(petData);

      if (validatedData.breedId) {
        const breedExists = await db
          .select({ id: breeds.id })
          .from(breeds)
          .where(eq(breeds.id, validatedData.breedId))
          .limit(1);
        if (breedExists.length === 0) {
          throw new Error(`Breed with ID ${validatedData.breedId} not found`);
        }
      }

      const newPet = await db
        .insert(pets)
        .values({
          userId,
          ...validatedData,
        })
        .returning();

      return newPet[0];
    } catch (error) {
      throw new Error(`Failed to create pet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Method to create pet from onboarding data (for compatibility)
  async createPetFromOnboarding(userId: string, petData: z.infer<typeof onboardingPetSchema>) {
    try {
      const validatedData = onboardingPetSchema.parse(petData);

      let dateOfBirth: string | undefined;
      if (validatedData.petBirthDay && validatedData.petBirthMonth && validatedData.petBirthYear) {
        dateOfBirth = `${validatedData.petBirthYear}-${validatedData.petBirthMonth}-${validatedData.petBirthDay}`;
      }

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
        breedId: validatedData.breedId,
        notes: validatedData.petBreed ? `Breed: ${validatedData.petBreed}` : undefined,
      };

      const newPet = await db
        .insert(pets)
        .values(petPayload)
        .returning();

      return newPet[0];
    } catch (error) {
      throw new Error(`Failed to create pet from onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updatePet(petId: string, userId: string, petData: z.infer<typeof updatePetSchema>) {
    try {
      const validatedData = updatePetSchema.parse(petData);

      const existingPet = await db
        .select()
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);

      if (existingPet.length === 0) {
        throw new Error('Pet not found');
      }

      if (existingPet[0].userId !== userId) {
        throw new Error('Access denied: You can only update your own pets');
      }

      const updatedPet = await db
        .update(pets)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(pets.id, petId))
        .returning();

      return updatedPet[0];
    } catch (error) {
      throw new Error(`Failed to update pet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updatePetProfileImage(petId: string, userId: string, imageUrl: string) {
    try {
      const [updatedPet] = await db
        .update(pets)
        .set({
          imageUrl,
          updatedAt: new Date(),
        })
        .where(and(eq(pets.id, petId), eq(pets.userId, userId)))
        .returning();
      
      if (!updatedPet) {
        throw new Error('Pet not found or user does not have permission');
      }

      return updatedPet;
    } catch (error) {
      throw new Error(`Failed to update pet profile image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deletePet(petId: string, userId: string) {
    try {
      const [existingPet] = await db
        .select()
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);

      if (!existingPet) {
        throw new Error('Pet not found');
      }

      if (existingPet.userId !== userId) {
        throw new Error('Access denied: You can only delete your own pets');
      }
      
      // Step 1: Delete associated pet records to satisfy foreign key constraints
      await db.delete(petRecords).where(eq(petRecords.petId, petId));

      // Step 2: If the pet has an image, try to delete it from Bunny.net
      if (existingPet.imageUrl) {
        try {
          const storagePath = bunnyService.getStoragePathFromUrl(existingPet.imageUrl);
          if (storagePath) {
            await bunnyService.delete(storagePath);
          }
        } catch (bunnyError) {
          // Log the error but don't block the pet deletion from the DB
          console.error(`Failed to delete image for pet ${petId} from Bunny.net, but proceeding with DB deletion.`, bunnyError);
        }
      }

      // Step 3: Delete the pet itself
      await db
        .delete(pets)
        .where(eq(pets.id, petId));

      return { message: 'Pet deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete pet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Admin methods
  async getUserPetsByAdmin(userId: string) {
    try {
      const userPets = await db
        .select({
          pet: pets,
          breedName: breeds.nameTh,
        })
        .from(pets)
        .leftJoin(breeds, eq(pets.breedId, breeds.id))
        .where(eq(pets.userId, userId));

      return userPets;
    } catch (error) {
      throw new Error(`Failed to get user pets by admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPetByIdByAdmin(petId: string) {
    try {
      const pet = await db
        .select({
          pet: pets,
          breedName: breeds.nameTh,
        })
        .from(pets)
        .leftJoin(breeds, eq(pets.breedId, breeds.id))
        .where(eq(pets.id, petId))
        .limit(1);

      if (pet.length === 0) {
        throw new Error('Pet not found');
      }

      return pet[0];
    } catch (error) {
      throw new Error(`Failed to get pet by ID by admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updatePetByAdmin(petId: string, petData: z.infer<typeof updatePetSchema>) {
    try {
      const validatedData = updatePetSchema.parse(petData);

      const updatedPet = await db
        .update(pets)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(pets.id, petId))
        .returning();

      if (updatedPet.length === 0) {
        throw new Error('Pet not found');
      }

      return updatedPet[0];
    } catch (error) {
      throw new Error(`Failed to update pet by admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deletePetByAdmin(petId: string) {
    try {
      const deletedPet = await db
        .delete(pets)
        .where(eq(pets.id, petId))
        .returning();

      if (deletedPet.length === 0) {
        throw new Error('Pet not found');
      }

      return { message: 'Pet deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete pet by admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllPets(options?: PaginationOptions): Promise<PaginatedResponse<any>> {
    try {
      const { page, limit, sortBy, sortOrder } = validatePaginationOptions(options || {});
      const offset = calculateOffset(page, limit);

      const [{ count: total }] = await db.select({ count: count() }).from(pets);

      const sortColumn = sortBy === 'name' ? pets.name : 
                        sortBy === 'species' ? pets.species : 
                        pets.createdAt;
      const sortDirection = sortOrder === 'asc' ? asc : desc;

      const allPets = await db
        .select({
          pet: pets,
          breedName: breeds.nameTh,
        })
        .from(pets)
        .leftJoin(breeds, eq(pets.breedId, breeds.id))
        .orderBy(sortDirection(sortColumn))
        .limit(limit)
        .offset(offset);

      return {
        data: allPets,
        pagination: calculatePaginationInfo(total, page, limit)
      };
    } catch (error) {
      throw new Error(`Failed to get all pets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPetsBySpecies(species: Species) {
    try {
      const petsBySpecies = await db
        .select({
          pet: pets,
          breedName: breeds.nameTh,
        })
        .from(pets)
        .leftJoin(breeds, eq(pets.breedId, breeds.id))
        .where(eq(pets.species, species));

      return petsBySpecies;
    } catch (error) {
      throw new Error(`Failed to get pets by species: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const petService = new PetService(); 