// === BREEDS SEED DATA ===
// Top 20 popular dog and cat breeds with comprehensive details

import { db } from '../db';
import { breeds, dogBreedDetails, catBreedDetails } from '../db/schema';
import { eq } from 'drizzle-orm';

export type Species = 'dog' | 'cat';

type BaseBreed = {
  species: Species;
  nameEn: string;
  nameTh: string;
  descriptionEn: string;
  descriptionTh: string;
  imageUrl: string[];
  lifespanMinYears: number;
  lifespanMaxYears: number;
  originCountry: string;
};

export type DogBreed = BaseBreed & {
  dogDetails: {
    energyLevel: number;
    exerciseNeeds: number;
    playfulness: number;
    affectionLevel: number;
    trainability: number;
    watchdogAbility: number;
    adaptability: number;
    goodWithChildren: number;
    goodWithOtherDogs: number;
    goodWithStrangers: number;
    groomingRequirements: number;
    sheddingLevel: number;
    barkingLevel: number;
  };
};

export type CatBreed = BaseBreed & {
  catDetails: {
    energyLevel: number;
    playfulness: number;
    affectionLevel: number;
    intelligence: number;
    vocality: number;
    adaptability: number;
    goodWithChildren: number;
    goodWithOtherPets: number;
    strangerFriendliness: number;
    groomingRequirements: number;
    sheddingLevel: number;
  };
};

export const initialDogBreeds: DogBreed[] = [
  {
    species: 'dog',
    nameEn: 'Labrador Retriever',
    nameTh: 'ลาบราดอร์ รีทรีฟเวอร์',
    descriptionEn: 'Outgoing, friendly, highly trainable; excels as a family companion and working dog.',
    descriptionTh: 'ร่าเริง เข้ากับคนง่าย ฝึกง่าย เหมาะทั้งเป็นสุนัขครอบครัวและสุนัขทำงาน',
    imageUrl: [],
    lifespanMinYears: 10,
    lifespanMaxYears: 12,
    originCountry: 'Canada',
    dogDetails: { energyLevel: 5, exerciseNeeds: 5, playfulness: 5, affectionLevel: 5, trainability: 5, watchdogAbility: 2, adaptability: 5, goodWithChildren: 5, goodWithOtherDogs: 5, goodWithStrangers: 5, groomingRequirements: 2, sheddingLevel: 4, barkingLevel: 2 }
  },
  {
    species: 'dog',
    nameEn: 'Golden Retriever',
    nameTh: 'โกลเดน รีทรีฟเวอร์',
    descriptionEn: 'Friendly, intelligent, and devoted family dogs known for a gentle temperament.',
    descriptionTh: 'ใจดี ฉลาด ซื่อสัตย์ต่อครอบครัว มีนิสัยอ่อนโยน',
    imageUrl: [],
    lifespanMinYears: 10,
    lifespanMaxYears: 12,
    originCountry: 'Scotland',
    dogDetails: { energyLevel: 4, exerciseNeeds: 4, playfulness: 5, affectionLevel: 5, trainability: 5, watchdogAbility: 3, adaptability: 4, goodWithChildren: 5, goodWithOtherDogs: 5, goodWithStrangers: 5, groomingRequirements: 3, sheddingLevel: 4, barkingLevel: 2 }
  },
  {
    species: 'dog',
    nameEn: 'French Bulldog',
    nameTh: 'เฟรนช์ บูลด็อก',
    descriptionEn: 'Compact, affectionate companion with a calm, clownish personality.',
    descriptionTh: 'ตัวเล็ก ขี้อ้อน อารมณ์ดี ชอบอยู่ใกล้คน',
    imageUrl: [],
    lifespanMinYears: 10,
    lifespanMaxYears: 12,
    originCountry: 'France',
    dogDetails: { energyLevel: 2, exerciseNeeds: 2, playfulness: 3, affectionLevel: 5, trainability: 3, watchdogAbility: 3, adaptability: 4, goodWithChildren: 4, goodWithOtherDogs: 4, goodWithStrangers: 4, groomingRequirements: 2, sheddingLevel: 2, barkingLevel: 2 }
  },
  {
    species: 'dog',
    nameEn: 'German Shepherd',
    nameTh: 'เยอรมัน เชพเพิร์ด',
    descriptionEn: 'Confident, courageous, and smart; a versatile working breed.',
    descriptionTh: 'มั่นใจ กล้าหาญ ฉลาด ใช้งานได้หลากหลาย',
    imageUrl: [],
    lifespanMinYears: 9,
    lifespanMaxYears: 13,
    originCountry: 'Germany',
    dogDetails: { energyLevel: 4, exerciseNeeds: 4, playfulness: 3, affectionLevel: 4, trainability: 5, watchdogAbility: 5, adaptability: 3, goodWithChildren: 4, goodWithOtherDogs: 3, goodWithStrangers: 2, groomingRequirements: 3, sheddingLevel: 4, barkingLevel: 3 }
  },
  {
    species: 'dog',
    nameEn: 'Poodle (Standard)',
    nameTh: 'พุดเดิ้ล (ขนาดมาตรฐาน)',
    descriptionEn: 'Exceptionally intelligent, athletic, and hypoallergenic coat.',
    descriptionTh: 'ฉลาดมาก ว่องไว ขนแพ้น้อย',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'Germany/France',
    dogDetails: { energyLevel: 4, exerciseNeeds: 4, playfulness: 4, affectionLevel: 4, trainability: 5, watchdogAbility: 3, adaptability: 4, goodWithChildren: 4, goodWithOtherDogs: 4, goodWithStrangers: 4, groomingRequirements: 5, sheddingLevel: 1, barkingLevel: 2 }
  },
  {
    species: 'dog',
    nameEn: 'Bulldog (English)',
    nameTh: 'บูลด็อก อังกฤษ',
    descriptionEn: 'Calm, courageous, and affectionate; low exercise needs.',
    descriptionTh: 'สุขุม กล้าหาญ ขี้อ้อน ต้องการออกกำลังกายน้อย',
    imageUrl: [],
    lifespanMinYears: 8,
    lifespanMaxYears: 10,
    originCountry: 'England',
    dogDetails: { energyLevel: 1, exerciseNeeds: 1, playfulness: 2, affectionLevel: 5, trainability: 3, watchdogAbility: 3, adaptability: 3, goodWithChildren: 4, goodWithOtherDogs: 3, goodWithStrangers: 4, groomingRequirements: 2, sheddingLevel: 2, barkingLevel: 1 }
  },
  {
    species: 'dog',
    nameEn: 'Beagle',
    nameTh: 'บีเกิล',
    descriptionEn: 'Merry, curious hound with a great nose and family-friendly nature.',
    descriptionTh: 'ร่าเริง อยากรู้อยากเห็น เป็นมิตรกับครอบครัว',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'England',
    dogDetails: { energyLevel: 4, exerciseNeeds: 4, playfulness: 4, affectionLevel: 4, trainability: 3, watchdogAbility: 2, adaptability: 4, goodWithChildren: 5, goodWithOtherDogs: 5, goodWithStrangers: 4, groomingRequirements: 2, sheddingLevel: 3, barkingLevel: 4 }
  },
  {
    species: 'dog',
    nameEn: 'Rottweiler',
    nameTh: 'ร็อตไวเลอร์',
    descriptionEn: 'Powerful, loyal guardian; needs consistent training and socialization.',
    descriptionTh: 'ทรงพลัง ซื่อสัตย์ ต้องฝึกและเข้าสังคมสม่ำเสมอ',
    imageUrl: [],
    lifespanMinYears: 9,
    lifespanMaxYears: 10,
    originCountry: 'Germany',
    dogDetails: { energyLevel: 3, exerciseNeeds: 3, playfulness: 3, affectionLevel: 4, trainability: 4, watchdogAbility: 5, adaptability: 3, goodWithChildren: 4, goodWithOtherDogs: 2, goodWithStrangers: 2, groomingRequirements: 2, sheddingLevel: 3, barkingLevel: 2 }
  },
  {
    species: 'dog',
    nameEn: 'Dachshund',
    nameTh: 'ดัชชุนด์',
    descriptionEn: 'Lively, brave, and curious; distinctive long body and short legs.',
    descriptionTh: 'กระฉับกระเฉง กล้าหาญ ชอบสำรวจ ตัวยาวขาสั้น',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 16,
    originCountry: 'Germany',
    dogDetails: { energyLevel: 3, exerciseNeeds: 2, playfulness: 3, affectionLevel: 4, trainability: 3, watchdogAbility: 3, adaptability: 4, goodWithChildren: 3, goodWithOtherDogs: 3, goodWithStrangers: 3, groomingRequirements: 2, sheddingLevel: 2, barkingLevel: 4 }
  },
  {
    species: 'dog',
    nameEn: 'Siberian Husky',
    nameTh: 'ไซบีเรียน ฮัสกี',
    descriptionEn: 'Friendly, athletic sled dog; independent with high exercise needs.',
    descriptionTh: 'เป็นมิตร แข็งแรง อิสระ ต้องการออกกำลังกายสูง',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 14,
    originCountry: 'Russia',
    dogDetails: { energyLevel: 5, exerciseNeeds: 5, playfulness: 4, affectionLevel: 4, trainability: 3, watchdogAbility: 2, adaptability: 3, goodWithChildren: 4, goodWithOtherDogs: 5, goodWithStrangers: 4, groomingRequirements: 3, sheddingLevel: 5, barkingLevel: 2 }
  },
  {
    species: 'dog',
    nameEn: 'Shih Tzu',
    nameTh: 'ชิสุ',
    descriptionEn: 'Affectionate lap dog with a luxurious coat; great indoor companion.',
    descriptionTh: 'ขี้อ้อน ขนสวย เหมาะเลี้ยงในบ้าน',
    imageUrl: [],
    lifespanMinYears: 10,
    lifespanMaxYears: 16,
    originCountry: 'Tibet/China',
    dogDetails: { energyLevel: 2, exerciseNeeds: 2, playfulness: 3, affectionLevel: 5, trainability: 3, watchdogAbility: 2, adaptability: 4, goodWithChildren: 4, goodWithOtherDogs: 4, goodWithStrangers: 4, groomingRequirements: 5, sheddingLevel: 2, barkingLevel: 2 }
  },
  {
    species: 'dog',
    nameEn: 'Pomeranian',
    nameTh: 'ปอมเมอเรเนียน',
    descriptionEn: 'Spirited toy breed; bold and bright with a fluffy coat.',
    descriptionTh: 'ตัวเล็ก จิตใจกล้าใส ขนฟู',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 16,
    originCountry: 'Germany/Poland',
    dogDetails: { energyLevel: 3, exerciseNeeds: 2, playfulness: 4, affectionLevel: 4, trainability: 3, watchdogAbility: 4, adaptability: 4, goodWithChildren: 3, goodWithOtherDogs: 3, goodWithStrangers: 3, groomingRequirements: 3, sheddingLevel: 3, barkingLevel: 4 }
  },
  {
    species: 'dog',
    nameEn: 'Chihuahua',
    nameTh: 'ชิวาวา',
    descriptionEn: 'Tiny, alert, and loyal; suited to apartment living.',
    descriptionTh: 'ตัวเล็ก ไวต่อสิ่งรอบตัว ซื่อสัตย์ เหมาะกับคอนโด',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 16,
    originCountry: 'Mexico',
    dogDetails: { energyLevel: 3, exerciseNeeds: 2, playfulness: 3, affectionLevel: 4, trainability: 3, watchdogAbility: 4, adaptability: 4, goodWithChildren: 2, goodWithOtherDogs: 3, goodWithStrangers: 3, groomingRequirements: 2, sheddingLevel: 2, barkingLevel: 4 }
  },
  {
    species: 'dog',
    nameEn: 'Border Collie',
    nameTh: 'บอร์เดอร์ คอลลี่',
    descriptionEn: 'Widely considered the most intelligent dog; thrives on work and training.',
    descriptionTh: 'ฉลาดมาก ต้องการงานและการฝึกสม่ำเสมอ',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'Scotland/England',
    dogDetails: { energyLevel: 5, exerciseNeeds: 5, playfulness: 4, affectionLevel: 4, trainability: 5, watchdogAbility: 3, adaptability: 3, goodWithChildren: 4, goodWithOtherDogs: 4, goodWithStrangers: 3, groomingRequirements: 3, sheddingLevel: 3, barkingLevel: 3 }
  },
  {
    species: 'dog',
    nameEn: 'Yorkshire Terrier',
    nameTh: 'ยอร์คเชียร์ เทอร์เรียร์',
    descriptionEn: 'Feisty toy terrier with a silky coat; bold and affectionate.',
    descriptionTh: 'จิ๋วแต่ใจใหญ่ ขนเงางาม ขี้อ้อน',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'England',
    dogDetails: { energyLevel: 3, exerciseNeeds: 2, playfulness: 3, affectionLevel: 4, trainability: 3, watchdogAbility: 4, adaptability: 4, goodWithChildren: 3, goodWithOtherDogs: 3, goodWithStrangers: 3, groomingRequirements: 4, sheddingLevel: 1, barkingLevel: 4 }
  },
  {
    species: 'dog',
    nameEn: 'Doberman Pinscher',
    nameTh: 'โดเบอร์แมน พินเชอร์',
    descriptionEn: 'Athletic, loyal, and protective with sharp intelligence.',
    descriptionTh: 'ว่องไว ซื่อสัตย์ ปกป้องเก่ง ฉลาด',
    imageUrl: [],
    lifespanMinYears: 10,
    lifespanMaxYears: 13,
    originCountry: 'Germany',
    dogDetails: { energyLevel: 4, exerciseNeeds: 4, playfulness: 3, affectionLevel: 4, trainability: 5, watchdogAbility: 5, adaptability: 3, goodWithChildren: 4, goodWithOtherDogs: 3, goodWithStrangers: 2, groomingRequirements: 1, sheddingLevel: 2, barkingLevel: 3 }
  },
  {
    species: 'dog',
    nameEn: 'Great Dane',
    nameTh: 'เกรท เดน',
    descriptionEn: 'Gentle giant; calm indoors, needs space and moderate exercise.',
    descriptionTh: 'ยักษ์ใจดี สงบในบ้าน ต้องการพื้นที่และออกกำลังพอเหมาะ',
    imageUrl: [],
    lifespanMinYears: 7,
    lifespanMaxYears: 10,
    originCountry: 'Germany',
    dogDetails: { energyLevel: 2, exerciseNeeds: 2, playfulness: 2, affectionLevel: 5, trainability: 3, watchdogAbility: 3, adaptability: 3, goodWithChildren: 4, goodWithOtherDogs: 4, goodWithStrangers: 4, groomingRequirements: 1, sheddingLevel: 2, barkingLevel: 2 }
  },
  {
    species: 'dog',
    nameEn: 'Pug',
    nameTh: 'ปั๊ก',
    descriptionEn: 'Charming, mischievous, and loving; a classic companion breed.',
    descriptionTh: 'ขี้เล่น น่ารัก ขี้อ้อน เพื่อนคู่ใจ',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'China',
    dogDetails: { energyLevel: 2, exerciseNeeds: 2, playfulness: 3, affectionLevel: 5, trainability: 3, watchdogAbility: 2, adaptability: 4, goodWithChildren: 4, goodWithOtherDogs: 4, goodWithStrangers: 4, groomingRequirements: 2, sheddingLevel: 3, barkingLevel: 2 }
  },
  {
    species: 'dog',
    nameEn: 'Pembroke Welsh Corgi',
    nameTh: 'เพมบร็อค เวลช์ คอร์กี้',
    descriptionEn: 'Alert herder with short legs and big personality.',
    descriptionTh: 'สุนัขต้อนสัตว์ ขาสั้น ใจใหญ่ ฉลาดไว',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 13,
    originCountry: 'Wales',
    dogDetails: { energyLevel: 4, exerciseNeeds: 3, playfulness: 4, affectionLevel: 4, trainability: 4, watchdogAbility: 4, adaptability: 4, goodWithChildren: 4, goodWithOtherDogs: 3, goodWithStrangers: 3, groomingRequirements: 2, sheddingLevel: 4, barkingLevel: 3 }
  },
  {
    species: 'dog',
    nameEn: 'Australian Shepherd',
    nameTh: 'ออสเตรเลียน เชพเพิร์ด',
    descriptionEn: 'Energetic herder that thrives on activity and mental work.',
    descriptionTh: 'มีพลังสูง ชอบทำกิจกรรมและงานใช้สมอง',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'USA',
    dogDetails: { energyLevel: 5, exerciseNeeds: 5, playfulness: 4, affectionLevel: 4, trainability: 5, watchdogAbility: 3, adaptability: 3, goodWithChildren: 4, goodWithOtherDogs: 4, goodWithStrangers: 3, groomingRequirements: 3, sheddingLevel: 3, barkingLevel: 3 }
  },
  {
    species: 'dog',
    nameEn: 'Cavalier King Charles Spaniel',
    nameTh: 'คาวาเลียร์ คิง ชาร์ลส์ สแปเนียล',
    descriptionEn: 'Sweet-natured toy spaniel; adaptable and affectionate.',
    descriptionTh: 'นิสัยอ่อนหวาน ปรับตัวง่าย ขี้อ้อน',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'England',
    dogDetails: { energyLevel: 3, exerciseNeeds: 2, playfulness: 3, affectionLevel: 5, trainability: 4, watchdogAbility: 2, adaptability: 5, goodWithChildren: 5, goodWithOtherDogs: 4, goodWithStrangers: 5, groomingRequirements: 3, sheddingLevel: 3, barkingLevel: 2 }
  },
  {
    species: 'dog',
    nameEn: 'Boxer',
    nameTh: 'บ็อกเซอร์',
    descriptionEn: 'Bright, active, and fun-loving; great family guardian.',
    descriptionTh: 'ฉลาด แอคทีฟ รักสนุก เป็นผู้พิทักษ์ครอบครัวที่ดี',
    imageUrl: [],
    lifespanMinYears: 10,
    lifespanMaxYears: 12,
    originCountry: 'Germany',
    dogDetails: { energyLevel: 4, exerciseNeeds: 4, playfulness: 5, affectionLevel: 5, trainability: 4, watchdogAbility: 4, adaptability: 3, goodWithChildren: 4, goodWithOtherDogs: 3, goodWithStrangers: 3, groomingRequirements: 2, sheddingLevel: 2, barkingLevel: 3 }
  }
];

export const initialCatBreeds: CatBreed[] = [
  {
    species: 'cat',
    nameEn: 'Persian',
    nameTh: 'เปอร์เซีย',
    descriptionEn: 'Calm, gentle, and affectionate; long thick coat requires regular grooming.',
    descriptionTh: 'นิ่ง สุภาพ ขี้อ้อน ขนยาวหนาต้องดูแลสม่ำเสมอ',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'Iran (Persia)',
    catDetails: { energyLevel: 2, playfulness: 2, affectionLevel: 5, intelligence: 3, vocality: 2, adaptability: 3, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 3, groomingRequirements: 5, sheddingLevel: 4 }
  },
  {
    species: 'cat',
    nameEn: 'Maine Coon',
    nameTh: 'เมนคูน',
    descriptionEn: 'Large, friendly "gentle giant" with tufted ears and shaggy coat.',
    descriptionTh: 'ตัวใหญ่ ใจดี หูพู่ ขนฟู',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'USA',
    catDetails: { energyLevel: 3, playfulness: 4, affectionLevel: 4, intelligence: 4, vocality: 3, adaptability: 4, goodWithChildren: 5, goodWithOtherPets: 5, strangerFriendliness: 4, groomingRequirements: 3, sheddingLevel: 4 }
  },
  {
    species: 'cat',
    nameEn: 'Ragdoll',
    nameTh: 'แร็กดอลล์',
    descriptionEn: 'Docile, affectionate cat that often goes limp when held.',
    descriptionTh: 'อ่อนโยน ขี้อ้อน มักนิ่มตัวเมื่อถูกอุ้ม',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'USA',
    catDetails: { energyLevel: 2, playfulness: 3, affectionLevel: 5, intelligence: 3, vocality: 2, adaptability: 4, goodWithChildren: 5, goodWithOtherPets: 5, strangerFriendliness: 4, groomingRequirements: 3, sheddingLevel: 3 }
  },
  {
    species: 'cat',
    nameEn: 'British Shorthair',
    nameTh: 'บริติช ช็อตแฮร์',
    descriptionEn: 'Calm, sturdy cat with a plush coat and round features.',
    descriptionTh: 'นิ่ง สุขุม โครงสร้างแน่น ขนหนานุ่ม',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 16,
    originCountry: 'United Kingdom',
    catDetails: { energyLevel: 2, playfulness: 2, affectionLevel: 4, intelligence: 3, vocality: 2, adaptability: 4, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 3, groomingRequirements: 2, sheddingLevel: 3 }
  },
  {
    species: 'cat',
    nameEn: 'Siamese',
    nameTh: 'วิเชียรมาศ',
    descriptionEn: 'Vocal, social, and intelligent with striking color points.',
    descriptionTh: 'ช่างพูด เข้าสังคมเก่ง ฉลาด แต้มสีโดดเด่น',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'Thailand',
    catDetails: { energyLevel: 4, playfulness: 4, affectionLevel: 4, intelligence: 5, vocality: 5, adaptability: 4, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 4, groomingRequirements: 1, sheddingLevel: 2 }
  },
  {
    species: 'cat',
    nameEn: 'American Shorthair',
    nameTh: 'อเมริกัน ช็อตแฮร์',
    descriptionEn: 'Balanced temperament; adaptable family companion.',
    descriptionTh: 'นิสัยสมดุล ปรับตัวง่าย เหมาะกับครอบครัว',
    imageUrl: [],
    lifespanMinYears: 15,
    lifespanMaxYears: 20,
    originCountry: 'USA',
    catDetails: { energyLevel: 3, playfulness: 3, affectionLevel: 3, intelligence: 3, vocality: 2, adaptability: 5, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 3, groomingRequirements: 2, sheddingLevel: 3 }
  },
  {
    species: 'cat',
    nameEn: 'Scottish Fold',
    nameTh: 'สก็อตติช โฟลด์',
    descriptionEn: 'Sweet, easygoing cat with distinctive folded ears.',
    descriptionTh: 'น่ารัก อารมณ์ดี หูพับเป็นเอกลักษณ์',
    imageUrl: [],
    lifespanMinYears: 11,
    lifespanMaxYears: 15,
    originCountry: 'Scotland',
    catDetails: { energyLevel: 2, playfulness: 3, affectionLevel: 4, intelligence: 3, vocality: 2, adaptability: 3, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 3, groomingRequirements: 2, sheddingLevel: 3 }
  },
  {
    species: 'cat',
    nameEn: 'Bengal',
    nameTh: 'เบงกอล',
    descriptionEn: 'Athletic, active, and curious with a wild, spotted look.',
    descriptionTh: 'แข็งแรง แอคทีฟ ชอบสำรวจ ลายป่าดุเดือด',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 16,
    originCountry: 'USA',
    catDetails: { energyLevel: 5, playfulness: 5, affectionLevel: 3, intelligence: 4, vocality: 3, adaptability: 3, goodWithChildren: 4, goodWithOtherPets: 3, strangerFriendliness: 3, groomingRequirements: 2, sheddingLevel: 2 }
  },
  {
    species: 'cat',
    nameEn: 'Sphynx',
    nameTh: 'สฟิงซ์',
    descriptionEn: 'Hairless, affectionate, and people-oriented; needs skin care.',
    descriptionTh: 'ไร้ขน ขี้อ้อน ติดคน ต้องดูแลผิวหนัง',
    imageUrl: [],
    lifespanMinYears: 9,
    lifespanMaxYears: 15,
    originCountry: 'Canada',
    catDetails: { energyLevel: 4, playfulness: 4, affectionLevel: 5, intelligence: 4, vocality: 3, adaptability: 3, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 4, groomingRequirements: 3, sheddingLevel: 1 }
  },
  {
    species: 'cat',
    nameEn: 'Norwegian Forest Cat',
    nameTh: 'นอร์เวย์ ฟอเรสต์ แคท',
    descriptionEn: 'Robust, friendly cat with a waterproof double coat.',
    descriptionTh: 'แข็งแรง เป็นมิตร ขนหนาทนสภาพอากาศ',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 16,
    originCountry: 'Norway',
    catDetails: { energyLevel: 3, playfulness: 3, affectionLevel: 4, intelligence: 3, vocality: 2, adaptability: 4, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 3, groomingRequirements: 4, sheddingLevel: 4 }
  },
  {
    species: 'cat',
    nameEn: 'Abyssinian',
    nameTh: 'อะบิสซิเนียน',
    descriptionEn: 'Active, curious "ticked" coat cat; loves climbing.',
    descriptionTh: 'แอคทีฟ ชอบสำรวจ ชอบปีนป่าย ขนลายติ๊ก',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'Ethiopia (Abyssinia)',
    catDetails: { energyLevel: 5, playfulness: 5, affectionLevel: 3, intelligence: 4, vocality: 2, adaptability: 4, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 3, groomingRequirements: 1, sheddingLevel: 2 }
  },
  {
    species: 'cat',
    nameEn: 'Burmese',
    nameTh: 'เบอร์มีส',
    descriptionEn: 'People-oriented, playful, and social; sleek body.',
    descriptionTh: 'ติดคน ขี้เล่น ชอบเข้าสังคม',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 16,
    originCountry: 'Myanmar/USA',
    catDetails: { energyLevel: 4, playfulness: 4, affectionLevel: 5, intelligence: 3, vocality: 3, adaptability: 4, goodWithChildren: 5, goodWithOtherPets: 4, strangerFriendliness: 4, groomingRequirements: 1, sheddingLevel: 2 }
  },
  {
    species: 'cat',
    nameEn: 'Russian Blue',
    nameTh: 'รัสเซียน บลู',
    descriptionEn: 'Quiet, elegant cat with a dense blue-gray coat and green eyes.',
    descriptionTh: 'เงียบสงบ สง่างาม ขนเทาแน่น ดวงตาเขียว',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'Russia',
    catDetails: { energyLevel: 3, playfulness: 3, affectionLevel: 4, intelligence: 4, vocality: 1, adaptability: 4, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 2, groomingRequirements: 2, sheddingLevel: 3 }
  },
  {
    species: 'cat',
    nameEn: 'Exotic Shorthair',
    nameTh: 'เอ็กโซติก ช็อตแฮร์',
    descriptionEn: 'Persian-like personality with a short, plush coat.',
    descriptionTh: 'นิสัยคล้ายเปอร์เซีย แต่ขนสั้นดูแลง่าย',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'USA',
    catDetails: { energyLevel: 2, playfulness: 3, affectionLevel: 5, intelligence: 3, vocality: 2, adaptability: 4, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 3, groomingRequirements: 2, sheddingLevel: 3 }
  },
  {
    species: 'cat',
    nameEn: 'Oriental Shorthair',
    nameTh: 'โอเรียนทัล ช็อตแฮร์',
    descriptionEn: 'Vocal, active, and affectionate with many coat colors.',
    descriptionTh: 'ช่างพูด แอคทีฟ ขี้อ้อน สีสันหลากหลาย',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'USA/UK',
    catDetails: { energyLevel: 4, playfulness: 4, affectionLevel: 4, intelligence: 4, vocality: 5, adaptability: 4, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 4, groomingRequirements: 1, sheddingLevel: 2 }
  },
  {
    species: 'cat',
    nameEn: 'Birman',
    nameTh: 'เบอร์แมน',
    descriptionEn: 'Gentle, affectionate "Sacred Cat of Burma" with color points and white gloves.',
    descriptionTh: 'อ่อนโยน ขี้อ้อน แต้มสี ปลายถุงมือขาว',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 16,
    originCountry: 'Myanmar/France',
    catDetails: { energyLevel: 3, playfulness: 3, affectionLevel: 5, intelligence: 3, vocality: 2, adaptability: 4, goodWithChildren: 5, goodWithOtherPets: 5, strangerFriendliness: 4, groomingRequirements: 2, sheddingLevel: 3 }
  },
  {
    species: 'cat',
    nameEn: 'Turkish Angora',
    nameTh: 'เตอร์กิช อังกอรา',
    descriptionEn: 'Graceful, active longhair with fine, silky coat.',
    descriptionTh: 'สง่างาม คล่องแคล่ว ขนยาวนุ่มลื่น',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'Turkey',
    catDetails: { energyLevel: 4, playfulness: 4, affectionLevel: 4, intelligence: 4, vocality: 3, adaptability: 3, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 3, groomingRequirements: 3, sheddingLevel: 3 }
  },
  {
    species: 'cat',
    nameEn: 'Devon Rex',
    nameTh: 'เดวอน เร็กซ์',
    descriptionEn: 'Elfin look, wavy coat; playful, people-oriented.',
    descriptionTh: 'ใบหน้าเอกลักษณ์ ขนหยัก ขี้เล่น ติดคน',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 15,
    originCountry: 'United Kingdom',
    catDetails: { energyLevel: 4, playfulness: 5, affectionLevel: 5, intelligence: 4, vocality: 3, adaptability: 4, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 4, groomingRequirements: 1, sheddingLevel: 1 }
  },
  {
    species: 'cat',
    nameEn: 'Ragamuffin',
    nameTh: 'แร็กมัฟฟิน',
    descriptionEn: 'Large, affectionate cat related to Ragdoll; very docile.',
    descriptionTh: 'ตัวใหญ่ ขี้อ้อน สงบเชื่อง',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 16,
    originCountry: 'USA',
    catDetails: { energyLevel: 2, playfulness: 3, affectionLevel: 5, intelligence: 3, vocality: 2, adaptability: 4, goodWithChildren: 5, goodWithOtherPets: 5, strangerFriendliness: 4, groomingRequirements: 2, sheddingLevel: 3 }
  },
  {
    species: 'cat',
    nameEn: 'Manx',
    nameTh: 'แมงซ์',
    descriptionEn: 'Tailless or short-tailed island cat; sturdy and loyal.',
    descriptionTh: 'ไม่มีหางหรือหางสั้น แกร่ง ซื่อสัตย์',
    imageUrl: [],
    lifespanMinYears: 12,
    lifespanMaxYears: 14,
    originCountry: 'Isle of Man',
    catDetails: { energyLevel: 3, playfulness: 3, affectionLevel: 4, intelligence: 3, vocality: 2, adaptability: 4, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 3, groomingRequirements: 2, sheddingLevel: 3 }
  },
  {
    species: 'cat',
    nameEn: 'Scottish Straight',
    nameTh: 'สก็อตติช สเตรท',
    descriptionEn: 'Straight-eared variant of Scottish cats; sweet and calm.',
    descriptionTh: 'หูปกติ นิสัยอ่อนโยน สงบ',
    imageUrl: [],
    lifespanMinYears: 11,
    lifespanMaxYears: 15,
    originCountry: 'Scotland',
    catDetails: { energyLevel: 2, playfulness: 3, affectionLevel: 4, intelligence: 3, vocality: 2, adaptability: 3, goodWithChildren: 4, goodWithOtherPets: 4, strangerFriendliness: 3, groomingRequirements: 2, sheddingLevel: 3 }
  }
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

    // Seed dog breeds
    console.log('🐕 Seeding dog breeds...');
    for (const breedInfo of initialDogBreeds) {
      const { dogDetails, ...breedData } = breedInfo;
      
      // Insert breed
      const [breed] = await db
        .insert(breeds)
        .values(breedData)
        .returning();
      
      console.log(`✅ Inserted dog breed: ${breed.nameEn}`);
      
      // Insert dog details
      await db
        .insert(dogBreedDetails)
        .values({
          breedId: breed.id,
          ...dogDetails,
        });
      console.log(`✅ Added dog details for: ${breed.nameEn}`);
    }

    // Seed cat breeds
    console.log('🐱 Seeding cat breeds...');
    for (const breedInfo of initialCatBreeds) {
      const { catDetails, ...breedData } = breedInfo;
      
      // Insert breed
      const [breed] = await db
        .insert(breeds)
        .values(breedData)
        .returning();
      
      console.log(`✅ Inserted cat breed: ${breed.nameEn}`);
      
      // Insert cat details
      await db
        .insert(catBreedDetails)
        .values({
          breedId: breed.id,
          ...catDetails,
        });
      console.log(`✅ Added cat details for: ${breed.nameEn}`);
    }
    
    console.log('✅ All breeds seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding breeds:', error);
    throw error;
  }
} 