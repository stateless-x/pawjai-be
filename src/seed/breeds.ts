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

export const breedData = [
  // Dog Breeds
  {
    species: 'dog' as const,
    nameEn: 'Golden Retriever',
    nameTh: 'โกลเด้น รีทรีฟเวอร์',
    descriptionEn: 'Friendly, intelligent, and devoted family dogs',
    descriptionTh: 'สุนัขที่ใจดี ฉลาด และซื่อสัตย์ต่อครอบครัว',
    lifespanMinYears: 10,
    lifespanMaxYears: 12,
    originCountry: 'Scotland',
    dogDetails: {
      size: 'large' as const,
      weightMinKg: '25',
      weightMaxKg: '34',
      activityLevel: 'high' as const,
      groomingNeeds: 'moderate' as const,
      trainingDifficulty: 'easy' as const,
      temperamentEn: 'Friendly, intelligent, devoted',
      temperamentTh: 'ใจดี ฉลาด ซื่อสัตย์',
      feedingNotesEn: 'High-quality dog food, 2-3 cups daily',
      feedingNotesTh: 'อาหารสุนัขคุณภาพสูง 2-3 ถ้วยต่อวัน',
      exerciseNeedsEn: 'Daily walks and playtime, loves swimming',
      exerciseNeedsTh: 'เดินเล่นทุกวัน ชอบว่ายน้ำ',
      wellnessRoutineEn: 'Regular vet check-ups, grooming every 6-8 weeks',
      wellnessRoutineTh: 'ตรวจสุขภาพสม่ำเสมอ ตัดขนทุก 6-8 สัปดาห์',
    }
  },
  {
    species: 'dog' as const,
    nameEn: 'Labrador Retriever',
    nameTh: 'ลาบราดอร์ รีทรีฟเวอร์',
    descriptionEn: 'Outgoing, even-tempered, and athletic',
    descriptionTh: 'เป็นมิตร อารมณ์ดี และแข็งแรง',
    lifespanMinYears: 10,
    lifespanMaxYears: 14,
    originCountry: 'Canada',
    dogDetails: {
      size: 'large' as const,
      weightMinKg: '25',
      weightMaxKg: '36',
      activityLevel: 'high' as const,
      groomingNeeds: 'low' as const,
      trainingDifficulty: 'easy' as const,
      temperamentEn: 'Outgoing, even-tempered, athletic',
      temperamentTh: 'เป็นมิตร อารมณ์ดี แข็งแรง',
      feedingNotesEn: 'Quality dog food, watch portion control',
      feedingNotesTh: 'อาหารสุนัขคุณภาพดี ควบคุมปริมาณ',
      exerciseNeedsEn: 'Daily exercise, loves retrieving games',
      exerciseNeedsTh: 'ออกกำลังกายทุกวัน ชอบเล่นเกมส์',
      wellnessRoutineEn: 'Regular exercise, dental care important',
      wellnessRoutineTh: 'ออกกำลังกายสม่ำเสมอ ดูแลฟันเป็นสำคัญ',
    }
  },
  {
    species: 'dog' as const,
    nameEn: 'Beagle',
    nameTh: 'บีเกิล',
    descriptionEn: 'Curious, friendly, and great with families',
    descriptionTh: 'ขี้สงสัย เป็นมิตร และดีกับครอบครัว',
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'England',
    dogDetails: {
      size: 'small' as const,
      weightMinKg: '9',
      weightMaxKg: '11',
      activityLevel: 'moderate' as const,
      groomingNeeds: 'low' as const,
      trainingDifficulty: 'moderate' as const,
      temperamentEn: 'Curious, friendly, determined',
      temperamentTh: 'ขี้สงสัย เป็นมิตร มุ่งมั่น',
      feedingNotesEn: 'Moderate portions, prone to obesity',
      feedingNotesTh: 'ปริมาณปานกลาง มีแนวโน้มอ้วนง่าย',
      exerciseNeedsEn: 'Daily walks, mental stimulation needed',
      exerciseNeedsTh: 'เดินเล่นทุกวัน ต้องการการกระตุ้นสมอง',
      wellnessRoutineEn: 'Regular vet visits, ear cleaning important',
      wellnessRoutineTh: 'พบสัตวแพทย์สม่ำเสมอ ทำความสะอาดหูเป็นสำคัญ',
    }
  },
  {
    species: 'dog' as const,
    nameEn: 'Rottweiler',
    nameTh: 'ร็อตไวเลอร์',
    descriptionEn: 'Loyal, confident, and protective',
    descriptionTh: 'ซื่อสัตย์ มั่นใจ และปกป้อง',
    lifespanMinYears: 8,
    lifespanMaxYears: 10,
    originCountry: 'Germany',
    dogDetails: {
      size: 'large' as const,
      weightMinKg: '35',
      weightMaxKg: '60',
      activityLevel: 'moderate' as const,
      groomingNeeds: 'low' as const,
      trainingDifficulty: 'moderate' as const,
      temperamentEn: 'Loyal, confident, protective',
      temperamentTh: 'ซื่อสัตย์ มั่นใจ ปกป้อง',
      feedingNotesEn: 'High-quality food, controlled portions',
      feedingNotesTh: 'อาหารคุณภาพสูง ควบคุมปริมาณ',
      exerciseNeedsEn: 'Daily exercise, training important',
      exerciseNeedsTh: 'ออกกำลังกายทุกวัน การฝึกเป็นสำคัญ',
      wellnessRoutineEn: 'Regular exercise, socialization needed',
      wellnessRoutineTh: 'ออกกำลังกายสม่ำเสมอ ต้องการการเข้าสังคม',
    }
  },
  {
    species: 'dog' as const,
    nameEn: 'Pomeranian',
    nameTh: 'พอเมอเรเนียน',
    descriptionEn: 'Lively, bold, and affectionate',
    descriptionTh: 'มีชีวิตชีวา กล้าหาญ และรักใคร่',
    lifespanMinYears: 12,
    lifespanMaxYears: 16,
    originCountry: 'Germany',
    dogDetails: {
      size: 'toy' as const,
      weightMinKg: '1.5',
      weightMaxKg: '3',
      activityLevel: 'moderate' as const,
      groomingNeeds: 'high' as const,
      trainingDifficulty: 'moderate' as const,
      temperamentEn: 'Lively, bold, affectionate',
      temperamentTh: 'มีชีวิตชีวา กล้าหาญ รักใคร่',
      feedingNotesEn: 'Small portions, high-quality food',
      feedingNotesTh: 'ปริมาณน้อย อาหารคุณภาพสูง',
      exerciseNeedsEn: 'Moderate exercise, indoor play',
      exerciseNeedsTh: 'ออกกำลังกายปานกลาง เล่นในบ้าน',
      wellnessRoutineEn: 'Regular grooming, dental care',
      wellnessRoutineTh: 'ตัดขนสม่ำเสมอ ดูแลฟัน',
    }
  },
  {
    species: 'dog' as const,
    nameEn: 'Thai Bangkaew',
    nameTh: 'ไทยบางแก้ว',
    descriptionEn: 'Loyal, intelligent, and protective Thai breed',
    descriptionTh: 'ซื่อสัตย์ ฉลาด และปกป้อง สายพันธุ์ไทย',
    lifespanMinYears: 10,
    lifespanMaxYears: 14,
    originCountry: 'Thailand',
    dogDetails: {
      size: 'medium' as const,
      weightMinKg: '16',
      weightMaxKg: '26',
      activityLevel: 'high' as const,
      groomingNeeds: 'moderate' as const,
      trainingDifficulty: 'moderate' as const,
      temperamentEn: 'Loyal, intelligent, protective',
      temperamentTh: 'ซื่อสัตย์ ฉลาด ปกป้อง',
      feedingNotesEn: 'Quality dog food, traditional Thai diet options',
      feedingNotesTh: 'อาหารสุนัขคุณภาพดี อาหารไทยแบบดั้งเดิม',
      exerciseNeedsEn: 'Daily exercise, loves outdoor activities',
      exerciseNeedsTh: 'ออกกำลังกายทุกวัน ชอบกิจกรรมกลางแจ้ง',
      wellnessRoutineEn: 'Regular vet care, traditional Thai care methods',
      wellnessRoutineTh: 'ดูแลสุขภาพสม่ำเสมอ วิธีดูแลแบบไทยดั้งเดิม',
    }
  },
  // Cat Breeds
  {
    species: 'cat' as const,
    nameEn: 'Persian',
    nameTh: 'เปอร์เซีย',
    descriptionEn: 'Gentle, quiet, and affectionate long-haired cats',
    descriptionTh: 'นุ่มนวล เงียบ และรักใคร่ แมวขนยาว',
    lifespanMinYears: 12,
    lifespanMaxYears: 16,
    originCountry: 'Iran',
    catDetails: {
      groomingNeeds: 'high' as const,
      temperamentEn: 'Gentle, quiet, affectionate',
      temperamentTh: 'นุ่มนวล เงียบ รักใคร่',
      feedingNotesEn: 'High-quality cat food, regular grooming',
      feedingNotesTh: 'อาหารแมวคุณภาพสูง ตัดขนสม่ำเสมอ',
    }
  },
  {
    species: 'cat' as const,
    nameEn: 'Siamese',
    nameTh: 'สยาม',
    descriptionEn: 'Intelligent, vocal, and social cats',
    descriptionTh: 'ฉลาด พูดเก่ง และเข้าสังคม',
    lifespanMinYears: 15,
    lifespanMaxYears: 20,
    originCountry: 'Thailand',
    catDetails: {
      groomingNeeds: 'low' as const,
      temperamentEn: 'Intelligent, vocal, social',
      temperamentTh: 'ฉลาด พูดเก่ง เข้าสังคม',
      feedingNotesEn: 'Quality cat food, interactive feeding',
      feedingNotesTh: 'อาหารแมวคุณภาพสูง การให้อาหารแบบโต้ตอบ',
    }
  },
  {
    species: 'cat' as const,
    nameEn: 'Maine Coon',
    nameTh: 'เมนคูน',
    descriptionEn: 'Large, gentle giants with thick fur',
    descriptionTh: 'ตัวใหญ่ นุ่มนวล ขนหนา',
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'United States',
    catDetails: {
      groomingNeeds: 'high' as const,
      temperamentEn: 'Gentle, intelligent, playful',
      temperamentTh: 'นุ่มนวล ฉลาด เล่นเก่ง',
      feedingNotesEn: 'High-quality food, regular grooming needed',
      feedingNotesTh: 'อาหารคุณภาพสูง ต้องการการตัดขนสม่ำเสมอ',
    }
  },
  {
    species: 'cat' as const,
    nameEn: 'British Shorthair',
    nameTh: 'บริติช ชอร์ตแฮร์',
    descriptionEn: 'Calm, easygoing, and independent',
    descriptionTh: 'สงบ ง่ายๆ และเป็นอิสระ',
    lifespanMinYears: 14,
    lifespanMaxYears: 20,
    originCountry: 'United Kingdom',
    catDetails: {
      groomingNeeds: 'low' as const,
      temperamentEn: 'Calm, easygoing, independent',
      temperamentTh: 'สงบ ง่ายๆ เป็นอิสระ',
      feedingNotesEn: 'Quality cat food, watch weight',
      feedingNotesTh: 'อาหารแมวคุณภาพดี ระวังน้ำหนัก',
    }
  },
  {
    species: 'cat' as const,
    nameEn: 'Scottish Fold',
    nameTh: 'สกอตติช โฟลด์',
    descriptionEn: 'Sweet, gentle, and distinctive folded ears',
    descriptionTh: 'น่ารัก นุ่มนวล และหูพับเป็นเอกลักษณ์',
    lifespanMinYears: 11,
    lifespanMaxYears: 14,
    originCountry: 'Scotland',
    catDetails: {
      groomingNeeds: 'moderate' as const,
      temperamentEn: 'Sweet, gentle, intelligent',
      temperamentTh: 'น่ารัก นุ่มนวล ฉลาด',
      feedingNotesEn: 'Quality food, regular health monitoring',
      feedingNotesTh: 'อาหารคุณภาพดี ตรวจสุขภาพสม่ำเสมอ',
    }
  },
  {
    species: 'cat' as const,
    nameEn: 'Tabby',
    nameTh: 'แท็บบี้',
    descriptionEn: 'Classic striped pattern, various personalities',
    descriptionTh: 'ลายทางแบบคลาสสิก บุคลิกหลากหลาย',
    lifespanMinYears: 12,
    lifespanMaxYears: 18,
    originCountry: 'Various',
    catDetails: {
      groomingNeeds: 'low' as const,
      temperamentEn: 'Varied, adaptable, independent',
      temperamentTh: 'หลากหลาย ปรับตัวได้ เป็นอิสระ',
      feedingNotesEn: 'Standard cat care, personality varies',
      feedingNotesTh: 'การดูแลแมวมาตรฐาน บุคลิกหลากหลาย',
    }
  },
];

export async function seedBreeds(options?: { clearExisting?: boolean }) {
  console.log('🌱 Seeding breeds...');
  
  try {
    // Clear existing breeds if requested
    if (options?.clearExisting) {
      console.log('🗑️ Clearing existing breeds...');
      await db.delete(dogBreedDetails);
      await db.delete(catBreedDetails);
      await db.delete(breeds);
    }
    for (const breedInfo of breedData) {
      const { dogDetails, catDetails, ...breedData } = breedInfo;
      
      // Insert breed
      const [breed] = await db
        .insert(breeds)
        .values(breedData)
        .returning();
      
      console.log(`✅ Inserted breed: ${breed.nameEn}`);
      
      // Insert species-specific details
      if (breedInfo.species === 'dog' && dogDetails) {
        await db
          .insert(dogBreedDetails)
          .values({
            breedId: breed.id,
            ...dogDetails,
          });
        console.log(`✅ Added dog details for: ${breed.nameEn}`);
      } else if (breedInfo.species === 'cat' && catDetails) {
        await db
          .insert(catBreedDetails)
          .values({
            breedId: breed.id,
            ...catDetails,
          });
        console.log(`✅ Added cat details for: ${breed.nameEn}`);
      }
    }
    
    console.log('✅ Breeds seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding breeds:', error);
    throw error;
  }
} 