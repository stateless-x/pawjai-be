import { Buffer } from 'buffer';
import sharp from 'sharp';

const BUNNY_STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME!;
const BUNNY_STORAGE_ACCESS_KEY = process.env.BUNNY_STORAGE_ACCESS_KEY!;
const BUNNY_PULL_ZONE_HOSTNAME = process.env.BUNNY_PULL_ZONE_HOSTNAME!;
const BUNNY_STORAGE_HOSTNAME = 'sg.storage.bunnycdn.com';

const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heif', 'image/heic'];

if (!BUNNY_STORAGE_ZONE_NAME || !BUNNY_STORAGE_ACCESS_KEY || !BUNNY_PULL_ZONE_HOSTNAME) {
  throw new Error('Bunny.net environment variables are not set');
} else {
  console.log('[BunnyService] Initialized with config:');
  console.log(` - Storage Zone: ${BUNNY_STORAGE_ZONE_NAME}`);
  console.log(` - Pull Zone Hostname: ${BUNNY_PULL_ZONE_HOSTNAME}`);
  console.log(` - Access Key: ${BUNNY_STORAGE_ACCESS_KEY.substring(0, 3)}...${BUNNY_STORAGE_ACCESS_KEY.slice(-3)}`);
}

export class BunnyService {
  private getBunnyUrl(path: string): string {
    return `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE_NAME}/${path}`;
  }

  private async processImage(fileBuffer: Buffer, options: { width: number, height: number }): Promise<Buffer> {
    const image = sharp(fileBuffer);
    const metadata = await image.metadata();

    console.log(`[BunnyService] Detected image format: ${metadata.format}`);

    if (!metadata.format || !ALLOWED_IMAGE_FORMATS.includes(`image/${metadata.format}`)) {
      throw new Error(`Unsupported image format: ${metadata.format}`);
    }

    return image
      .resize(options.width, options.height, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
  }

  async upload(fileBuffer: Buffer, path: string, fileName: string): Promise<string> {
    const processedBuffer = await this.processImage(fileBuffer, { width: 512, height: 512 });
    
    // Change file extension to .webp
    const originalName = fileName.substring(0, fileName.lastIndexOf('.'));
    const newFileName = `${originalName}.webp`;

    const uploadUrl = this.getBunnyUrl(`${path}/${newFileName}`);
    
    console.log(`[BunnyService] Uploading to URL: ${uploadUrl}`);

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          AccessKey: BUNNY_STORAGE_ACCESS_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: processedBuffer as any,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[BunnyService] Error from Bunny.net API. Status: ${response.status} ${response.statusText}`);
        console.error(`[BunnyService] Error Body: ${errorText}`);
        throw new Error(`Failed to upload to Bunny.net: ${response.status} ${response.statusText} - ${errorText}`);
      }
  
      console.log(`[BunnyService] Successfully uploaded ${newFileName}`);
      return `https://${BUNNY_PULL_ZONE_HOSTNAME}/${path}/${newFileName}`;
    } catch (error) {
      console.error('[BunnyService] A network or fetch error occurred during upload:', error);
      throw error; // Re-throw the error to be handled by the route
    }
  }

  getUserProfileImagePath(userId: string): string {
    return `users/${userId}`;
  }

  getPetProfileImagePath(userId: string, petId: string): string {
    return `users/${userId}/pets/${petId}`;
  }
}

export const bunnyService = new BunnyService(); 