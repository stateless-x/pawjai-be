// === USER PERSONALIZATION SEED DATA ===
// Sample user personalization data for testing and development

import { db } from '../db';
import { userPersonalization } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface SeedUserPersonalizationOptions {
  clearExisting?: boolean;
}

const sampleUserPersonalization = [
  {
    userId: '550e8400-e29b-41d4-a716-446655440001', // John Doe
    houseType: 'apartment',
    homeEnvironment: ['indoor', 'balcony'],
    petPurpose: ['companionship', 'family'],
    monthlyBudget: '2000-5000',
    ownerLifestyle: 'moderate',
    ownerPetExperience: 'beginner',
    priority: ['health', 'temperament'],
    referralSource: 'social_media'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440002', // Jane Smith
    houseType: 'house',
    homeEnvironment: ['indoor', 'garden', 'outdoor'],
    petPurpose: ['companionship', 'guard', 'family'],
    monthlyBudget: '5000-10000',
    ownerLifestyle: 'active',
    ownerPetExperience: 'intermediate',
    priority: ['activity_level', 'training'],
    referralSource: 'friend'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440003', // Somchai Jai
    houseType: 'condo',
    homeEnvironment: ['indoor'],
    petPurpose: ['companionship'],
    monthlyBudget: '1000-3000',
    ownerLifestyle: 'busy',
    ownerPetExperience: 'beginner',
    priority: ['low_maintenance', 'size'],
    referralSource: 'online_search'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440004', // Somsri Dee
    houseType: 'house',
    homeEnvironment: ['indoor', 'garden'],
    petPurpose: ['family', 'companionship'],
    monthlyBudget: '3000-7000',
    ownerLifestyle: 'moderate',
    ownerPetExperience: 'advanced',
    priority: ['health', 'temperament', 'training'],
    referralSource: 'veterinarian'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440005', // Alex Johnson
    houseType: 'apartment',
    homeEnvironment: ['indoor', 'rooftop'],
    petPurpose: ['companionship', 'therapy'],
    monthlyBudget: '4000-8000',
    ownerLifestyle: 'active',
    ownerPetExperience: 'intermediate',
    priority: ['temperament', 'health', 'size'],
    referralSource: 'pet_store'
  }
];

export async function seedUserPersonalization(options: SeedUserPersonalizationOptions = {}) {
  const { clearExisting = false } = options;

  try {
    if (clearExisting) {
      console.log('🗑️ Clearing existing user personalization...');
      await db.delete(userPersonalization);
    }

    // Check if user personalization already exists
    const existingPersonalization = await db.select().from(userPersonalization).limit(1);
    if (existingPersonalization.length > 0 && !clearExisting) {
      console.log('ℹ️ User personalization already exists, skipping...');
      return;
    }

    console.log('⚙️ Inserting user personalization...');
    await db.insert(userPersonalization).values(sampleUserPersonalization);

    console.log(`✅ Successfully seeded ${sampleUserPersonalization.length} user personalization records`);
  } catch (error) {
    console.error('❌ Error seeding user personalization:', error);
    throw error;
  }
} 