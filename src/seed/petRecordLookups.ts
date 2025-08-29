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
  // Dog-specific symptoms
  {
    species: 'dog',
    nameEn: 'Vomiting',
    nameTh: 'อาเจียน',
    descriptionEn: 'Pet vomits or brings up food/liquid; important to track frequency and causes.',
    descriptionTh: 'สัตว์เลี้ยงอาเจียนหรือสำรอกอาหาร/น้ำ ควรบันทึกความถี่และสาเหตุ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/dog-vomit.webp',
    severity: 'moderate',
    isActive: true,
    sortOrder: 1
  },
  {
    species: 'dog',
    nameEn: 'Diarrhea',
    nameTh: 'ท้องเสีย',
    descriptionEn: 'Loose or watery stool; useful to monitor digestive health and hydration risks.',
    descriptionTh: 'อุจจาระเหลวหรือน้ำ ควรติดตามสุขภาพทางเดินอาหารและความเสี่ยงการขาดน้ำ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/diahrrea.webp',
    severity: 'moderate',
    isActive: true,
    sortOrder: 2
  },
  {
    species: 'dog',
    nameEn: 'Loss of Appetite',
    nameTh: 'ไม่กินอาหาร',
    descriptionEn: 'Pet refuses or eats significantly less food than usual.',
    descriptionTh: 'สัตว์เลี้ยงไม่ยอมกินหรือกินน้อยกว่าปกติอย่างมาก',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/dog-no-eat.webp',
    severity: 'mild',
    isActive: true,
    sortOrder: 3
  },
  {
    species: 'dog',
    nameEn: 'Coughing/Sneezing',
    nameTh: 'ไอ/จาม',
    descriptionEn: 'Respiratory signs such as coughing, gagging, or repeated sneezing.',
    descriptionTh: 'อาการทางระบบหายใจ เช่น ไอ สำลัก หรือจามบ่อย',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/dog-sneeze.webp',
    severity: 'moderate',
    isActive: true,
    sortOrder: 4
  },
  {
    species: 'dog',
    nameEn: 'Lethargy',
    nameTh: 'อ่อนเพลีย',
    descriptionEn: 'Unusual tiredness, low activity, or reluctance to move/play.',
    descriptionTh: 'เหนื่อยง่าย ซึม ไม่ค่อยขยับหรือเล่นเหมือนปกติ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/dog-lethargy.webp',
    severity: 'mild',
    isActive: true,
    sortOrder: 5
  },
  {
    species: 'dog',
    nameEn: 'Excessive Scratching/Grooming',
    nameTh: 'เกา/เลียมากผิดปกติ',
    descriptionEn: 'Persistent scratching, licking, or chewing at skin/fur; may signal allergies or parasites.',
    descriptionTh: 'เกาหรือเลียตัวมากผิดปกติ อาจบ่งบอกถึงภูมิแพ้หรือปรสิต',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/dog-scratch.webp',
    severity: 'mild',
    isActive: true,
    sortOrder: 6
  },

  // Cat-specific symptoms
  {
    species: 'cat',
    nameEn: 'Vomiting',
    nameTh: 'อาเจียน',
    descriptionEn: 'Pet vomits or brings up food/liquid; important to track frequency and causes.',
    descriptionTh: 'สัตว์เลี้ยงอาเจียนหรือสำรอกอาหาร/น้ำ ควรบันทึกความถี่และสาเหตุ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/cat-vomit.webp',
    severity: 'moderate',
    isActive: true,
    sortOrder: 1
  },
  {
    species: 'cat',
    nameEn: 'Diarrhea',
    nameTh: 'ท้องเสีย',
    descriptionEn: 'Loose or watery stool; useful to monitor digestive health and hydration risks.',
    descriptionTh: 'อุจจาระเหลวหรือน้ำ ควรติดตามสุขภาพทางเดินอาหารและความเสี่ยงการขาดน้ำ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/diahrrea.webp',
    severity: 'moderate',
    isActive: true,
    sortOrder: 2
  },
  {
    species: 'cat',
    nameEn: 'Loss of Appetite',
    nameTh: 'ไม่กินอาหาร',
    descriptionEn: 'Pet refuses or eats significantly less food than usual.',
    descriptionTh: 'สัตว์เลี้ยงไม่ยอมกินหรือกินน้อยกว่าปกติอย่างมาก',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/cat-no-eat.webp',
    severity: 'mild',
    isActive: true,
    sortOrder: 3
  },
  {
    species: 'cat',
    nameEn: 'Coughing/Sneezing',
    nameTh: 'ไอ/จาม',
    descriptionEn: 'Respiratory signs such as coughing, gagging, or repeated sneezing.',
    descriptionTh: 'อาการทางระบบหายใจ เช่น ไอ สำลัก หรือจามบ่อย',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/cat-cough.webp',
    severity: 'moderate',
    isActive: true,
    sortOrder: 4
  },
  {
    species: 'cat',
    nameEn: 'Lethargy',
    nameTh: 'อ่อนเพลีย',
    descriptionEn: 'Unusual tiredness, low activity, or reluctance to move/play.',
    descriptionTh: 'เหนื่อยง่าย ซึม ไม่ค่อยขยับหรือเล่นเหมือนปกติ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/cat-lethargy.webp',
    severity: 'mild',
    isActive: true,
    sortOrder: 5
  },
  {
    species: 'cat',
    nameEn: 'Excessive Scratching/Grooming',
    nameTh: 'เกา/เลียมากผิดปกติ',
    descriptionEn: 'Persistent scratching, licking, or chewing at skin/fur; may signal allergies or parasites.',
    descriptionTh: 'เกาหรือเลียตัวมากผิดปกติ อาจบ่งบอกถึงภูมิแพ้หรือปรสิต',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Symptom/cat-scratch.webp',
    severity: 'mild',
    isActive: true,
    sortOrder: 6
  }
];

// === VET VISIT TYPES ===
export const vetVisitTypesData: Omit<NewVetVisitType, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Dog vet visit types
  {
    species: 'dog',
    nameEn: 'Vaccination',
    nameTh: 'ฉีดวัคซีน',
    descriptionEn: 'Core or booster shots such as rabies and distemper.',
    descriptionTh: 'การฉีดวัคซีนหลักหรือกระตุ้น เช่น โรคพิษสุนัขบ้าและไข้หัด',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/vaccination.webp',
    isRoutine: true,
    isActive: true,
    sortOrder: 1
  },
  {
    species: 'dog',
    nameEn: 'Illness / Injury',
    nameTh: 'ป่วย/บาดเจ็บ',
    descriptionEn: 'Visit due to sickness, infection, stomach issues, or accidents.',
    descriptionTh: 'พบสัตวแพทย์เนื่องจากเจ็บป่วย ติดเชื้อ ปัญหาท้อง หรืออุบัติเหตุ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/injured.webp',
    isRoutine: false,
    isActive: true,
    sortOrder: 2
  },
  {
    species: 'dog',
    nameEn: 'Routine Check-up',
    nameTh: 'ตรวจสุขภาพประจำปี',
    descriptionEn: 'General wellness exam and physical check-up.',
    descriptionTh: 'การตรวจสุขภาพและตรวจร่างกายทั่วไป',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/follow-up.webp',
    isRoutine: true,
    isActive: true,
    sortOrder: 3
  },
  {
    species: 'dog',
    nameEn: 'Follow-up Visit',
    nameTh: 'ติดตามผลตรวจ',
    descriptionEn: 'Re-check after surgery, treatment, or recovery monitoring.',
    descriptionTh: 'ตรวจซ้ำหลังการผ่าตัด การรักษา หรือเฝ้าระวังการฟื้นตัว',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/follow-up.webp',
    isRoutine: false,
    isActive: true,
    sortOrder: 4
  },
  {
    species: 'dog',
    nameEn: 'Diagnostic Tests',
    nameTh: 'ผลแล็บ',
    descriptionEn: 'Blood work, X-ray, ultrasound, or laboratory analysis.',
    descriptionTh: 'การตรวจเลือด เอ็กซเรย์ อัลตราซาวด์ หรือการวิเคราะห์ในห้องแล็บ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/diagosis.webp',
    isRoutine: false,
    isActive: true,
    sortOrder: 5
  },
  {
    species: 'dog',
    nameEn: 'Surgery',
    nameTh: 'ผ่าตัด',
    descriptionEn: 'Operations such as spay/neuter, dental cleaning, or lump removal.',
    descriptionTh: 'การผ่าตัด เช่น ทำหมัน ขูดหินปูน หรือผ่าก้อนเนื้อ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/surgery.webp',
    isRoutine: false,
    isActive: true,
    sortOrder: 6
  },

  // Cat vet visit types
  {
    species: 'cat',
    nameEn: 'Vaccination',
    nameTh: 'ฉีดวัคซีน',
    descriptionEn: 'Core or booster shots such as rabies and distemper.',
    descriptionTh: 'การฉีดวัคซีนหลักหรือกระตุ้น เช่น โรคพิษสุนัขบ้าและไข้หัด',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/vaccination.webp',
    isRoutine: true,
    isActive: true,
    sortOrder: 1
  },
  {
    species: 'cat',
    nameEn: 'Illness / Injury',
    nameTh: 'ป่วย/บาดเจ็บ',
    descriptionEn: 'Visit due to sickness, infection, stomach issues, or accidents.',
    descriptionTh: 'พบสัตวแพทย์เนื่องจากเจ็บป่วย ติดเชื้อ ปัญหาท้อง หรืออุบัติเหตุ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/injured.webp',
    isRoutine: false,
    isActive: true,
    sortOrder: 2
  },
  {
    species: 'cat',
    nameEn: 'Routine Check-up',
    nameTh: 'ตรวจสุขภาพประจำปี',
    descriptionEn: 'General wellness exam and physical check-up.',
    descriptionTh: 'การตรวจสุขภาพและตรวจร่างกายทั่วไป',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/routine-checkup.webp',
    isRoutine: true,
    isActive: true,
    sortOrder: 3
  },
  {
    species: 'cat',
    nameEn: 'Follow-up Visit',
    nameTh: 'ติดตามผลตรวจ',
    descriptionEn: 'Re-check after surgery, treatment, or recovery monitoring.',
    descriptionTh: 'ตรวจซ้ำหลังการผ่าตัด การรักษา หรือเฝ้าระวังการฟื้นตัว',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/follow-up.webp',
    isRoutine: false,
    isActive: true,
    sortOrder: 4
  },
  {
    species: 'cat',
    nameEn: 'Diagnostic Tests',
    nameTh: 'ผลแล็บ',
    descriptionEn: 'Blood work, X-ray, ultrasound, or laboratory analysis.',
    descriptionTh: 'การตรวจเลือด เอ็กซเรย์ อัลตราซาวด์ หรือการวิเคราะห์ในห้องแล็บ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/diagosis.webp',
    isRoutine: false,
    isActive: true,
    sortOrder: 5
  },
  {
    species: 'cat',
    nameEn: 'Surgery',
    nameTh: 'ผ่าตัด',
    descriptionEn: 'Operations such as spay/neuter, dental cleaning, or lump removal.',
    descriptionTh: 'การผ่าตัด เช่น ทำหมัน ขูดหินปูน หรือผ่าก้อนเนื้อ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Vet-visit/surgery.webp',
    isRoutine: false,
    isActive: true,
    sortOrder: 6
  }
];

// === MEDICATION TYPES ===
export const medicationTypesData: Omit<NewMedicationType, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Dog medication types
  {
    species: 'dog',
    nameEn: 'General Medication',
    nameTh: 'ยาทั่วไป',
    descriptionEn: 'Any prescribed medicine given by a vet, including antibiotics, pain relief, or other short-term treatments.',
    descriptionTh: 'ยาที่สัตวแพทย์สั่งใช้ ไม่ว่าจะเป็นยาปฏิชีวนะ ยาแก้ปวด หรือยาสำหรับการรักษาระยะสั้น',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Medication/general-med.webp',
    isActive: true,
    sortOrder: 1
  },
  {
    species: 'dog',
    nameEn: 'Parasite Control',
    nameTh: 'ยาป้องกันปรสิต',
    descriptionEn: 'Covers dewormers, heartworm preventives, flea and tick medications.',
    descriptionTh: 'ยาถ่ายพยาธิ ยาป้องกันพยาธิหนอนหัวใจ และยากำจัดหมัด/เห็บ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Medication/parasite-med.webp',
    isActive: true,
    sortOrder: 2
  },
  {
    species: 'dog',
    nameEn: 'Supplements / Vitamins',
    nameTh: 'อาหารเสริม',
    descriptionEn: 'Nutritional support such as joint care, skin and coat health, or immunity boosters.',
    descriptionTh: 'อาหารเสริมบำรุงสุขภาพ เช่น บำรุงข้อ ผิวหนัง ขน หรือเสริมภูมิคุ้มกัน',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Medication/vitamins.webp',
    isActive: true,
    sortOrder: 3
  },
  {
    species: 'dog',
    nameEn: 'Chronic Condition Medication',
    nameTh: 'ยาโรคเรื้อรัง',
    descriptionEn: 'Long-term medications for conditions like diabetes, thyroid, or heart disease.',
    descriptionTh: 'ยาที่ใช้ต่อเนื่องสำหรับโรคเรื้อรัง เช่น เบาหวาน ไทรอยด์ หรือโรคหัวใจ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Medication/chronic-med.webp',
    isActive: true,
    sortOrder: 4
  },

  // Cat medication types
  {
    species: 'cat',
    nameEn: 'General Medication',
    nameTh: 'ยาทั่วไป',
    descriptionEn: 'Any prescribed medicine given by a vet, including antibiotics, pain relief, or other short-term treatments.',
    descriptionTh: 'ยาที่สัตวแพทย์สั่งใช้ ไม่ว่าจะเป็นยาปฏิชีวนะ ยาแก้ปวด หรือยาสำหรับการรักษาระยะสั้น',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Medication/general-med.webp',
    isActive: true,
    sortOrder: 1
  },
  {
    species: 'cat',
    nameEn: 'Parasite Control',
    nameTh: 'ยาป้องกันปรสิต',
    descriptionEn: 'Covers dewormers, heartworm preventives, flea and tick medications.',
    descriptionTh: 'ยาถ่ายพยาธิ ยาป้องกันพยาธิหนอนหัวใจ และยากำจัดหมัด/เห็บ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Medication/parasite-med.webp',
    isActive: true,
    sortOrder: 2
  },
  {
    species: 'cat',
    nameEn: 'Supplements / Vitamins',
    nameTh: 'อาหารเสริม',
    descriptionEn: 'Nutritional support such as joint care, skin and coat health, or immunity boosters.',
    descriptionTh: 'อาหารเสริมบำรุงสุขภาพ เช่น บำรุงข้อ ผิวหนัง ขน หรือเสริมภูมิคุ้มกัน',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Medication/vitamins.webp',
    isActive: true,
    sortOrder: 3
  },
  {
    species: 'cat',
    nameEn: 'Chronic Condition Medication',
    nameTh: 'ยาโรคเรื้อรัง',
    descriptionEn: 'Long-term medications for conditions like diabetes, thyroid, or heart disease.',
    descriptionTh: 'ยาที่ใช้ต่อเนื่องสำหรับโรคเรื้อรัง เช่น เบาหวาน ไทรอยด์ หรือโรคหัวใจ',
    iconUrl: 'https://pawjai.b-cdn.net/WebAssets/Lookups/Medication/chronic-med.webp',
    isActive: true,
    sortOrder: 4
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