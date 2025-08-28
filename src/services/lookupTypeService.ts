import { db } from '../db';
import { 
  activityTypes, 
  symptomTypes, 
  vetVisitTypes, 
  medicationTypes
} from '../db/schema';
import { 
  createLookupTypeSchema, 
  updateLookupTypeSchema,
  speciesSchema 
} from '../constants/schemas';
import { eq, and, or, isNull, asc, desc, like, inArray } from 'drizzle-orm';
import { z } from 'zod';
import type { 
  LookupType,
  LookupTypeQueryParams,
  LookupTypeResponse,
  LookupTypeListResponse,
  LookupTypeStatsResponse,
  AllLookupTypesForSpeciesResponse,
  BulkCreateLookupTypeResponse
} from '../types';

// === LOOKUP TYPE SERVICE ===
export class LookupTypeService {
  
  /**
   * Get the appropriate table based on lookup type
   */
  private getTable(type: LookupType) {
    switch (type) {
      case 'activity':
        return activityTypes;
      case 'symptom':
        return symptomTypes;
      case 'vet_visit':
        return vetVisitTypes;
      case 'medication':
        return medicationTypes;
      default:
        throw new Error(`Invalid lookup type: ${type}`);
    }
  }

  /**
   * Build query conditions based on parameters
   */
  private buildConditions(type: LookupType, params: LookupTypeQueryParams) {
    const conditions = [];
    
    // Base active condition
    if (params.isActive !== undefined) {
      conditions.push(eq(this.getTable(type).isActive, params.isActive));
    } else {
      conditions.push(eq(this.getTable(type).isActive, true));
    }
    
    // Species filter
    if (params.species) {
      const validatedSpecies = speciesSchema.parse(params.species);
      conditions.push(
        or(
          eq(this.getTable(type).species, validatedSpecies),
          isNull(this.getTable(type).species)
        )!
      );
    }
    
    // Search filter
    if (params.search) {
      conditions.push(
        or(
          like(this.getTable(type).nameEn, `%${params.search}%`),
          like(this.getTable(type).nameTh, `%${params.search}%`),
          like(this.getTable(type).descriptionEn || '', `%${params.search}%`),
          like(this.getTable(type).descriptionTh || '', `%${params.search}%`)
        )!
      );
    }
    
    // Type-specific filters
    switch (type) {
      case 'symptom':
        if (params.severity) {
          conditions.push(eq(symptomTypes.severity, params.severity));
        }
        break;
      case 'vet_visit':
        if (params.isRoutine !== undefined) {
          conditions.push(eq(vetVisitTypes.isRoutine, params.isRoutine));
        }
        break;
      case 'medication':
        if (params.category) {
          conditions.push(eq(medicationTypes.category, params.category));
        }
        if (params.requiresPrescription !== undefined) {
          conditions.push(eq(medicationTypes.requiresPrescription, params.requiresPrescription));
        }
        break;
    }
    
    return conditions;
  }

  /**
   * Get lookup types with flexible filtering
   */
  async getLookupTypes(
    type: LookupType, 
    params: LookupTypeQueryParams = {}
  ): Promise<LookupTypeListResponse> {
    try {
      const table = this.getTable(type);
      const conditions = this.buildConditions(type, params);
      
      // Build order by clause
      let orderBy = [];
      if (params.sortBy === 'nameEn') {
        orderBy.push(asc(table.nameEn));
      } else if (params.sortBy === 'nameTh') {
        orderBy.push(asc(table.nameTh));
      } else if (params.sortBy === 'createdAt') {
        orderBy.push(params.sortOrder === 'desc' ? desc(table.createdAt) : asc(table.createdAt));
      } else {
        // Default: sortOrder, then nameEn
        orderBy.push(asc(table.sortOrder), asc(table.nameEn));
      }
      
      const query = db
        .select()
        .from(table)
        .where(and(...conditions))
        .orderBy(...orderBy);
      
      // Apply pagination
      if (params.limit) {
        query.limit(params.limit);
      }
      if (params.offset) {
        query.offset(params.offset);
      }
      
      const types = await query;
      
      return { 
        success: true, 
        data: types,
        count: types.length
      };
    } catch (error) {
      console.error(`Error fetching ${type} types:`, error);
      throw error;
    }
  }

  /**
   * Get a single lookup type by ID
   */
  async getLookupTypeById(type: LookupType, id: string): Promise<LookupTypeResponse> {
    try {
      const table = this.getTable(type);
      
      const [result] = await db
        .select()
        .from(table)
        .where(eq(table.id, id))
        .limit(1);
      
      if (!result) {
        throw new Error(`${type} type not found`);
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error fetching ${type} type by ID:`, error);
      throw error;
    }
  }

  /**
   * Create a new lookup type
   */
  async createLookupType(type: LookupType, data: any): Promise<LookupTypeResponse> {
    try {
      const table = this.getTable(type);
      
      // Validate data based on type
      let validatedData;
      switch (type) {
        case 'activity':
          validatedData = createLookupTypeSchema.parse(data);
          break;
        case 'symptom':
          validatedData = createLookupTypeSchema.extend({
            severity: z.string().optional()
          }).parse(data);
          break;
        case 'vet_visit':
          validatedData = createLookupTypeSchema.extend({
            isRoutine: z.boolean().default(false)
          }).parse(data);
          break;
        case 'medication':
          validatedData = createLookupTypeSchema.extend({
            category: z.string().optional(),
            requiresPrescription: z.boolean().default(false)
          }).parse(data);
          break;
      }
      
      const [result] = await db
        .insert(table)
        .values(validatedData)
        .returning();
      
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error creating ${type} type:`, error);
      throw error;
    }
  }

  /**
   * Update an existing lookup type
   */
  async updateLookupType(type: LookupType, id: string, data: any): Promise<LookupTypeResponse> {
    try {
      const table = this.getTable(type);
      
      // Validate data based on type
      let validatedData;
      switch (type) {
        case 'activity':
          validatedData = updateLookupTypeSchema.parse(data);
          break;
        case 'symptom':
          validatedData = updateLookupTypeSchema.extend({
            severity: z.string().optional()
          }).parse(data);
          break;
        case 'vet_visit':
          validatedData = updateLookupTypeSchema.extend({
            isRoutine: z.boolean().optional()
          }).parse(data);
          break;
        case 'medication':
          validatedData = updateLookupTypeSchema.extend({
            category: z.string().optional(),
            requiresPrescription: z.boolean().optional()
          }).parse(data);
          break;
      }
      
      const [result] = await db
        .update(table)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(table.id, id))
        .returning();
      
      if (!result) {
        throw new Error(`${type} type not found`);
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error updating ${type} type:`, error);
      throw error;
    }
  }

  /**
   * Delete a lookup type (soft delete by setting isActive to false)
   */
  async deleteLookupType(type: LookupType, id: string): Promise<LookupTypeResponse> {
    try {
      const table = this.getTable(type);
      
      const [result] = await db
        .update(table)
        .set({ 
          isActive: false, 
          updatedAt: new Date() 
        })
        .where(eq(table.id, id))
        .returning();
      
      if (!result) {
        throw new Error(`${type} type not found`);
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error deleting ${type} type:`, error);
      throw error;
    }
  }

  /**
   * Hard delete a lookup type (use with caution)
   */
  async hardDeleteLookupType(type: LookupType, id: string): Promise<LookupTypeResponse> {
    try {
      const table = this.getTable(type);
      
      const [result] = await db
        .delete(table)
        .where(eq(table.id, id))
        .returning();
      
      if (!result) {
        throw new Error(`${type} type not found`);
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error hard deleting ${type} type:`, error);
      throw error;
    }
  }

  /**
   * Restore a deleted lookup type
   */
  async restoreLookupType(type: LookupType, id: string): Promise<LookupTypeResponse> {
    try {
      const table = this.getTable(type);
      
      const [result] = await db
        .update(table)
        .set({ 
          isActive: true, 
          updatedAt: new Date() 
        })
        .where(eq(table.id, id))
        .returning();
      
      if (!result) {
        throw new Error(`${type} type not found`);
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error restoring ${type} type:`, error);
      throw error;
    }
  }

  /**
   * Get all lookup types for a specific species in one call
   */
  async getAllLookupTypesForSpecies(species: string): Promise<AllLookupTypesForSpeciesResponse> {
    try {
      const validatedSpecies = speciesSchema.parse(species);
      
      const [activities, symptoms, vetVisits, medications] = await Promise.all([
        this.getLookupTypes('activity', { species: validatedSpecies }),
        this.getLookupTypes('symptom', { species: validatedSpecies }),
        this.getLookupTypes('vet_visit', { species: validatedSpecies }),
        this.getLookupTypes('medication', { species: validatedSpecies })
      ]);
      
      return {
        success: true,
        data: {
          activities: activities.data as any[],
          symptoms: symptoms.data as any[],
          vetVisits: vetVisits.data as any[],
          medications: medications.data as any[]
        }
      };
    } catch (error) {
      console.error('Error fetching all lookup types for species:', error);
      throw error;
    }
  }

  /**
   * Bulk create lookup types (useful for seeding)
   */
  async bulkCreateLookupTypes(type: LookupType, data: any[]): Promise<BulkCreateLookupTypeResponse> {
    try {
      const table = this.getTable(type);
      
      // Validate all data
      const validatedData = data.map(item => {
        switch (type) {
          case 'activity':
            return createLookupTypeSchema.parse(item);
          case 'symptom':
            return createLookupTypeSchema.extend({
              severity: z.string().optional()
            }).parse(item);
          case 'vet_visit':
            return createLookupTypeSchema.extend({
              isRoutine: z.boolean().default(false)
            }).parse(item);
          case 'medication':
            return createLookupTypeSchema.extend({
              category: z.string().optional(),
              requiresPrescription: z.boolean().default(false)
            }).parse(item);
          default:
            throw new Error(`Invalid lookup type: ${type}`);
        }
      });
      
      const results = await db
        .insert(table)
        .values(validatedData)
        .returning();
      
      return { success: true, data: results, count: results.length };
    } catch (error) {
      console.error(`Error bulk creating ${type} types:`, error);
      throw error;
    }
  }

  /**
   * Get lookup type statistics
   */
  async getLookupTypeStats(type: LookupType): Promise<LookupTypeStatsResponse> {
    try {
      const table = this.getTable(type);
      
      const totalResult = await db
        .select()
        .from(table);
      
      const activeResult = await db
        .select()
        .from(table)
        .where(eq(table.isActive, true));
      
      return {
        success: true,
        data: {
          total: totalResult.length,
          active: activeResult.length,
          inactive: totalResult.length - activeResult.length
        }
      };
    } catch (error) {
      console.error(`Error getting ${type} type stats:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const lookupTypeService = new LookupTypeService(); 