// === USERS SEED DATA ===
// Sample user profiles for testing and development

import { db } from '../db';
import { userProfiles } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface SeedUserProfilesOptions {
  clearExisting?: boolean;
}

const sampleUserProfiles = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+66812345678',
    birthDate: '1990-05-15',
    gender: 'male' as const,
    profileImage: 'https://example.com/profiles/john-doe.jpg'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+66823456789',
    birthDate: '1992-08-22',
    gender: 'female' as const,
    profileImage: 'https://example.com/profiles/jane-smith.jpg'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    firstName: 'Somchai',
    lastName: 'Jai',
    phoneNumber: '+66834567890',
    birthDate: '1988-12-10',
    gender: 'male' as const,
    profileImage: 'https://example.com/profiles/somchai-jai.jpg'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    firstName: 'Somsri',
    lastName: 'Dee',
    phoneNumber: '+66845678901',
    birthDate: '1995-03-28',
    gender: 'female' as const,
    profileImage: 'https://example.com/profiles/somsri-dee.jpg'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    firstName: 'Alex',
    lastName: 'Johnson',
    phoneNumber: '+66856789012',
    birthDate: '1991-07-14',
    gender: 'other' as const,
    profileImage: 'https://example.com/profiles/alex-johnson.jpg'
  }
];

export async function seedUserProfiles(options: SeedUserProfilesOptions = {}) {
  const { clearExisting = false } = options;

  try {
    if (clearExisting) {
      console.log('🗑️ Clearing existing user profiles...');
      await db.delete(userProfiles);
    }

    // Check if user profiles already exist
    const existingProfiles = await db.select().from(userProfiles).limit(1);
    if (existingProfiles.length > 0 && !clearExisting) {
      console.log('ℹ️ User profiles already exist, skipping...');
      return;
    }

    console.log('👤 Inserting user profiles...');
    await db.insert(userProfiles).values(sampleUserProfiles);

    console.log(`✅ Successfully seeded ${sampleUserProfiles.length} user profiles`);
  } catch (error) {
    console.error('❌ Error seeding user profiles:', error);
    throw error;
  }
} 