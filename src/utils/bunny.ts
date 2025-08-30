import { Buffer } from 'buffer';
import sharp from 'sharp';

const BUNNY_STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME!;
const BUNNY_STORAGE_ACCESS_KEY = process.env.BUNNY_STORAGE_ACCESS_KEY!;
const BUNNY_PULL_ZONE_HOSTNAME = process.env.BUNNY_PULL_ZONE_HOSTNAME!;
const BUNNY_STORAGE_HOSTNAME = 'sg.storage.bunnycdn.com';

const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heif', 'image/heic'];

if (!BUNNY_STORAGE_ZONE_NAME || !BUNNY_STORAGE_ACCESS_KEY || !BUNNY_PULL_ZONE_HOSTNAME) {
  throw new Error('Bunny.net environment variables are not set');
}

export class BunnyService {
  private getBunnyUrl(path: string): string {
    return `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE_NAME}/${path}`;
  }

  private async processImage(fileBuffer: Buffer, options: { width: number, height: number }): Promise<Buffer> {
    const image = sharp(fileBuffer);
    const metadata = await image.metadata();

    if (!metadata.format || !ALLOWED_IMAGE_FORMATS.includes(`image/${metadata.format}`)) {
      throw new Error(`Unsupported image format: ${metadata.format}`);
    }

    // Process image with proper orientation handling
    let processedImage = image.rotate(); // Auto-rotate based on EXIF orientation
    
    // Resize while maintaining aspect ratio
    processedImage = processedImage.resize(options.width, options.height, { 
      fit: 'cover',
      withoutEnlargement: true // Don't enlarge small images
    });

    // Convert to WebP for better compression and quality
    const result = await processedImage
      .webp({ 
        quality: 80,
        effort: 4 // Higher effort for better compression
      })
      .toBuffer();

    return result;
  }

  async upload(fileBuffer: Buffer, path: string, fileName: string): Promise<string> {
    const processedBuffer = await this.processImage(fileBuffer, { width: 512, height: 512 });
    
    // Change file extension to .webp
    const originalName = fileName.substring(0, fileName.lastIndexOf('.'));
    const newFileName = `${originalName}.webp`;

    const uploadUrl = this.getBunnyUrl(`${path}/${newFileName}`);

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
        throw new Error(`Failed to upload to Bunny.net: ${response.status} ${response.statusText} - ${errorText}`);
      }
  
      return `https://${BUNNY_PULL_ZONE_HOSTNAME}/${path}/${newFileName}`;
    } catch (error) {
      throw error; // Re-throw the error to be handled by the route
    }
  }

  getUserProfileImagePath(userId: string): string {
    return `users/${userId}`;
  }

  getPetProfileImagePath(userId: string, petId: string): string {
    return `users/${userId}/pets/${petId}`;
  }

  getStoragePathFromUrl(imageUrl: string): string | null {
    try {
      const url = new URL(imageUrl);
      if (url.hostname === BUNNY_PULL_ZONE_HOSTNAME) {
        // The path will start with a '/', so we remove it.
        return url.pathname.substring(1);
      }
      return null;
    } catch (error) {
      // Invalid URL format, return null
      return null;
    }
  }

  async delete(path: string): Promise<void> {
    const deleteUrl = this.getBunnyUrl(path);

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          AccessKey: BUNNY_STORAGE_ACCESS_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete from Bunny.net: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      // If deletion fails, we don't want to break the flow
      // The file might not exist or might have already been deleted
    }
  }
}

export const bunnyService = new BunnyService(); 