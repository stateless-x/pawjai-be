// === PET RECORD LOOKUPS SEED DATA ===
// Seed data for activity_types, symptom_types, vet_visit_types, and medication_types tables

import { db } from '../db';
import { 
  activityTypes, 
  symptomTypes, 
  vetVisitTypes, 
  medicationTypes,
  NewActivityType,
  NewSymptomType,
  NewVetVisitType,
  NewMedicationType
} from '../db/schema';

// === ACTIVITY TYPES ===
export const activityTypesData: Omit<NewActivityType, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Dog Activities
  {
    species: 'dog',
    nameEn: 'Walk',
    nameTh: 'เดินเล่น',
    descriptionEn: 'A purposeful walk or run; useful to track duration and intensity.',
    descriptionTh: 'พาเจ้าตูบไปเดินเล่นหรือวิ่งออกกำลังกาย จะได้รู้ว่านานแค่ไหนและหนักแค่ไหน',
    iconUrl: '',
    isActive: true,
    sortOrder: 1
  },
  {
    species: 'dog',
    nameEn: 'Training Session',
    nameTh: 'ฝึกฝน',
    descriptionEn: 'Focused obedience or skills practice; log length and skill focus.',
    descriptionTh: 'ฝึกให้เจ้าตูบเชื่อฟังหรือทำตามคำสั่ง บันทึกเวลาที่ใช้และทักษะที่ฝึก',
    iconUrl: '',
    isActive: true,
    sortOrder: 2
  },
  {
    species: 'dog',
    nameEn: 'Feeding',
    nameTh: 'กินอาหาร',
    descriptionEn: 'Meal or snack; useful to track portions, timing, and diet changes.',
    descriptionTh: 'มื้ออาหารหรือขนม ใช้ติดตามปริมาณ เวลา และการเปลี่ยนแปลงสูตรอาหาร',
    iconUrl: '',
    isActive: true,
    sortOrder: 3
  },
  {
    species: 'dog',
    nameEn: 'Rest',
    nameTh: 'พักผ่อน',
    descriptionEn: 'Track nap or nighttime sleep; helpful for monitoring energy and recovery.',
    descriptionTh: 'บันทึกการนอนกลางวันหรือกลางคืน เพื่อติดตามพลังงานและการฟื้นตัว',
    iconUrl: '',
    isActive: true,
    sortOrder: 4
  },
  {
    species: 'dog',
    nameEn: 'Bathroom',
    nameTh: 'อึ',
    descriptionEn: 'Bowel movement; useful to track time, consistency, and changes.',
    descriptionTh: 'บันทึกเวลาและลักษณะของอุนจิ เพื่อดูความเปลี่ยนแปลง',
    iconUrl: '',
    isActive: true,
    sortOrder: 5
  },
  {
    species: 'dog',
    nameEn: 'Pee',
    nameTh: 'ฉี่',
    descriptionEn: 'Urination; track frequency and notable changes (e.g., very frequent).',
    descriptionTh: 'บันทึกความบ่อยและดูว่ามีอะไรผิดปกติมั้ย',
    iconUrl: '',
    isActive: true,
    sortOrder: 6
  },
  {
    species: 'dog',
    nameEn: 'Enrichment',
    nameTh: 'ฝึกสมอง',
    descriptionEn: 'Mental stimulation like snuffle mats, puzzle feeders, scent games.',
    descriptionTh: 'หากิจกรรมที่ช่วยให้เจ้าตูบได้ใช้สมอง เช่น เล่นเกมหาของหรือของเล่นแบบที่มีปริศนา',
    iconUrl: '',
    isActive: true,
    sortOrder: 7
  },
  {
    species: 'dog',
    nameEn: 'Socialization',
    nameTh: 'เข้าสังคม',
    descriptionEn: 'New people/dogs or new environments; helpful for behavior tracking.',
    descriptionTh: 'ให้เจ้าตูบได้เจอคนใหม่ๆ หรือหมาตัวอื่น รวมถึงไปสถานที่ใหม่ๆ จะได้ติดตามพฤติกรรมได้ง่ายขึ้น',
    iconUrl: '',
    isActive: true,
    sortOrder: 8
  },
  {
    species: 'cat',
    nameEn: 'Feeding',
    nameTh: 'กินอาหาร',
    descriptionEn: 'Meal or snack; useful to track portions, timing, and diet changes.',
    descriptionTh: 'มื้ออาหารหรือขนม ใช้ติดตามปริมาณ เวลา และการเปลี่ยนแปลงสูตรอาหาร',
    iconUrl: '',
    isActive: true,
    sortOrder: 1
  },
  {
    species: 'cat',
    nameEn: 'Rest',
    nameTh: 'พักผ่อน',
    descriptionEn: 'Track nap or nighttime sleep; helpful for monitoring energy and recovery.',
    descriptionTh: 'บันทึกการนอนกลางวันหรือกลางคืน เพื่อติดตามพลังงานและการฟื้นตัว',
    iconUrl: '',
    isActive: true,
    sortOrder: 2
  },
  {
    species: 'cat',
    nameEn: 'Play',
    nameTh: 'เล่น',
    descriptionEn: 'Interactive play with toys or humans; good for exercise and bonding.',
    descriptionTh: 'การเล่นกับของเล่นหรือคน ช่วยออกกำลังกายและสร้างความสัมพันธ์',
    iconUrl: '',
    isActive: true,
    sortOrder: 3
  },
  {
    species: 'cat',
    nameEn: 'Grooming',
    nameTh: 'ทำความสะอาดตัว',
    descriptionEn: 'Self-grooming or owner-assisted brushing; useful for noticing over-grooming.',
    descriptionTh: 'การเลียขนเองหรือแปรงขนโดยเจ้าของ ให้สังเกตอาการถ้าหากน้องมีอาการเลียตัวมากจนเกินไป',
    iconUrl: '',
    isActive: true,
    sortOrder: 4
  },
  {
    species: 'cat',
    nameEn: 'Bathroom',
    nameTh: 'อึ',
    descriptionEn: 'Bowel movement; useful to track time, consistency, and changes.',
    descriptionTh: 'บันทึกเวลาและลักษณะของอุนจิ เพื่อดูความเปลี่ยนแปลง',
    iconUrl: '',
    isActive: true,
    sortOrder: 5
  },
  {
    species: 'cat',
    nameEn: 'Pee',
    nameTh: 'ฉี่',
    descriptionEn: 'Urination; track frequency and notable changes (e.g., very frequent).',
    descriptionTh: 'บันทึกความบ่อยและดูว่ามีอะไรผิดปกติมั้ย',
    iconUrl: '',
    isActive: true,
    sortOrder: 6
  },
  {
    species: 'cat',
    nameEn: 'Scratching',
    nameTh: 'ลับเล็บ',
    descriptionEn: 'Using scratching posts or furniture; useful to track habits and prevent issues.',
    descriptionTh: 'การลับเล็บกับเสาหรือเฟอร์นิเจอร์ ใช้ติดตามพฤติกรรมและป้องกันปัญหา',
    iconUrl: '',
    isActive: true,
    sortOrder: 7
  },
  {
    species: 'cat',
    nameEn: 'Socialization',
    nameTh: 'เข้าสังคม',
    descriptionEn: 'Interaction with people, other pets, or new environments; helpful for behavior tracking.',
    descriptionTh: 'การพบปะคน สัตว์เลี้ยงตัวอื่น หรือไปสถานที่ใหม่ๆ ใช้ติดตามพฤติกรรม',
    iconUrl: '',
    isActive: true,
    sortOrder: 8
  }
];

// === SYMPTOM TYPES ===
export const symptomTypesData: Omit<NewSymptomType, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Common symptoms (both species)
  {
    species: null,
    nameEn: 'Vomiting',
    nameTh: 'อาเจียน',
    descriptionEn: 'Throwing up food or liquid',
    descriptionTh: 'อาเจียนอาหารหรือของเหลว',
    iconUrl: null,
    severity: 'moderate',
    isActive: true,
    sortOrder: 1
  },
  {
    species: null,
    nameEn: 'Diarrhea',
    nameTh: 'ท้องเสียส',
    descriptionEn: 'Loose or watery stool',
    descriptionTh: 'อุจจาระเหลวหรือมีน้ำมาก',
    iconUrl: null,
    severity: 'moderate',
    isActive: true,
    sortOrder: 2
  },
  {
    species: null,
    nameEn: 'Loss of Appetite',
    nameTh: 'เบื่ออาหาร',
    descriptionEn: 'Not eating normally',
    descriptionTh: 'ไม่กินอาหารตามปกติ',
    iconUrl: null,
    severity: 'mild',
    isActive: true,
    sortOrder: 3
  },
  {
    species: null,
    nameEn: 'Lethargy',
    nameTh: 'อ่อนเพลีย',
    descriptionEn: 'Lack of energy or enthusiasm',
    descriptionTh: 'ขาดพลังงานหรือความกระปรี้กระเปร่า',
    iconUrl: null,
    severity: 'mild',
    isActive: true,
    sortOrder: 4
  },
  {
    species: null,
    nameEn: 'Excessive Scratching',
    nameTh: 'เกาตัวมาก',
    descriptionEn: 'Scratching more than usual',
    descriptionTh: 'เกาตัวมากกว่าปกติ',
    iconUrl: null,
    severity: 'mild',
    isActive: true,
    sortOrder: 5
  },
  {
    species: null,
    nameEn: 'Coughing',
    nameTh: 'ไอ',
    descriptionEn: 'Persistent coughing',
    descriptionTh: 'ไอติดต่อกัน',
    iconUrl: null,
    severity: 'moderate',
    isActive: true,
    sortOrder: 6
  },
  {
    species: null,
    nameEn: 'Limping',
    nameTh: 'เดินกะเผลก',
    descriptionEn: 'Difficulty walking or favoring one leg',
    descriptionTh: 'เดินลำบากหรือเอียงเฉพาะขาข้างหนึ่ง',
    iconUrl: null,
    severity: 'moderate',
    isActive: true,
    sortOrder: 7
  },
  {
    species: null,
    nameEn: 'Difficulty Breathing',
    nameTh: 'หายใจลำบาก',
    descriptionEn: 'Labored or rapid breathing',
    descriptionTh: 'หายใจหนักหรือเร็วผิดปกติ',
    iconUrl: null,
    severity: 'severe',
    isActive: true,
    sortOrder: 8
  },
  {
    species: null,
    nameEn: 'Seizures',
    nameTh: 'ชัก',
    descriptionEn: 'Episodes of uncontrolled movement',
    descriptionTh: 'อาการชักหรือการเคลื่อนไหวที่ควบคุมไม่ได้',
    iconUrl: null,
    severity: 'emergency',
    isActive: true,
    sortOrder: 9
  },

  // Dog-specific symptoms
  {
    species: 'dog',
    nameEn: 'Excessive Barking',
    nameTh: 'เห่ามากเกินไป',
    descriptionEn: 'Barking more than usual',
    descriptionTh: 'เห่ามากกว่าปกติ',
    iconUrl: null,
    severity: 'mild',
    isActive: true,
    sortOrder: 10
  },
  {
    species: 'dog',
    nameEn: 'Excessive Drooling',
    nameTh: 'น้ำลายไหลมาก',
    descriptionEn: 'More saliva production than normal',
    descriptionTh: 'มีน้ำลายมากกว่าปกติ',
    iconUrl: null,
    severity: 'mild',
    isActive: true,
    sortOrder: 11
  },

  // Cat-specific symptoms  
  {
    species: 'cat',
    nameEn: 'Excessive Meowing',
    nameTh: 'ร้องเมี๊ยวมาก',
    descriptionEn: 'Meowing more than usual',
    descriptionTh: 'ร้องเมี๊ยวมากกว่าปกติ',
    iconUrl: null,
    severity: 'mild',
    isActive: true,
    sortOrder: 12
  },
  {
    species: 'cat',
    nameEn: 'Litter Box Issues',
    nameTh: 'ปัญหากระบะทราย',
    descriptionEn: 'Not using litter box properly',
    descriptionTh: 'ไม่ใช้กระบะทรายอย่างถูกต้อง',
    iconUrl: null,
    severity: 'moderate',
    isActive: true,
    sortOrder: 13
  },
  {
    species: 'cat',
    nameEn: 'Hairballs',
    nameTh: 'ขนคลื่น',
    descriptionEn: 'Coughing up hairballs',
    descriptionTh: 'อาเจียนก้อนขน',
    iconUrl: null,
    severity: 'mild',
    isActive: true,
    sortOrder: 14
  }
];

// === VET VISIT TYPES ===
export const vetVisitTypesData: Omit<NewVetVisitType, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Routine visits
  {
    species: null,
    nameEn: 'Annual Check-up',
    nameTh: 'ตรวจสุขภาพประจำปี',
    descriptionEn: 'Yearly comprehensive health examination',
    descriptionTh: 'ตรวจสุขภาพครบรอบประจำปี',
    iconUrl: null,
    isRoutine: true,
    isActive: true,
    sortOrder: 1
  },
  {
    species: null,
    nameEn: 'Vaccination',
    nameTh: 'ฉีดวัคซีน',
    descriptionEn: 'Regular vaccination appointment',
    descriptionTh: 'การนัดฉีดวัคซีนตามกำหนด',
    iconUrl: null,
    isRoutine: true,
    isActive: true,
    sortOrder: 2
  },
  {
    species: null,
    nameEn: 'Dental Cleaning',
    nameTh: 'ทำความสะอาดฟัน',
    descriptionEn: 'Professional dental cleaning',
    descriptionTh: 'ทำความสะอาดฟันโดยผู้เชี่ยวชาญ',
    iconUrl: null,
    isRoutine: true,
    isActive: true,
    sortOrder: 3
  },
  {
    species: null,
    nameEn: 'Grooming',
    nameTh: 'ตัดแต่งขน',
    descriptionEn: 'Professional grooming service',
    descriptionTh: 'บริการตัดแต่งขนโดยผู้เชี่ยวชาญ',
    iconUrl: null,
    isRoutine: true,
    isActive: true,
    sortOrder: 4
  },

  // Medical visits
  {
    species: null,
    nameEn: 'Emergency Visit',
    nameTh: 'เยี่ยมฉุกเฉิน',
    descriptionEn: 'Urgent medical attention needed',
    descriptionTh: 'ต้องการความช่วยเหลือทางการแพทย์ด่วน',
    iconUrl: null,
    isRoutine: false,
    isActive: true,
    sortOrder: 5
  },
  {
    species: null,
    nameEn: 'Illness Treatment',
    nameTh: 'รักษาอาการป่วย',
    descriptionEn: 'Treatment for specific illness',
    descriptionTh: 'การรักษาอาการป่วยเฉพาะ',
    iconUrl: null,
    isRoutine: false,
    isActive: true,
    sortOrder: 6
  },
  {
    species: null,
    nameEn: 'Surgery',
    nameTh: 'ผ่าตัด',
    descriptionEn: 'Surgical procedure',
    descriptionTh: 'การผ่าตัด',
    iconUrl: null,
    isRoutine: false,
    isActive: true,
    sortOrder: 7
  },
  {
    species: null,
    nameEn: 'Follow-up Visit',
    nameTh: 'นัดติดตาม',
    descriptionEn: 'Follow-up after treatment',
    descriptionTh: 'การนัดติดตามหลังการรักษา',
    iconUrl: null,
    isRoutine: false,
    isActive: true,
    sortOrder: 8
  },
  {
    species: null,
    nameEn: 'Blood Work',
    nameTh: 'ตรวจเลือด',
    descriptionEn: 'Blood tests and analysis',
    descriptionTh: 'การตรวจและวิเคราะห์เลือด',
    iconUrl: null,
    isRoutine: false,
    isActive: true,
    sortOrder: 9
  },
  {
    species: null,
    nameEn: 'X-Ray/Imaging',
    nameTh: 'เอ็กซเรย์/ถ่ายภาพ',
    descriptionEn: 'Diagnostic imaging procedures',
    descriptionTh: 'การถ่ายภาพเพื่อการวินิจฉัย',
    iconUrl: null,
    isRoutine: false,
    isActive: true,
    sortOrder: 10
  },

  // Specialized services
  {
    species: 'dog',
    nameEn: 'Spay/Neuter',
    nameTh: 'ทำหมัน',
    descriptionEn: 'Sterilization procedure',
    descriptionTh: 'การทำหมัน',
    iconUrl: null,
    isRoutine: false,
    isActive: true,
    sortOrder: 11
  },
  {
    species: 'cat',
    nameEn: 'Spay/Neuter',
    nameTh: 'ทำหมัน',
    descriptionEn: 'Sterilization procedure',
    descriptionTh: 'การทำหมัน',
    iconUrl: null,
    isRoutine: false,
    isActive: true,
    sortOrder: 11
  }
];

// === MEDICATION TYPES ===
export const medicationTypesData: Omit<NewMedicationType, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Preventive medications
  {
    species: null,
    nameEn: 'Heartworm Prevention',
    nameTh: 'ป้องกันพยาธิหัวใจ',
    descriptionEn: 'Monthly heartworm preventive medication',
    descriptionTh: 'ยาป้องกันพยาธิหัวใจรายเดือน',
    iconUrl: null,
    category: 'preventive',
    requiresPrescription: true,
    isActive: true,
    sortOrder: 1
  },
  {
    species: null,
    nameEn: 'Flea & Tick Prevention',
    nameTh: 'ป้องกันหมัดและเห็บ',
    descriptionEn: 'Monthly flea and tick preventive',
    descriptionTh: 'ยาป้องกันหมัดและเห็บรายเดือน',
    iconUrl: null,
    category: 'preventive',
    requiresPrescription: true,
    isActive: true,
    sortOrder: 2
  },
  {
    species: null,
    nameEn: 'Deworming',
    nameTh: 'ถ่ายพยาธิ',
    descriptionEn: 'Intestinal parasite treatment',
    descriptionTh: 'การรักษาพยาธิในลำไส้',
    iconUrl: null,
    category: 'preventive',
    requiresPrescription: true,
    isActive: true,
    sortOrder: 3
  },

  // Treatment medications
  {
    species: null,
    nameEn: 'Antibiotics',
    nameTh: 'ยาปฏิชีวนะ',
    descriptionEn: 'Bacterial infection treatment',
    descriptionTh: 'การรักษาการติดเชื้อแบคทีเรีย',
    iconUrl: null,
    category: 'treatment',
    requiresPrescription: true,
    isActive: true,
    sortOrder: 4
  },
  {
    species: null,
    nameEn: 'Pain Medication',
    nameTh: 'ยาแก้ปวด',
    descriptionEn: 'Pain relief medication',
    descriptionTh: 'ยาบรรเทาอาการปวด',
    iconUrl: null,
    category: 'treatment',
    requiresPrescription: true,
    isActive: true,
    sortOrder: 5
  },
  {
    species: null,
    nameEn: 'Anti-inflammatory',
    nameTh: 'ยาแก้อักเสบ',
    descriptionEn: 'Reduces inflammation',
    descriptionTh: 'ลดการอักเสบ',
    iconUrl: null,
    category: 'treatment',
    requiresPrescription: true,
    isActive: true,
    sortOrder: 6
  },
  {
    species: null,
    nameEn: 'Allergy Medication',
    nameTh: 'ยาแก้แพ้',
    descriptionEn: 'Antihistamine for allergic reactions',
    descriptionTh: 'ยาแอนติฮิสตามีนสำหรับอาการแพ้',
    iconUrl: null,
    category: 'treatment',
    requiresPrescription: true,
    isActive: true,
    sortOrder: 7
  },
  {
    species: null,
    nameEn: 'Eye Drops/Ointment',
    nameTh: 'ยาหยอดตา/ครีมทาตา',
    descriptionEn: 'Topical eye medication',
    descriptionTh: 'ยาทาหรือหยอดตาภายนอก',
    iconUrl: null,
    category: 'treatment',
    requiresPrescription: true,
    isActive: true,
    sortOrder: 8
  },
  {
    species: null,
    nameEn: 'Ear Medication',
    nameTh: 'ยาหู',
    descriptionEn: 'Ear infection or cleaning treatment',
    descriptionTh: 'การรักษาการติดเชื้อหูหรือทำความสะอาดหู',
    iconUrl: null,
    category: 'treatment',
    requiresPrescription: true,
    isActive: true,
    sortOrder: 9
  },

  // Supplements
  {
    species: null,
    nameEn: 'Joint Supplement',
    nameTh: 'อาหารเสริมข้อต่อ',
    descriptionEn: 'Joint health support supplement',
    descriptionTh: 'อาหารเสริมบำรุงข้อต่อ',
    iconUrl: null,
    category: 'supplement',
    requiresPrescription: false,
    isActive: true,
    sortOrder: 10
  },
  {
    species: null,
    nameEn: 'Probiotic',
    nameTh: 'โปรไบโอติก',
    descriptionEn: 'Digestive health supplement',
    descriptionTh: 'อาหารเสริมระบบย่อยอาหาร',
    iconUrl: null,
    category: 'supplement',
    requiresPrescription: false,
    isActive: true,
    sortOrder: 11
  },
  {
    species: null,
    nameEn: 'Omega-3 Supplement',
    nameTh: 'อาหารเสริมโอเมก้า 3',
    descriptionEn: 'Skin and coat health supplement',
    descriptionTh: 'อาหารเสริมบำรุงผิวหนังและขน',
    iconUrl: null,
    category: 'supplement',
    requiresPrescription: false,
    isActive: true,
    sortOrder: 12
  },
  {
    species: null,
    nameEn: 'Multivitamin',
    nameTh: 'วิตามินรวม',
    descriptionEn: 'General health supplement',
    descriptionTh: 'อาหารเสริมวิตามินทั่วไป',
    iconUrl: null,
    category: 'supplement',
    requiresPrescription: false,
    isActive: true,
    sortOrder: 13
  }
];

// === SEEDING FUNCTIONS ===
export async function seedActivityTypes() {
  console.log('🎾 Seeding activity types...');
  
  try {
    await db.insert(activityTypes).values(activityTypesData);
    console.log(`✅ Successfully seeded ${activityTypesData.length} activity types`);
  } catch (error) {
    console.error('❌ Error seeding activity types:', error);
    throw error;
  }
}

export async function seedSymptomTypes() {
  console.log('🩺 Seeding symptom types...');
  
  try {
    await db.insert(symptomTypes).values(symptomTypesData);
    console.log(`✅ Successfully seeded ${symptomTypesData.length} symptom types`);
  } catch (error) {
    console.error('❌ Error seeding symptom types:', error);
    throw error;
  }
}

export async function seedVetVisitTypes() {
  console.log('🏥 Seeding vet visit types...');
  
  try {
    await db.insert(vetVisitTypes).values(vetVisitTypesData);
    console.log(`✅ Successfully seeded ${vetVisitTypesData.length} vet visit types`);
  } catch (error) {
    console.error('❌ Error seeding vet visit types:', error);
    throw error;
  }
}

export async function seedMedicationTypes() {
  console.log('💊 Seeding medication types...');
  
  try {
    await db.insert(medicationTypes).values(medicationTypesData);
    console.log(`✅ Successfully seeded ${medicationTypesData.length} medication types`);
  } catch (error) {
    console.error('❌ Error seeding medication types:', error);
    throw error;
  }
}

export async function seedAllPetRecordLookups() {
  console.log('🗃️ Starting pet record lookups seeding...');
  
  try {
    await seedActivityTypes();
    await seedSymptomTypes();
    await seedVetVisitTypes();
    await seedMedicationTypes();
    
    console.log('✅ All pet record lookups seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding pet record lookups:', error);
    throw error;
  }
}

// === CLEAR FUNCTIONS ===
export async function clearPetRecordLookups() {
  console.log('🗑️ Clearing pet record lookup tables...');
  
  try {
    await db.delete(medicationTypes);
    await db.delete(vetVisitTypes);
    await db.delete(symptomTypes);
    await db.delete(activityTypes);
    
    console.log('✅ Pet record lookup tables cleared');
  } catch (error) {
    console.error('❌ Error clearing pet record lookup tables:', error);
    throw error;
  }
} 