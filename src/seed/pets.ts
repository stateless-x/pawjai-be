// === PETS SEED DATA ===
// Sample pet data for testing and development

import { db } from '../db';
import { pets, breeds } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface SeedPetsOptions {
  clearExisting?: boolean;
}

// Note: These breed IDs will be dynamically assigned when breeds are seeded
// We'll need to fetch them from the database during seeding
const samplePets = [
  {
    userId: '550e8400-e29b-41d4-a716-446655440001', // John Doe
    name: 'Buddy',
    species: 'dog' as const,
    dateOfBirth: '2020-03-15',
    weightKg: '28.5',
    gender: 'male' as const,
    neutered: true,
    notes: 'Very friendly and loves to play fetch. Great with children.',
    imageUrl: 'https://example.com/pets/buddy.jpg',
    breedNameEn: 'Golden Retriever' // We'll use this to find the breed ID
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440001', // John Doe
    name: 'Luna',
    species: 'cat' as const,
    dateOfBirth: '2021-07-22',
    weightKg: '4.2',
    gender: 'female' as const,
    neutered: true,
    notes: 'Independent cat that loves to sit by the window.',
    imageUrl: 'https://example.com/pets/luna.jpg',
    breedNameEn: 'Persian'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440002', // Jane Smith
    name: 'Max',
    species: 'dog' as const,
    dateOfBirth: '2019-11-08',
    weightKg: '32.0',
    gender: 'male' as const,
    neutered: true,
    notes: 'Energetic Labrador who loves swimming and retrieving.',
    imageUrl: 'https://example.com/pets/max.jpg',
    breedNameEn: 'Labrador Retriever'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440003', // Somchai Jai
    name: 'Milo',
    species: 'cat' as const,
    dateOfBirth: '2022-01-30',
    weightKg: '3.8',
    gender: 'male' as const,
    neutered: false,
    notes: 'Playful kitten that loves chasing laser pointers.',
    imageUrl: 'https://example.com/pets/milo.jpg',
    breedNameEn: 'Siamese'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440004', // Somsri Dee
    name: 'Bella',
    species: 'dog' as const,
    dateOfBirth: '2020-09-12',
    weightKg: '25.0',
    gender: 'female' as const,
    neutered: true,
    notes: 'Gentle Poodle who loves grooming sessions.',
    imageUrl: 'https://example.com/pets/bella.jpg',
    breedNameEn: 'Poodle'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440005', // Alex Johnson
    name: 'Shadow',
    species: 'cat' as const,
    dateOfBirth: '2021-04-18',
    weightKg: '6.5',
    gender: 'male' as const,
    neutered: true,
    notes: 'Large Maine Coon who acts like a dog - follows me everywhere.',
    imageUrl: 'https://example.com/pets/shadow.jpg',
    breedNameEn: 'Maine Coon'
  }
];

export async function seedPets(options: SeedPetsOptions = {}) {
  const { clearExisting = false } = options;

  try {
    if (clearExisting) {
      console.log('🗑️ Clearing existing pets...');
      await db.delete(pets);
    }

    // Check if pets already exist
    const existingPets = await db.select().from(pets).limit(1);
    if (existingPets.length > 0 && !clearExisting) {
      console.log('ℹ️ Pets already exist, skipping...');
      return;
    }

    // First, get all breeds to map names to IDs
    const allBreeds = await db.select({ id: breeds.id, nameEn: breeds.nameEn }).from(breeds);
    const breedMap = new Map(allBreeds.map(breed => [breed.nameEn, breed.id]));

    console.log('🐕 Inserting pets...');
    
    for (const petData of samplePets) {
      const { breedNameEn, ...petInsertData } = petData;
      
      // Find the breed ID by name
      const breedId = breedMap.get(breedNameEn);
      
      if (!breedId) {
        console.warn(`⚠️ Warning: Breed "${breedNameEn}" not found, skipping pet "${petInsertData.name}"`);
        continue;
      }

      await db.insert(pets).values({
        ...petInsertData,
        breedId
      });
    }

    console.log(`✅ Successfully seeded ${samplePets.length} pets`);
  } catch (error) {
    console.error('❌ Error seeding pets:', error);
    throw error;
  }
} 