import { db } from '@/db';
import { pets, breeds, petRecords } from '@/db/schema';
import { eq, ilike, and, sql, desc, or, asc, count } from 'drizzle-orm';
import { z } from 'zod';
import { bunnyService } from '@/utils/bunny';
import { toIsoDateOrUndefined } from '@/utils/date';
import { 
  speciesSchema, 
  genderSchema,
  createPetSchema,
  updatePetSchema,
  onboardingPetSchema,
  Species
} from '@/constants';
import { PaginationOptions, PaginatedResponse, validatePaginationOptions, calculatePaginationInfo, calculateOffset } from '@/utils';

export class PetService {
  // Helper method to get complete pet data with breed name
  private async getCompletePetData(petId: string) {
    const completePet = await db
      .select({
        pet: {
          id: pets.id,
          userId: pets.userId,
          breedId: pets.breedId,
          name: pets.name,
          species: pets.species,
          dateOfBirth: pets.dateOfBirth,
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

    return completePet[0];
  }

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
      const pet = await this.getCompletePetData(petId);

      if (!pet) {
        throw new Error('Pet not found');
      }

      if (userId && pet.pet.userId !== userId) {
        throw new Error('Access denied: You can only access your own pets');
      }

      return pet;
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

      // Convert separate day/month/year to dateOfBirth if provided
      let dateOfBirth: string | undefined;
      if (validatedData.day && validatedData.month && validatedData.year) {
        // Ensure proper date formatting (YYYY-MM-DD)
        const year = parseInt(validatedData.year);
        const month = parseInt(validatedData.month);
        const day = parseInt(validatedData.day);
        
        // Validate date components
        if (year < 1900 || year > new Date().getFullYear() + 1) {
          throw new Error('Invalid year');
        }
        if (month < 1 || month > 12) {
          throw new Error('Invalid month');
        }
        if (day < 1 || day > 31) {
          throw new Error('Invalid day');
        }
        
        // Create date string in YYYY-MM-DD format
        dateOfBirth = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      } else if (validatedData.birthDate) {
        // If birthDate is already provided, use it
        dateOfBirth = validatedData.birthDate;
      }

      // Prepare the data for database insertion, mapping fields correctly
      const petInsertData = {
        userId,
        breedId: validatedData.breedId || null,
        name: validatedData.name,
        species: validatedData.species,
        dateOfBirth: dateOfBirth || null, // This maps to date_of_birth column
        gender: validatedData.gender || null,
        neutered: validatedData.neutered || null,
        notes: validatedData.notes || null,
        imageUrl: validatedData.imageUrl || null,
      };

      const newPet = await db
        .insert(pets)
        .values(petInsertData)
        .returning();

      // Get the complete pet data with breed name and flatten the structure
      const completePetData = await this.getCompletePetData(newPet[0].id);
      
      // Flatten the structure to match frontend expectations
      return {
        id: completePetData.pet.id,
        userId: completePetData.pet.userId,
        breedId: completePetData.pet.breedId,
        name: completePetData.pet.name,
        species: completePetData.pet.species,
        dateOfBirth: completePetData.pet.dateOfBirth,
        gender: completePetData.pet.gender,
        neutered: completePetData.pet.neutered,
        notes: completePetData.pet.notes,
        imageUrl: completePetData.pet.imageUrl,
        createdAt: completePetData.pet.createdAt,
        updatedAt: completePetData.pet.updatedAt,
        breedName: completePetData.breedName
      };
    } catch (error) {
      throw new Error(`Failed to create pet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Method to create pet from onboarding data (for compatibility)
  async createPetFromOnboarding(userId: string, petData: z.infer<typeof onboardingPetSchema>) {
    try {
      const validatedData = onboardingPetSchema.parse(petData);

      const dateOfBirth = toIsoDateOrUndefined(
        validatedData.day,
        validatedData.month,
        validatedData.year,
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
        breedId: validatedData.breedId,
        notes: validatedData.petBreed ? `Breed: ${validatedData.petBreed}` : undefined,
      };

      const [newPet] = await db
        .insert(pets)
        .values(petPayload)
        .returning();

      return newPet;
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

      // Convert separate day/month/year to dateOfBirth if provided
      let dateOfBirth: string | undefined;
      if (validatedData.day && validatedData.month && validatedData.year) {
        // Ensure proper date formatting (YYYY-MM-DD)
        const year = parseInt(validatedData.year);
        const month = parseInt(validatedData.month);
        const day = parseInt(validatedData.day);
        
        // Validate date components
        if (year < 1900 || year > new Date().getFullYear() + 1) {
          throw new Error('Invalid year');
        }
        if (month < 1 || month > 12) {
          throw new Error('Invalid month');
        }
        if (day < 1 || day > 31) {
          throw new Error('Invalid day');
        }
        
        // Create date string in YYYY-MM-DD format
        dateOfBirth = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      } else if (validatedData.birthDate) {
        // If birthDate is already provided, use it
        dateOfBirth = validatedData.birthDate;
      }

      // Prepare the update data, mapping fields correctly
      const updateData: any = {};
      if (validatedData.name !== undefined) updateData.name = validatedData.name;
      if (validatedData.species !== undefined) updateData.species = validatedData.species;
      if (validatedData.breedId !== undefined) updateData.breedId = validatedData.breedId;
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth; // This maps to date_of_birth column
      if (validatedData.gender !== undefined) updateData.gender = validatedData.gender;
      if (validatedData.neutered !== undefined) updateData.neutered = validatedData.neutered;
      if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
      if (validatedData.imageUrl !== undefined) updateData.imageUrl = validatedData.imageUrl;

      const updatedPet = await db
        .update(pets)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(pets.id, petId))
        .returning();

      // Get the complete pet data with breed name (same structure as getMyPets)
      return await this.getCompletePetData(petId);
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

      // Get the complete pet data with breed name (same structure as getMyPets)
      return await this.getCompletePetData(petId);
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

      return { success: true, message: 'Pet deleted successfully' };
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
      const pet = await this.getCompletePetData(petId);

      if (!pet) {
        throw new Error('Pet not found');
      }

      return pet;
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

      // Get the complete pet data with breed name (same structure as getMyPets)
      return await this.getCompletePetData(petId);
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
                         sortBy === 'createdAt' ? pets.createdAt : 
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

  async searchPetsByName(name: string, species?: Species): Promise<typeof pets.$inferSelect[]> {
    try {
      const searchPattern = `%${name}%`;
      
      const conditions = [ilike(pets.name, searchPattern)];
      if (species) {
        conditions.push(eq(pets.species, species));
      }

      const petsData = await db
        .select()
        .from(pets)
        .where(and(...conditions));
        
      return petsData;
    } catch (error) {
      throw new Error(`Failed to search pets by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
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