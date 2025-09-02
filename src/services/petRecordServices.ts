import { db } from '@/db';
import { 
  petRecords, 
  activityTypes, 
  symptomTypes, 
  vetVisitTypes, 
  medicationTypes,
  pets
} from '@/db/schema';
import { eq, and, desc, asc, count, gte, lte, isNull, or } from 'drizzle-orm';
import { 
  createPetRecordSchema, 
  updatePetRecordSchema, 
  petRecordQuerySchema,
  recordTypeSchema,
  speciesSchema,
  SPECIES_ENUM
} from '@/constants';
import { PaginationOptions, PaginatedResponse, calculateOffset } from '@/utils';
import { z } from 'zod';

// Lookup type interfaces
interface LookupType {
  id: string;
  species: string | null;
  nameEn: string;
  nameTh: string;
  descriptionEn?: string | null;
  descriptionTh?: string | null;
  iconUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export class PetRecordService {
  // === PET RECORDS CRUD ===
  
  /**
   * Create a new pet record
   */
  async createRecord(petId: string, userId: string, data: z.infer<typeof createPetRecordSchema>) {
    try {
      // Validate input
      const validatedData = createPetRecordSchema.parse(data);
      
      // Verify pet ownership
      const pet = await db
        .select({ id: pets.id, userId: pets.userId })
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);
      
      if (!pet.length || pet[0].userId !== userId) {
        throw new Error('Pet not found or access denied');
      }
      
      // Verify type exists in the appropriate lookup table
      await this.validateTypeId(validatedData.recordType, validatedData.typeId);
      
      // Create the record
      const [newRecord] = await db
        .insert(petRecords)
        .values({
          petId,
          recordType: validatedData.recordType,
          typeId: validatedData.typeId,
          note: validatedData.note,
          vibe: validatedData.vibe,
          imageUrl: validatedData.imageUrl,
          metadata: validatedData.metadata,
          occurredAt: validatedData.occurredAt ? new Date(validatedData.occurredAt) : new Date(),
        })
        .returning();
      
      return { success: true, data: newRecord };
    } catch (error) {
      console.error('Error creating pet record:', error);
      throw error;
    }
  }

  /**
   * Create the same record for multiple pets (bulk create)
   */
  async bulkCreateRecords(petIds: string[], userId: string, data: z.infer<typeof createPetRecordSchema>) {
    try {
      // Validate input
      const validatedData = createPetRecordSchema.parse(data);
      
      // Verify all pets belong to the user and exist
      const userPets = await db
        .select({ id: pets.id, userId: pets.userId, species: pets.species })
        .from(pets)
        .where(and(
          or(...petIds.map(id => eq(pets.id, id))),
          eq(pets.userId, userId)
        ));
      
      if (userPets.length !== petIds.length) {
        throw new Error('Some pets not found or access denied');
      }
      
      // Verify type exists in the appropriate lookup table
      await this.validateTypeId(validatedData.recordType, validatedData.typeId);
      
      // Create records for all pets
      const newRecords = await db
        .insert(petRecords)
        .values(
          petIds.map(petId => ({
            petId,
            recordType: validatedData.recordType,
            typeId: validatedData.typeId,
            note: validatedData.note,
            vibe: validatedData.vibe,
            imageUrl: validatedData.imageUrl,
            metadata: validatedData.metadata,
            occurredAt: validatedData.occurredAt ? new Date(validatedData.occurredAt) : new Date(),
          }))
        )
        .returning();
      
      return { success: true, data: newRecords };
    } catch (error) {
      console.error('Error bulk creating pet records:', error);
      throw error;
    }
  }
  
  /**
   * Get pet records with filtering and pagination
   */
  async getRecords(
    petId: string, 
    userId: string, 
    query: z.infer<typeof petRecordQuerySchema>
  ) {
    try {
      // Validate query params
      const validatedQuery = petRecordQuerySchema.parse(query);
      
      // Verify pet ownership
      const pet = await db
        .select({ id: pets.id, userId: pets.userId })
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);
      
      if (!pet.length || pet[0].userId !== userId) {
        throw new Error('Pet not found or access denied');
      }
      
      // Build where conditions
      const conditions = [
        eq(petRecords.petId, petId),
        eq(petRecords.isDeleted, false)
      ];
      
      if (validatedQuery.from) {
        conditions.push(gte(petRecords.occurredAt, new Date(validatedQuery.from)));
      }
      
      if (validatedQuery.to) {
        conditions.push(lte(petRecords.occurredAt, new Date(validatedQuery.to)));
      }
      
      if (validatedQuery.kind) {
        conditions.push(eq(petRecords.recordType, validatedQuery.kind));
      }
      
      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(petRecords)
        .where(and(...conditions));
      
      const total = totalResult.count;
      
      // Get records with pagination
      const records = await db
        .select()
        .from(petRecords)
        .where(and(...conditions))
        .orderBy(desc(petRecords.occurredAt), desc(petRecords.createdAt))
        .limit(validatedQuery.limit)
        .offset(validatedQuery.offset);
      
      // Enrich records with type information
      const enrichedRecords = await this.enrichRecordsWithTypeInfo(records);
      
      return {
        success: true,
        data: {
          records: enrichedRecords,
          pagination: {
            total,
            limit: validatedQuery.limit,
            offset: validatedQuery.offset,
            hasMore: validatedQuery.offset + validatedQuery.limit < total
          }
        }
      };
    } catch (error) {
      console.error('Error fetching pet records:', error);
      throw error;
    }
  }
  
  /**
   * Update a pet record
   */
  async updateRecord(
    recordId: string, 
    userId: string,
    data: z.infer<typeof updatePetRecordSchema>
  ) {
    try {
      // Validate input
      const validatedData = updatePetRecordSchema.parse(data);
      
      // Verify record exists and user has access
      const existingRecord = await db
        .select({ 
          id: petRecords.id, 
          petId: petRecords.petId,
          isDeleted: petRecords.isDeleted 
        })
        .from(petRecords)
        .innerJoin(pets, eq(petRecords.petId, pets.id))
        .where(and(
          eq(petRecords.id, recordId),
          eq(pets.userId, userId),
          eq(petRecords.isDeleted, false)
        ))
        .limit(1);
      
      if (!existingRecord.length) {
        throw new Error('Record not found or access denied');
      }
      
      // Validate occurredAt if provided
      if (validatedData.occurredAt) {
        const occurredAtDate = new Date(validatedData.occurredAt)
        if (isNaN(occurredAtDate.getTime())) {
          throw new Error('Invalid occurredAt date format')
        }
        // Ensure occurredAt is not in the future
        if (occurredAtDate > new Date()) {
          throw new Error('OccurredAt cannot be in the future')
        }
      }

      // Update the record
      const [updatedRecord] = await db
        .update(petRecords)
        .set({
          note: validatedData.note,
          vibe: validatedData.vibe,
          imageUrl: validatedData.imageUrl,
          metadata: validatedData.metadata,
          occurredAt: validatedData.occurredAt ? new Date(validatedData.occurredAt) : undefined,
          updatedAt: new Date()
        })
        .where(eq(petRecords.id, recordId))
        .returning();
      
      return { success: true, data: updatedRecord };
    } catch (error) {
      console.error('Error updating pet record:', error);
      throw error;
    }
  }
  
  /**
   * Soft delete a pet record
   */
  async deleteRecord(recordId: string, userId: string) {
    try {
      // Verify record exists and user has access
      const existingRecord = await db
        .select({ id: petRecords.id })
        .from(petRecords)
        .innerJoin(pets, eq(petRecords.petId, pets.id))
        .where(and(
          eq(petRecords.id, recordId),
          eq(pets.userId, userId),
          eq(petRecords.isDeleted, false)
        ))
        .limit(1);
      
      if (!existingRecord.length) {
        throw new Error('Record not found or access denied');
      }
      
      // Soft delete the record
      const [deletedRecord] = await db
        .update(petRecords)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(petRecords.id, recordId))
        .returning();
      
      return { success: true, data: deletedRecord };
    } catch (error) {
      console.error('Error deleting pet record:', error);
      throw error;
    }
  }
  
  // === LOOKUP SERVICES ===
  
  /**
   * Get activity types
   */
  async getActivityTypes(species?: string) {
    try {
      let conditions = [eq(activityTypes.isActive, true)];
      
      if (species) {
        const validatedSpecies = speciesSchema.parse(species);
        conditions.push(
          or(
            eq(activityTypes.species, validatedSpecies),
            isNull(activityTypes.species)
          )!
        );
      }
      
      const types = await db
        .select()
        .from(activityTypes)
        .where(and(...conditions))
        .orderBy(asc(activityTypes.sortOrder), asc(activityTypes.nameEn));
      
      return { success: true, data: types };
    } catch (error) {
      console.error('Error fetching activity types:', error);
      throw error;
    }
  }
  
  /**
   * Get symptom types
   */
  async getSymptomTypes(species?: string) {
    try {
      let conditions = [eq(symptomTypes.isActive, true)];
      
      if (species) {
        const validatedSpecies = speciesSchema.parse(species);
        conditions.push(
          or(
            eq(symptomTypes.species, validatedSpecies),
            isNull(symptomTypes.species)
          )!
        );
      }
      
      const types = await db
        .select()
        .from(symptomTypes)
        .where(and(...conditions))
        .orderBy(asc(symptomTypes.sortOrder), asc(symptomTypes.nameEn));
      
      return { success: true, data: types };
    } catch (error) {
      console.error('Error fetching symptom types:', error);
      throw error;
    }
  }
  
  /**
   * Get vet visit types
   */
  async getVetVisitTypes(species?: string) {
    try {
      let conditions = [eq(vetVisitTypes.isActive, true)];
      
      if (species) {
        const validatedSpecies = speciesSchema.parse(species);
        conditions.push(
          or(
            eq(vetVisitTypes.species, validatedSpecies),
            isNull(vetVisitTypes.species)
          )!
        );
      }
      
      const types = await db
        .select()
        .from(vetVisitTypes)
        .where(and(...conditions))
        .orderBy(asc(vetVisitTypes.sortOrder), asc(vetVisitTypes.nameEn));
      
      return { success: true, data: types };
    } catch (error) {
      console.error('Error fetching vet visit types:', error);
      throw error;
    }
  }
  
  /**
   * Get medication types
   */
  async getMedicationTypes(species?: string) {
    try {
      let conditions = [eq(medicationTypes.isActive, true)];
      
      if (species) {
        const validatedSpecies = speciesSchema.parse(species);
        conditions.push(
          or(
            eq(medicationTypes.species, validatedSpecies),
            isNull(medicationTypes.species)
          )!
        );
      }
      
      const types = await db
        .select()
        .from(medicationTypes)
        .where(and(...conditions))
        .orderBy(asc(medicationTypes.sortOrder), asc(medicationTypes.nameEn));
      
      return { success: true, data: types };
    } catch (error) {
      console.error('Error fetching medication types:', error);
      throw error;
    }
  }
  
  /**
   * Get all lookup types in a single call
   */
  async getAllLookupTypes(species?: string) {
    try {
      if (!species) {
        // If species not specified, fetch for every species and deduplicate by id
        const speciesList = SPECIES_ENUM as readonly string[];
        
        const [activitiesBySpecies, symptomsBySpecies, vetVisitsBySpecies, medicationsBySpecies] = await Promise.all([
          Promise.all(speciesList.map(s => this.getActivityTypes(s))),
          Promise.all(speciesList.map(s => this.getSymptomTypes(s))),
          Promise.all(speciesList.map(s => this.getVetVisitTypes(s))),
          Promise.all(speciesList.map(s => this.getMedicationTypes(s)))
        ]);
        
        const dedupeById = <T extends { id: string }>(arrays: { data: T[] }[]) => {
          const map = new Map<string, T>();
          for (const result of arrays) {
            for (const item of result.data) {
              if (!map.has(item.id)) map.set(item.id, item);
            }
          }
          return Array.from(map.values());
        };
        
        return {
          success: true,
          data: {
            activities: dedupeById(activitiesBySpecies),
            symptoms: dedupeById(symptomsBySpecies),
            vetVisits: dedupeById(vetVisitsBySpecies),
            medications: dedupeById(medicationsBySpecies)
          }
        };
      }

      // Species specified: fetch all lookup types in parallel for that species
      const [activitiesResult, symptomsResult, vetVisitsResult, medicationsResult] = await Promise.all([
        this.getActivityTypes(species),
        this.getSymptomTypes(species),
        this.getVetVisitTypes(species),
        this.getMedicationTypes(species)
      ]);

      return {
        success: true,
        data: {
          activities: activitiesResult.data,
          symptoms: symptomsResult.data,
          vetVisits: vetVisitsResult.data,
          medications: medicationsResult.data
        }
      };
    } catch (error) {
      console.error('Error fetching all lookup types:', error);
      throw error;
    }
  }
  
  // === HELPER METHODS ===
  
  /**
   * Validate that a type ID exists in the appropriate lookup table
   */
  private async validateTypeId(recordType: string, typeId: string) {
    let table;
    
    switch (recordType) {
      case 'activity':
        table = activityTypes;
        break;
      case 'symptom':
        table = symptomTypes;
        break;
      case 'vet_visit':
        table = vetVisitTypes;
        break;
      case 'medication':
        table = medicationTypes;
        break;
      default:
        throw new Error(`Invalid record type: ${recordType}`);
    }
    
    const [type] = await db
      .select({ id: table.id })
      .from(table)
      .where(and(eq(table.id, typeId), eq(table.isActive, true)))
      .limit(1);
    
    if (!type) {
      throw new Error(`Invalid ${recordType} type ID: ${typeId}`);
    }
  }
  
  /**
   * Enrich records with type information from lookup tables
   */
  private async enrichRecordsWithTypeInfo(records: any[]) {
    if (!records.length) return records;
    
    const enrichedRecords = [];
    
    for (const record of records) {
      let typeInfo = null;
      
      try {
        switch (record.recordType) {
          case 'activity':
            const [activity] = await db
              .select()
              .from(activityTypes)
              .where(eq(activityTypes.id, record.typeId))
              .limit(1);
            typeInfo = activity;
            break;
          case 'symptom':
            const [symptom] = await db
              .select()
              .from(symptomTypes)
              .where(eq(symptomTypes.id, record.typeId))
              .limit(1);
            typeInfo = symptom;
            break;
          case 'vet_visit':
            const [vetVisit] = await db
              .select()
              .from(vetVisitTypes)
              .where(eq(vetVisitTypes.id, record.typeId))
              .limit(1);
            typeInfo = vetVisit;
            break;
          case 'medication':
            const [medication] = await db
              .select()
              .from(medicationTypes)
              .where(eq(medicationTypes.id, record.typeId))
              .limit(1);
            typeInfo = medication;
            break;
        }
      } catch (error) {
        console.warn(`Failed to fetch type info for record ${record.id}:`, error);
      }
      
      enrichedRecords.push({
        ...record,
        typeInfo
      });
    }
    
    return enrichedRecords;
  }
}

export const petRecordService = new PetRecordService();
