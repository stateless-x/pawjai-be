import { db } from '../db';
import { pets, breeds } from '../db/schema';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';
import { speciesSchema, genderSchema, Species } from '../constants';
import { PaginationOptions, PaginatedResponse, validatePaginationOptions, calculatePaginationInfo, calculateOffset } from '../utils';

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
  imageUrl: z.string().url().optional(),
});

const updatePetSchema = createPetSchema.partial().omit({ name: true });

export class PetService {
  // Normal user methods
  async getMyPets(userId: string) {
    try {
      const userPets = await db
        .select({
          pet: pets,
          breed: breeds,
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
          pet: pets,
          breed: breeds,
        })
        .from(pets)
        .leftJoin(breeds, eq(pets.breedId, breeds.id))
        .where(eq(pets.id, petId))
        .limit(1);

      if (pet.length === 0) {
        throw new Error('Pet not found');
      }

      // If userId is provided, check if the user owns this pet
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

  async updatePet(petId: string, userId: string, petData: z.infer<typeof updatePetSchema>) {
    try {
      const validatedData = updatePetSchema.parse(petData);

      // First check if the pet exists and belongs to the user
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

  async deletePet(petId: string, userId: string) {
    try {
      // First check if the pet exists and belongs to the user
      const existingPet = await db
        .select()
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);

      if (existingPet.length === 0) {
        throw new Error('Pet not found');
      }

      if (existingPet[0].userId !== userId) {
        throw new Error('Access denied: You can only delete your own pets');
      }

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
          breed: breeds,
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
          breed: breeds,
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

      // Get total count
      const [{ count: total }] = await db.select({ count: count() }).from(pets);

      // Get paginated data
      const sortColumn = sortBy === 'name' ? pets.name : 
                        sortBy === 'species' ? pets.species : 
                        pets.createdAt;
      const sortDirection = sortOrder === 'asc' ? asc : desc;

      const allPets = await db
        .select({
          pet: pets,
          breed: breeds,
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
          breed: breeds,
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