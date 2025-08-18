import { db } from '../db';
import { breeds, dogBreedDetails, catBreedDetails, type Breed, type DogBreedDetail, type CatBreedDetail } from '../db/schema';
import { eq, like, and, or, asc, desc, count } from 'drizzle-orm';
import { PaginationOptions, PaginatedResponse, validatePaginationOptions, calculatePaginationInfo, calculateOffset, ApiResponses, ApiResponse } from '../utils';
import { SPECIES_ENUM, SIZE_ENUM, ACTIVITY_LEVEL_ENUM, GROOMING_NEEDS_ENUM, TRAINING_DIFFICULTY_ENUM } from '../constants';
import { BreedFilters, BreedWithDetails, BreedNameResponse } from '../types';

export class BreedService {
  private breedNamesCache: Map<string, { data: BreedNameResponse[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  async getBreeds(filters?: BreedFilters): Promise<PaginatedResponse<BreedWithDetails>> {
    try {
      const paginationOptions = validatePaginationOptions(filters || {});
      const { page, limit, sortBy, sortOrder } = paginationOptions;
      const offset = calculateOffset(page, limit);
      const baseConditions = [];
      
      if (filters?.species) {
        baseConditions.push(eq(breeds.species, filters.species));
      }
      
      if (filters?.search) {
        baseConditions.push(like(breeds.nameEn, `%${filters.search}%`));
      }

      let total = 0;
      if (baseConditions.length > 0) {
        const countResult = await db
          .select({ count: count() })
          .from(breeds)
          .where(and(...baseConditions));
        total = countResult[0].count;
      } else {
        const countResult = await db.select({ count: count() }).from(breeds);
        total = countResult[0].count;
      }

      let allBreeds;
      if (baseConditions.length > 0) {
        allBreeds = await db
          .select()
          .from(breeds)
          .where(and(...baseConditions))
          .orderBy(sortOrder === 'asc' ? asc(sortBy === 'name' ? breeds.nameEn : breeds.createdAt) : desc(sortBy === 'name' ? breeds.nameEn : breeds.createdAt))
          .limit(limit)
          .offset(offset);
      } else {
        allBreeds = await db
          .select()
          .from(breeds)
          .orderBy(sortOrder === 'asc' ? asc(sortBy === 'name' ? breeds.nameEn : breeds.createdAt) : desc(sortBy === 'name' ? breeds.nameEn : breeds.createdAt))
          .limit(limit)
          .offset(offset);
      }

      // Get details for each breed
      const breedsWithDetails: BreedWithDetails[] = [];

      for (const breed of allBreeds) {
        let detail: DogBreedDetail | CatBreedDetail | null = null;

        if (breed.species === 'dog') {
          const dogDetail = await db
            .select()
            .from(dogBreedDetails)
            .where(eq(dogBreedDetails.breedId, breed.id))
            .limit(1);
          detail = dogDetail[0] || null;
        } else if (breed.species === 'cat') {
          const catDetail = await db
            .select()
            .from(catBreedDetails)
            .where(eq(catBreedDetails.breedId, breed.id))
            .limit(1);
          detail = catDetail[0] || null;
        }

        breedsWithDetails.push({
          breed,
          detail
        });
      }

      let filteredBreeds = breedsWithDetails;

      // Filter by dog-specific fields
      if (filters?.size || filters?.activityLevel || filters?.trainingDifficulty) {
        filteredBreeds = filteredBreeds.filter(breed => {
          if (breed.breed.species !== 'dog') return false;
          
          const dogDetail = breed.detail as DogBreedDetail;
          if (!dogDetail) return false;
          
          if (filters?.size && dogDetail.size !== filters.size) return false;
          if (filters?.activityLevel && dogDetail.activityLevel !== filters.activityLevel) return false;
          if (filters?.trainingDifficulty && dogDetail.trainingDifficulty !== filters.trainingDifficulty) return false;
          
          return true;
        });
      }

      if (filters?.groomingNeeds) {
        filteredBreeds = filteredBreeds.filter(breed => {
          if (breed.breed.species === 'dog') {
            const dogDetail = breed.detail as DogBreedDetail;
            return dogDetail?.groomingNeeds === filters.groomingNeeds;
          } else if (breed.breed.species === 'cat') {
            const catDetail = breed.detail as CatBreedDetail;
            return catDetail?.groomingNeeds === filters.groomingNeeds;
          }
          return false;
        });
      }

      const actualTotal = filteredBreeds.length;
      const paginationInfo = calculatePaginationInfo(actualTotal, page, limit);

      return {
        data: filteredBreeds,
        pagination: paginationInfo
      };
    } catch (error) {
      throw new Error(`Failed to get breeds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBreedById(breedId: string): Promise<BreedWithDetails> {
    try {
      const breed = await db
        .select()
        .from(breeds)
        .where(eq(breeds.id, breedId))
        .limit(1);

      if (breed.length === 0) {
        throw new Error('Breed not found');
      }

      const breedData = breed[0];
      let detail: DogBreedDetail | CatBreedDetail | null = null;

      if (breedData.species === 'dog') {
        const dogDetail = await db
          .select()
          .from(dogBreedDetails)
          .where(eq(dogBreedDetails.breedId, breedId))
          .limit(1);
        detail = dogDetail[0] || null;
      } else if (breedData.species === 'cat') {
        const catDetail = await db
          .select()
          .from(catBreedDetails)
          .where(eq(catBreedDetails.breedId, breedId))
          .limit(1);
        detail = catDetail[0] || null;
      }

      return {
        breed: breedData,
        detail
      };
    } catch (error) {
      throw new Error(`Failed to get breed by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBreedByName(breedName: string): Promise<BreedWithDetails> {
    try {
      const breed = await db
        .select()
        .from(breeds)
        .where(eq(breeds.nameEn, breedName))
        .limit(1);

      if (breed.length === 0) {
        throw new Error('Breed not found');
      }

      const breedData = breed[0];
      let detail: DogBreedDetail | CatBreedDetail | null = null;

      if (breedData.species === 'dog') {
        const dogDetail = await db
          .select()
          .from(dogBreedDetails)
          .where(eq(dogBreedDetails.breedId, breedData.id))
          .limit(1);
        detail = dogDetail[0] || null;
      } else if (breedData.species === 'cat') {
        const catDetail = await db
          .select()
          .from(catBreedDetails)
          .where(eq(catBreedDetails.breedId, breedData.id))
          .limit(1);
        detail = catDetail[0] || null;
      }

      return {
        breed: breedData,
        detail
      };
    } catch (error) {
      throw new Error(`Failed to get breed by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createBreed(breedData: any, detailsData?: any) {
    try {
      const validatedBreedData = breedData;

      const newBreed = await db
        .insert(breeds)
        .values(validatedBreedData)
        .returning();

      const breed = newBreed[0];

      if (detailsData && breed.species === 'dog') {
        const validatedDogDetails = detailsData;
        await db.insert(dogBreedDetails).values({
          breedId: breed.id,
          ...validatedDogDetails,
        });
      } else if (detailsData && breed.species === 'cat') {
        const validatedCatDetails = detailsData;
        await db.insert(catBreedDetails).values({
          breedId: breed.id,
          ...validatedCatDetails,
        });
      }

      return await this.getBreedById(breed.id);
    } catch (error) {
      throw new Error(`Failed to create breed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateBreed(breedId: string, breedData: any, detailsData?: any) {
    try {
      const validatedBreedData = breedData;
      const updatedBreed = await db
        .update(breeds)
        .set({
          ...validatedBreedData,
          updatedAt: new Date(),
        })
        .where(eq(breeds.id, breedId))
        .returning();

      if (updatedBreed.length === 0) {
        throw new Error('Breed not found');
      }

      const breed = updatedBreed[0];
      if (detailsData && breed.species === 'dog') {
        const validatedDogDetails = detailsData;
        await db
          .update(dogBreedDetails)
          .set(validatedDogDetails)
          .where(eq(dogBreedDetails.breedId, breedId));
      } else if (detailsData && breed.species === 'cat') {
        const validatedCatDetails = detailsData;
        await db
          .update(catBreedDetails)
          .set(validatedCatDetails)
          .where(eq(catBreedDetails.breedId, breedId));
      }
      return await this.getBreedById(breedId);
    } catch (error) {
      throw new Error(`Failed to update breed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteBreed(breedId: string) {
    try {
      await db.delete(dogBreedDetails).where(eq(dogBreedDetails.breedId, breedId));
      await db.delete(catBreedDetails).where(eq(catBreedDetails.breedId, breedId));
      const deletedBreed = await db
        .delete(breeds)
        .where(eq(breeds.id, breedId))
        .returning();
      if (deletedBreed.length === 0) {
        throw new Error('Breed not found');
      }
      return { message: 'Breed deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete breed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDogBreedsBySize(size: typeof SIZE_ENUM[number]): Promise<BreedWithDetails[]> {
    try {
      const dogBreeds = await db
        .select()
        .from(breeds)
        .where(eq(breeds.species, 'dog'));
      const breedsWithDetails: BreedWithDetails[] = [];

      for (const breed of dogBreeds) {
        const dogDetail = await db
          .select()
          .from(dogBreedDetails)
          .where(and(
            eq(dogBreedDetails.breedId, breed.id),
            eq(dogBreedDetails.size, size)
          ))
          .limit(1);

        if (dogDetail[0]) {
          breedsWithDetails.push({
            breed,
            detail: dogDetail[0]
          });
        }
      }

      return breedsWithDetails;
    } catch (error) {
      throw new Error(`Failed to get dog breeds by size: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchBreeds(searchTerm: string, options?: PaginationOptions): Promise<PaginatedResponse<BreedWithDetails>> {
    try {
      const { page, limit, sortBy, sortOrder } = validatePaginationOptions(options || {});
      const offset = calculateOffset(page, limit);

      const [{ count: total }] = await db
        .select({ count: count() })
        .from(breeds)
        .where(like(breeds.nameEn, `%${searchTerm}%`));

      const searchResults = await db
        .select()
        .from(breeds)
        .where(like(breeds.nameEn, `%${searchTerm}%`))
        .orderBy(sortOrder === 'asc' ? asc(sortBy === 'name' ? breeds.nameEn : breeds.createdAt) : desc(sortBy === 'name' ? breeds.nameEn : breeds.createdAt))
        .limit(limit)
        .offset(offset);

      const breedsWithDetails: BreedWithDetails[] = [];

      for (const breed of searchResults) {
        let detail: DogBreedDetail | CatBreedDetail | null = null;

        if (breed.species === 'dog') {
          const dogDetail = await db
            .select()
            .from(dogBreedDetails)
            .where(eq(dogBreedDetails.breedId, breed.id))
            .limit(1);
          detail = dogDetail[0] || null;
        } else if (breed.species === 'cat') {
          const catDetail = await db
            .select()
            .from(catBreedDetails)
            .where(eq(catBreedDetails.breedId, breed.id))
            .limit(1);
          detail = catDetail[0] || null;
        }

        breedsWithDetails.push({
          breed,
          detail
        });
      }

      return {
        data: breedsWithDetails,
        pagination: calculatePaginationInfo(total, page, limit)
      };
    } catch (error) {
      throw new Error(`Failed to search breeds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDogBreedsByActivityLevel(activityLevel: typeof ACTIVITY_LEVEL_ENUM[number]): Promise<BreedWithDetails[]> {
    try {
      // Get dog breeds first
      const dogBreeds = await db
        .select()
        .from(breeds)
        .where(eq(breeds.species, 'dog'));

      // Get details for each breed
      const breedsWithDetails: BreedWithDetails[] = [];

      for (const breed of dogBreeds) {
        const dogDetail = await db
          .select()
          .from(dogBreedDetails)
          .where(and(
            eq(dogBreedDetails.breedId, breed.id),
            eq(dogBreedDetails.activityLevel, activityLevel)
          ))
          .limit(1);

        if (dogDetail[0]) {
          breedsWithDetails.push({
            breed,
            detail: dogDetail[0]
          });
        }
      }

      return breedsWithDetails;
    } catch (error) {
      throw new Error(`Failed to get dog breeds by activity level: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBreedsByGroomingNeeds(groomingNeeds: typeof GROOMING_NEEDS_ENUM[number]): Promise<BreedWithDetails[]> {
    try {
      // Get all breeds
      const allBreeds = await db.select().from(breeds);

      // Get details for each breed
      const breedsWithDetails: BreedWithDetails[] = [];

      for (const breed of allBreeds) {
        let detail: DogBreedDetail | CatBreedDetail | null = null;

        if (breed.species === 'dog') {
          const dogDetail = await db
            .select()
            .from(dogBreedDetails)
            .where(and(
              eq(dogBreedDetails.breedId, breed.id),
              eq(dogBreedDetails.groomingNeeds, groomingNeeds)
            ))
            .limit(1);
          detail = dogDetail[0] || null;
        } else if (breed.species === 'cat') {
          const catDetail = await db
            .select()
            .from(catBreedDetails)
            .where(and(
              eq(catBreedDetails.breedId, breed.id),
              eq(catBreedDetails.groomingNeeds, groomingNeeds)
            ))
            .limit(1);
          detail = catDetail[0] || null;
        }

        if (detail) {
          breedsWithDetails.push({
            breed,
            detail
          });
        }
      }

      return breedsWithDetails;
    } catch (error) {
      throw new Error(`Failed to get breeds by grooming needs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDogBreedsByTrainingDifficulty(trainingDifficulty: typeof TRAINING_DIFFICULTY_ENUM[number]): Promise<BreedWithDetails[]> {
    try {
      // Get dog breeds first
      const dogBreeds = await db
        .select()
        .from(breeds)
        .where(eq(breeds.species, 'dog'));

      // Get details for each breed
      const breedsWithDetails: BreedWithDetails[] = [];

      for (const breed of dogBreeds) {
        const dogDetail = await db
          .select()
          .from(dogBreedDetails)
          .where(and(
            eq(dogBreedDetails.breedId, breed.id),
            eq(dogBreedDetails.trainingDifficulty, trainingDifficulty)
          ))
          .limit(1);

        if (dogDetail[0]) {
          breedsWithDetails.push({
            breed,
            detail: dogDetail[0]
          });
        }
      }

      return breedsWithDetails;
    } catch (error) {
      throw new Error(`Failed to get dog breeds by training difficulty: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBreedsBySpecies(species: typeof SPECIES_ENUM[number]): Promise<BreedWithDetails[]> {
    try {
      // Get breeds by species
      const speciesBreeds = await db
        .select()
        .from(breeds)
        .where(eq(breeds.species, species));

      // Get details for each breed
      const breedsWithDetails: BreedWithDetails[] = [];

      for (const breed of speciesBreeds) {
        let detail: DogBreedDetail | CatBreedDetail | null = null;

        if (species === 'dog') {
          const dogDetail = await db
            .select()
            .from(dogBreedDetails)
            .where(eq(dogBreedDetails.breedId, breed.id))
            .limit(1);
          detail = dogDetail[0] || null;
        } else if (species === 'cat') {
          const catDetail = await db
            .select()
            .from(catBreedDetails)
            .where(eq(catBreedDetails.breedId, breed.id))
            .limit(1);
          detail = catDetail[0] || null;
        }

        breedsWithDetails.push({
          breed,
          detail
        });
      }

      return breedsWithDetails;
    } catch (error) {
      throw new Error(`Failed to get breeds by species: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBreedNamesBySpecies(species: typeof SPECIES_ENUM[number], options?: PaginationOptions): Promise<PaginatedResponse<BreedNameResponse>> {
    try {
      const { page, limit, sortBy, sortOrder } = validatePaginationOptions(options || {});
      const offset = calculateOffset(page, limit);

      const [{ count: total }] = await db
        .select({ count: count() })
        .from(breeds)
        .where(eq(breeds.species, species));

      const sortColumn = sortBy === 'name' ? breeds.nameEn : breeds.createdAt;
      const sortDirection = sortOrder === 'asc' ? asc : desc;

      const breedNames = await db
        .select({
          id: breeds.id,
          nameEn: breeds.nameEn,
          nameTh: breeds.nameTh,
        })
        .from(breeds)
        .where(eq(breeds.species, species))
        .orderBy(sortDirection(sortColumn))
        .limit(limit)
        .offset(offset);

      return {
        data: breedNames,
        pagination: calculatePaginationInfo(total, page, limit)
      };
    } catch (error) {
      throw new Error(`Failed to get breed names by species: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  async getBreedCount(): Promise<{ dogCount: number; catCount: number }> {
  const dogCount = await db.select({ count: count() }).from(breeds).where(eq(breeds.species, 'dog'));
  const catCount = await db.select({ count: count() }).from(breeds).where(eq(breeds.species, 'cat'));
  return {
    dogCount: dogCount[0].count,
    catCount: catCount[0].count,
  }
  }

  async getBreedNamesForSelector(
    species: typeof SPECIES_ENUM[number], 
    language: 'en' | 'th' = 'th',
    options?: PaginationOptions
  ): Promise<PaginatedResponse<BreedNameResponse>> {
    try {
      const cacheKey = `${species}_${language}`;
      const now = Date.now();
      
      // Check cache first
      const cached = this.breedNamesCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
        // Return cached data with pagination
        const { page, limit } = validatePaginationOptions(options || {});
        const offset = calculateOffset(page, limit);
        const total = cached.data.length;
        const paginatedData = cached.data.slice(offset, offset + limit);
        
        return {
          data: paginatedData,
          pagination: calculatePaginationInfo(total, page, limit)
        };
      }

      // If not cached or expired, fetch from database
      const { page, limit, sortBy, sortOrder } = validatePaginationOptions(options || {});
      const offset = calculateOffset(page, limit);

      // Get total count
      const [{ count: total }] = await db
        .select({ count: count() })
        .from(breeds)
        .where(eq(breeds.species, species));

      // Get breed names
      const sortColumn = sortBy === 'name' ? breeds.nameEn : breeds.createdAt;
      const sortDirection = sortOrder === 'asc' ? asc : desc;

      const breedNames = await db
        .select({
          id: breeds.id,
          nameEn: breeds.nameEn,
          nameTh: breeds.nameTh,
        })
        .from(breeds)
        .where(eq(breeds.species, species))
        .orderBy(sortDirection(sortColumn))
        .limit(limit)
        .offset(offset);

      // Transform data - no displayName field needed
      const transformedData: BreedNameResponse[] = breedNames.map(breed => ({
        id: breed.id,
        nameEn: breed.nameEn,
        nameTh: breed.nameTh,
      }));

      // Cache the full result (without pagination for better cache hit rate)
      const allBreedsForSpecies = await db
        .select({
          id: breeds.id,
          nameEn: breeds.nameEn,
          nameTh: breeds.nameTh,
        })
        .from(breeds)
        .where(eq(breeds.species, species))
        .orderBy(asc(breeds.nameEn));

      const allTransformedData: BreedNameResponse[] = allBreedsForSpecies.map(breed => ({
        id: breed.id,
        nameEn: breed.nameEn,
        nameTh: breed.nameTh,
      }));

      this.breedNamesCache.set(cacheKey, {
        data: allTransformedData,
        timestamp: now
      });

      return {
        data: transformedData,
        pagination: calculatePaginationInfo(total, page, limit)
      };
    } catch (error) {
      throw new Error(`Failed to get breed names for selector: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Method to clear cache (useful for admin operations)
  clearBreedNamesCache(): void {
    this.breedNamesCache.clear();
  }

  // Method to get cache stats (useful for monitoring)
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.breedNamesCache.size,
      keys: Array.from(this.breedNamesCache.keys())
    };
  }

  // Bulk insert breeds
  async bulkInsertBreeds(breedData: Array<{
    species: 'dog' | 'cat';
    nameEn: string;
    nameTh: string;
    descriptionEn?: string;
    descriptionTh?: string;
    lifespanMinYears?: number;
    lifespanMaxYears?: number;
    originCountry?: string;
  }>) {
    try {
      console.log(`BreedService: Bulk inserting ${breedData.length} breeds...`);
      
      const insertedBreeds = await db
        .insert(breeds)
        .values(breedData)
        .returning();

      console.log(`BreedService: Successfully inserted ${insertedBreeds.length} breeds`);
      
      // Clear cache after bulk insert
      this.clearBreedNamesCache();
      
      return insertedBreeds;
    } catch (error) {
      console.error('BreedService: Error bulk inserting breeds:', error);
      throw new Error(`Failed to bulk insert breeds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const breedService = new BreedService();
