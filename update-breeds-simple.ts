import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const connectionString = "postgresql://postgres:ipMQSutoTobCxXdqyqRZXaqZxlXtrsLt@interchange.proxy.rlwy.net:56225/railway";

async function updateBreeds() {
  console.log('🚀 Updating breeds on server...');
  
  try {
    // Create the postgres client
    const client = postgres(connectionString, { max: 1 });
    
    // Create the drizzle database instance
    const db = drizzle(client);
    
    // Clear existing breeds
    console.log('🗑️ Clearing existing breeds...');
    await db.execute(sql`DELETE FROM dog_breed_details`);
    await db.execute(sql`DELETE FROM cat_breed_details`);
    await db.execute(sql`DELETE FROM breeds`);
    
    // Insert some basic breeds
    console.log('🐕 Adding basic breeds...');
    
    // Add a few dog breeds
    await db.execute(sql`
      INSERT INTO breeds (species, name_en, name_th, description_en, description_th, image_url, lifespan_min_years, lifespan_max_years, origin_country)
      VALUES 
        ('dog', 'Labrador Retriever', 'ลาบราดอร์ รีทรีฟเวอร์', 'Friendly, intelligent, and devoted family dogs', 'ใจดี ฉลาด ซื่อสัตย์ต่อครอบครัว', ARRAY[]::text[], 10, 12, 'Canada'),
        ('dog', 'Golden Retriever', 'โกลเดน รีทรีฟเวอร์', 'Friendly, intelligent, and devoted family dogs', 'ใจดี ฉลาด ซื่อสัตย์ต่อครอบครัว', ARRAY[]::text[], 10, 12, 'Scotland'),
        ('dog', 'German Shepherd', 'เยอรมัน เชพเพิร์ด', 'Confident, courageous, and smart', 'มั่นใจ กล้าหาญ ฉลาด', ARRAY[]::text[], 9, 13, 'Germany')
    `);
    
    // Add a few cat breeds
    await db.execute(sql`
      INSERT INTO breeds (species, name_en, name_th, description_en, description_th, image_url, lifespan_min_years, lifespan_max_years, origin_country)
      VALUES 
        ('cat', 'Persian', 'เปอร์เซีย', 'Calm, gentle, and affectionate', 'นิ่ง สุภาพ ขี้อ้อน', ARRAY[]::text[], 12, 15, 'Iran'),
        ('cat', 'Siamese', 'วิเชียรมาศ', 'Vocal, social, and intelligent', 'ช่างพูด เข้าสังคมเก่ง ฉลาด', ARRAY[]::text[], 12, 15, 'Thailand'),
        ('cat', 'Maine Coon', 'เมนคูน', 'Large, friendly gentle giant', 'ตัวใหญ่ ใจดี', ARRAY[]::text[], 12, 15, 'USA')
    `);
    
    console.log('✅ Basic breeds added successfully!');
    
    // Close the connection
    await client.end();
    
  } catch (error) {
    console.error('❌ Failed to update breeds:', error);
    process.exit(1);
  }
}

updateBreeds(); 