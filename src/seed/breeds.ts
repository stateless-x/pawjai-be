// === BREEDS SEED DATA ===
// Comprehensive breed data for dogs and cats with new schema structure

import { db } from '../db';
import { breeds, dogBreedDetails, catBreedDetails } from '../db/schema';
import { eq } from 'drizzle-orm';
import { 
  SPECIES_ENUM, 
  SIZE_ENUM, 
  ACTIVITY_LEVEL_ENUM, 
  GROOMING_NEEDS_ENUM, 
  TRAINING_DIFFICULTY_ENUM
} from '../constants';

export interface SeedBreedsOptions {
  clearExisting?: boolean;
}

const dogBreeds = [
  {
    // Shared breed data
    breed: {
      species: 'dog' as const,
      nameEn: 'Golden Retriever',
      nameTh: 'โกลเดน รีทรีฟเวอร์',
      descriptionEn: 'Friendly, intelligent, and devoted family dogs known for their golden coats and gentle temperament.',
      descriptionTh: 'สุนัขครอบครัวที่เป็นมิตร ฉลาด และซื่อสัตย์ รู้จักกันดีจากขนสีทองและอารมณ์อ่อนโยน',
      lifespanMinYears: 10,
      lifespanMaxYears: 12,
      originCountry: 'United Kingdom'
    },
    // Dog-specific details
    dogDetails: {
      size: 'large' as const,
      weightMinKg: '25',
      weightMaxKg: '34',
      activityLevel: 'high' as const,
      groomingNeeds: 'moderate' as const,
      trainingDifficulty: 'easy' as const,
      temperamentEn: 'Friendly, intelligent, devoted, trustworthy, confident, kind',
      temperamentTh: 'เป็นมิตร ฉลาด ซื่อสัตย์ ไว้วางใจได้ มั่นใจ อ่อนโยน',
      feedingNotesEn: 'High-quality dog food with protein. Feed 2-3 cups daily for adults.',
      feedingNotesTh: 'อาหารสุนัขคุณภาพสูงที่มีโปรตีน ให้อาหาร 2-3 ถ้วยต่อวันสำหรับผู้ใหญ่',
      exerciseNeedsEn: 'Requires 1-2 hours of exercise daily including walks, play, and mental stimulation.',
      exerciseNeedsTh: 'ต้องการการออกกำลังกาย 1-2 ชั่วโมงต่อวัน รวมถึงการเดิน เล่น และการกระตุ้นจิตใจ',
      wellnessRoutineEn: 'Regular vet checkups, vaccinations, flea/tick prevention, dental care.',
      wellnessRoutineTh: 'ตรวจสุขภาพกับสัตวแพทย์เป็นประจำ ฉีดวัคซีน ป้องกันเห็บหมัด ดูแลสุขภาพฟัน'
    }
  },
  {
    breed: {
      species: 'dog' as const,
      nameEn: 'Labrador Retriever',
      nameTh: 'ลาบราดอร์ รีทรีฟเวอร์',
      descriptionEn: 'America\'s most popular dog breed, known for being excellent family pets and working dogs.',
      descriptionTh: 'สายพันธุ์สุนัขที่ได้รับความนิยมมากที่สุดในอเมริกา รู้จักกันดีในฐานะสัตว์เลี้ยงในครอบครัวและสุนัขทำงาน',
      lifespanMinYears: 10,
      lifespanMaxYears: 14,
      originCountry: 'Canada'
    },
    dogDetails: {
      size: 'large' as const,
      weightMinKg: '25',
      weightMaxKg: '36',
      activityLevel: 'high' as const,
      groomingNeeds: 'low' as const,
      trainingDifficulty: 'easy' as const,
      temperamentEn: 'Intelligent, even-tempered, family-friendly, active, loving',
      temperamentTh: 'ฉลาด อารมณ์ดี เป็นมิตรกับครอบครัว กระฉับกระเฉง รักใคร่',
      feedingNotesEn: 'High-protein diet. Feed 2.5-3 cups daily for adults.',
      feedingNotesTh: 'อาหารที่มีโปรตีนสูง ให้อาหาร 2.5-3 ถ้วยต่อวันสำหรับผู้ใหญ่',
      exerciseNeedsEn: 'Needs 1-2 hours of exercise daily including swimming, fetching, and walks.',
      exerciseNeedsTh: 'ต้องการการออกกำลังกาย 1-2 ชั่วโมงต่อวัน รวมถึงการว่ายน้ำ วิ่งไปเก็บ และการเดิน',
      wellnessRoutineEn: 'Regular vet visits, vaccinations, heartworm prevention, joint health monitoring.',
      wellnessRoutineTh: 'พบสัตวแพทย์เป็นประจำ ฉีดวัคซีน ป้องกันพยาธิหัวใจ ติดตามสุขภาพข้อต่อ'
    }
  },
  {
    breed: {
      species: 'dog' as const,
      nameEn: 'Poodle',
      nameTh: 'พูเดิล',
      descriptionEn: 'Highly intelligent and elegant dogs available in three sizes: toy, miniature, and standard.',
      descriptionTh: 'สุนัขที่ฉลาดมากและสง่างาม มีสามขนาด: ทอย มินิเจอร์ และสแตนดาร์ด',
      lifespanMinYears: 12,
      lifespanMaxYears: 15,
      originCountry: 'Germany'
    },
    dogDetails: {
      size: 'medium' as const,
      weightMinKg: '20',
      weightMaxKg: '32',
      activityLevel: 'moderate' as const,
      groomingNeeds: 'high' as const,
      trainingDifficulty: 'easy' as const,
      temperamentEn: 'Intelligent, active, proud, very faithful, good-natured',
      temperamentTh: 'ฉลาด กระฉับกระเฉง มีความภาคภูมิใจ ซื่อสัตย์มาก อารมณ์ดี',
      feedingNotesEn: 'High-quality food with omega-3 fatty acids. Feed 1.5-2.5 cups daily.',
      feedingNotesTh: 'อาหารคุณภาพสูงที่มีโอเมก้า 3 ให้อาหาร 1.5-2.5 ถ้วยต่อวัน',
      exerciseNeedsEn: 'Moderate exercise needs: daily walks, play sessions, and mental stimulation.',
      exerciseNeedsTh: 'ต้องการการออกกำลังกายปานกลาง: เดินทุกวัน เล่น และการกระตุ้นจิตใจ',
      wellnessRoutineEn: 'Regular grooming, vet checkups, dental care, skin health monitoring.',
      wellnessRoutineTh: 'ดูแลขนเป็นประจำ ตรวจสุขภาพกับสัตวแพทย์ ดูแลสุขภาพฟัน ติดตามสุขภาพผิว'
    }
  },
  {
    breed: {
      species: 'dog' as const,
      nameEn: 'Chihuahua',
      nameTh: 'ชิวาวา',
      descriptionEn: 'The world\'s smallest dog breed, known for their big personality in a tiny package.',
      descriptionTh: 'สายพันธุ์สุนัขที่เล็กที่สุดในโลก รู้จักกันดีจากบุคลิกที่โดดเด่นในร่างกายเล็ก',
      lifespanMinYears: 14,
      lifespanMaxYears: 16,
      originCountry: 'Mexico'
    },
    dogDetails: {
      size: 'toy' as const,
      weightMinKg: '1.5',
      weightMaxKg: '3',
      activityLevel: 'low' as const,
      groomingNeeds: 'low' as const,
      trainingDifficulty: 'moderate' as const,
      temperamentEn: 'Devoted, graceful, charming, alert, courageous',
      temperamentTh: 'ซื่อสัตย์ สง่างาม มีเสน่ห์ ตื่นตัว กล้าหาญ',
      feedingNotesEn: 'Small, frequent meals. Feed 1/4-1/2 cup daily in 2-3 meals.',
      feedingNotesTh: 'อาหารมื้อเล็กๆ บ่อยๆ ให้อาหาร 1/4-1/2 ถ้วยต่อวัน แบ่งเป็น 2-3 มื้อ',
      exerciseNeedsEn: 'Low exercise needs: short walks and indoor play sessions.',
      exerciseNeedsTh: 'ต้องการการออกกำลังกายน้อย: เดินสั้นๆ และเล่นในบ้าน',
      wellnessRoutineEn: 'Regular vet checkups, dental care, temperature monitoring, joint health.',
      wellnessRoutineTh: 'ตรวจสุขภาพกับสัตวแพทย์เป็นประจำ ดูแลสุขภาพฟัน ติดตามอุณหภูมิ สุขภาพข้อต่อ'
    }
  }
];

const catBreeds = [
  {
    breed: {
      species: 'cat' as const,
      nameEn: 'Persian',
      nameTh: 'เปอร์เซีย',
      descriptionEn: 'Long-haired cats known for their sweet, gentle personalities and distinctive flat faces.',
      descriptionTh: 'แมวขนยาวที่รู้จักกันดีจากบุคลิกที่หวาน อ่อนโยน และใบหน้าที่แบนโดดเด่น',
      lifespanMinYears: 12,
      lifespanMaxYears: 16,
      originCountry: 'Iran'
    },
    catDetails: {
      groomingNeeds: 'high' as const,
      temperamentEn: 'Quiet, gentle, affectionate, calm, dignified',
      temperamentTh: 'เงียบ อ่อนโยน รักใคร่ สงบ มีศักดิ์ศรี',
      feedingNotesEn: 'High-quality cat food. Feed 1/4-1/2 cup twice daily.',
      feedingNotesTh: 'อาหารแมวคุณภาพสูง ให้อาหาร 1/4-1/2 ถ้วยวันละ 2 ครั้ง'
    }
  },
  {
    breed: {
      species: 'cat' as const,
      nameEn: 'Siamese',
      nameTh: 'สยาม',
      descriptionEn: 'Elegant, vocal cats with distinctive color points and blue eyes.',
      descriptionTh: 'แมวที่สง่างาม มีเสียงดัง มีจุดสีโดดเด่นและตาสีฟ้า',
      lifespanMinYears: 15,
      lifespanMaxYears: 20,
      originCountry: 'Thailand'
    },
    catDetails: {
      groomingNeeds: 'low' as const,
      temperamentEn: 'Intelligent, social, vocal, affectionate, active',
      temperamentTh: 'ฉลาด ชอบเข้าสังคม มีเสียงดัง รักใคร่ กระฉับกระเฉง',
      feedingNotesEn: 'High-protein diet. Feed 1/3-1/2 cup twice daily.',
      feedingNotesTh: 'อาหารที่มีโปรตีนสูง ให้อาหาร 1/3-1/2 ถ้วยวันละ 2 ครั้ง'
    }
  },
  {
    breed: {
      species: 'cat' as const,
      nameEn: 'Maine Coon',
      nameTh: 'เมนคูน',
      descriptionEn: 'Large, gentle giants known for their thick fur, tufted ears, and dog-like personalities.',
      descriptionTh: 'ยักษ์ใหญ่ที่อ่อนโยน รู้จักกันดีจากขนหนา หูมีขน และบุคลิกเหมือนสุนัข',
      lifespanMinYears: 12,
      lifespanMaxYears: 15,
      originCountry: 'United States'
    },
    catDetails: {
      groomingNeeds: 'moderate' as const,
      temperamentEn: 'Gentle, friendly, intelligent, loyal, playful',
      temperamentTh: 'อ่อนโยน เป็นมิตร ฉลาด ซื่อสัตย์ ร่าเริง',
      feedingNotesEn: 'High-quality food for large cats. Feed 1/2-3/4 cup twice daily.',
      feedingNotesTh: 'อาหารคุณภาพสูงสำหรับแมวขนาดใหญ่ ให้อาหาร 1/2-3/4 ถ้วยวันละ 2 ครั้ง'
    }
  },
  {
    breed: {
      species: 'cat' as const,
      nameEn: 'British Shorthair',
      nameTh: 'บริติช ชอร์ตแฮร์',
      descriptionEn: 'Calm, easygoing cats with round faces and dense, plush coats.',
      descriptionTh: 'แมวที่สงบ ง่ายๆ มีใบหน้ากลมและขนหนา นุ่ม',
      lifespanMinYears: 14,
      lifespanMaxYears: 20,
      originCountry: 'United Kingdom'
    },
    catDetails: {
      groomingNeeds: 'low' as const,
      temperamentEn: 'Calm, affectionate, loyal, quiet, independent',
      temperamentTh: 'สงบ รักใคร่ ซื่อสัตย์ เงียบ เป็นอิสระ',
      feedingNotesEn: 'Balanced diet. Feed 1/3-1/2 cup twice daily, monitor weight.',
      feedingNotesTh: 'อาหารที่สมดุล ให้อาหาร 1/3-1/2 ถ้วยวันละ 2 ครั้ง ติดตามน้ำหนัก'
    }
  }
];

export async function seedBreeds(options: SeedBreedsOptions = {}) {
  const { clearExisting = false } = options;

  try {
    if (clearExisting) {
      console.log('🗑️ Clearing existing breeds...');
      await db.delete(dogBreedDetails);
      await db.delete(catBreedDetails);
      await db.delete(breeds);
    }

    // Check if breeds already exist
    const existingBreeds = await db.select().from(breeds).limit(1);
    if (existingBreeds.length > 0 && !clearExisting) {
      console.log('ℹ️ Breeds already exist, skipping...');
      return;
    }

    console.log('📝 Inserting dog breeds...');
    for (const dogBreed of dogBreeds) {
      // Insert the breed first
      const newBreed = await db.insert(breeds).values(dogBreed.breed).returning();
      
      // Insert dog-specific details
      await db.insert(dogBreedDetails).values({
        breedId: newBreed[0].id,
        ...dogBreed.dogDetails
      });
    }

    console.log('📝 Inserting cat breeds...');
    for (const catBreed of catBreeds) {
      // Insert the breed first
      const newBreed = await db.insert(breeds).values(catBreed.breed).returning();
      
      // Insert cat-specific details
      await db.insert(catBreedDetails).values({
        breedId: newBreed[0].id,
        ...catBreed.catDetails
      });
    }

    console.log(`✅ Successfully seeded ${dogBreeds.length + catBreeds.length} breeds`);
  } catch (error) {
    console.error('❌ Error seeding breeds:', error);
    throw error;
  }
} 