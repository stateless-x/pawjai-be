// === LOOKUP TYPE TYPES ===
// Type definitions for lookup types (activities, symptoms, vet visits, medications)

import { 
  ActivityType, 
  SymptomType, 
  VetVisitType, 
  MedicationType,
  NewActivityType,
  NewSymptomType,
  NewVetVisitType,
  NewMedicationType
} from '../db/schema';
import { 
  LookupType as LookupTypeEnum,
  LookupTypeSortBy,
  SortOrder,
  SymptomSeverity,
  MedicationCategory
} from '../constants/enums';

// === CORE TYPES ===
export type LookupType = LookupTypeEnum;

export type LookupTypeData = ActivityType | SymptomType | VetVisitType | MedicationType;
export type NewLookupTypeData = NewActivityType | NewSymptomType | NewVetVisitType | NewMedicationType;

// === QUERY PARAMETERS ===
export interface LookupTypeQueryParams {
  species?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: LookupTypeSortBy;
  sortOrder?: SortOrder;
  limit?: number;
  offset?: number;
  category?: MedicationCategory; // For medications
  severity?: SymptomSeverity; // For symptoms
  isRoutine?: boolean; // For vet visits
  requiresPrescription?: boolean; // For medications
}

// === RESPONSE TYPES ===
export interface LookupTypeResponse<T = LookupTypeData> {
  success: boolean;
  data: T;
  count?: number;
}

export interface LookupTypeListResponse<T = LookupTypeData> {
  success: boolean;
  data: T[];
  count: number;
}

export interface LookupTypeStatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    inactive: number;
  };
}

export interface AllLookupTypesForSpeciesResponse {
  success: boolean;
  data: {
    activities: ActivityType[];
    symptoms: SymptomType[];
    vetVisits: VetVisitType[];
    medications: MedicationType[];
  };
}

// === CREATE/UPDATE TYPES ===
export interface CreateLookupTypeData {
  species?: string;
  nameEn: string;
  nameTh: string;
  descriptionEn?: string;
  descriptionTh?: string;
  iconUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateSymptomTypeData extends CreateLookupTypeData {
  severity?: SymptomSeverity;
}

export interface CreateVetVisitTypeData extends CreateLookupTypeData {
  isRoutine?: boolean;
}

export interface CreateMedicationTypeData extends CreateLookupTypeData {
  category?: MedicationCategory;
  requiresPrescription?: boolean;
}

export type CreateLookupTypeRequest = 
  | { type: 'activity'; data: CreateLookupTypeData }
  | { type: 'symptom'; data: CreateSymptomTypeData }
  | { type: 'vet_visit'; data: CreateVetVisitTypeData }
  | { type: 'medication'; data: CreateMedicationTypeData };

// === UPDATE TYPES ===
export type UpdateLookupTypeData = Partial<CreateLookupTypeData>;
export type UpdateSymptomTypeData = Partial<CreateSymptomTypeData>;
export type UpdateVetVisitTypeData = Partial<CreateVetVisitTypeData>;
export type UpdateMedicationTypeData = Partial<CreateMedicationTypeData>;

export type UpdateLookupTypeRequest = 
  | { type: 'activity'; data: UpdateLookupTypeData }
  | { type: 'symptom'; data: UpdateSymptomTypeData }
  | { type: 'vet_visit'; data: UpdateVetVisitTypeData }
  | { type: 'medication'; data: UpdateMedicationTypeData };

// === BULK OPERATION TYPES ===
export interface BulkCreateLookupTypeRequest {
  type: LookupType;
  data: CreateLookupTypeData[];
}

export interface BulkCreateLookupTypeResponse {
  success: boolean;
  data: LookupTypeData[];
  count: number;
}

// === ERROR TYPES ===
export interface LookupTypeError {
  success: false;
  error: string;
  details?: any;
}

// === UTILITY TYPES ===
export type LookupTypeWithId = LookupTypeData & { id: string };

export type LookupTypeFilter = {
  [K in keyof LookupTypeQueryParams]: LookupTypeQueryParams[K];
};

// === API RESPONSE TYPES ===
export type LookupTypeApiResponse<T = LookupTypeData> = 
  | LookupTypeResponse<T>
  | LookupTypeListResponse<T>
  | LookupTypeStatsResponse
  | AllLookupTypesForSpeciesResponse
  | LookupTypeError;

// === FASTIFY ROUTE PARAMETER TYPES ===
export interface LookupTypeParams {
  type: string;
}

export interface LookupTypeIdParams extends LookupTypeParams {
  id: string;
}

export interface LookupTypeQuery {
  species?: string;
  isActive?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: string;
  offset?: string;
  category?: string;
  severity?: string;
  isRoutine?: string;
  requiresPrescription?: string;
} 