import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export class FileService {
  private static uploadDir = process.env.UPLOAD_PATH || './uploads';

  static ensureUploadDirs() {
    console.log('Ensuring upload directories exist...');
    console.log('Upload base dir:', this.uploadDir);
    
    // Ensure base upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      console.log('Creating base upload directory:', this.uploadDir);
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    
    const dirs = ['photos', 'ids'];
    dirs.forEach(dir => {
      const fullPath = path.join(this.uploadDir, dir);
      console.log(`Checking directory: ${fullPath}`);
      if (!fs.existsSync(fullPath)) {
        console.log(`Creating directory: ${fullPath}`);
        fs.mkdirSync(fullPath, { recursive: true });
      } else {
        console.log(`Directory already exists: ${fullPath}`);
      }
    });
    console.log('Upload directories setup complete.');
  }

  static getMulterConfig() {
    const storage = multer.memoryStorage();
    
    return multer({
      storage,
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
          cb(null, true);
        } else {
          cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
        }
      }
    });
  }

  static async saveImage(buffer: Buffer, type: 'photo' | 'id', originalName?: string): Promise<string> {
    console.log(`=== SAVING ${type.toUpperCase()} IMAGE ===`);
    console.log('Upload directory:', this.uploadDir);
    
    this.ensureUploadDirs();
    
    const filename = `${uuidv4()}-${Date.now()}.jpg`;
    const relativePath = path.join(type + 's', filename);
    const fullPath = path.join(this.uploadDir, relativePath);

    console.log('Generated filename:', filename);
    console.log('Relative path:', relativePath);
    console.log('Full path:', fullPath);

    try {
      // Validate that buffer is not empty
      if (!buffer || buffer.length === 0) {
        throw new Error('Image buffer is empty');
      }

      console.log('Buffer validated, length:', buffer.length);

      // Try to create Sharp instance to validate image format
      const sharpInstance = sharp(buffer);
      
      // Get metadata to validate the image
      const metadata = await sharpInstance.metadata();
      console.log('Image metadata:', metadata);
      
      if (!metadata.format) {
        throw new Error('Invalid image format: Unable to detect image format');
      }

      console.log('Processing image with Sharp...');
      // Process image with sharp to optimize and ensure consistent format
      await sharpInstance
        .resize(800, 600, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toFile(fullPath);

      console.log('Image saved successfully to:', fullPath);
      
      // Verify the file was actually created
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log('File exists, size:', stats.size, 'bytes');
      } else {
        console.error('File was not created!');
      }

      return relativePath.replace(/\\/g, '/'); // Normalize path separators
      
    } catch (error) {
      console.error('=== ERROR SAVING IMAGE ===');
      console.error('Error processing image:', error);
      console.error('Buffer length:', buffer?.length || 'undefined');
      console.error('Buffer type:', typeof buffer);
      console.error('Full path attempted:', fullPath);
      
      // If it's a Sharp error, provide more specific error message
      if (error instanceof Error) {
        if (error.message.includes('Input buffer contains unsupported image format')) {
          throw new Error('Unsupported image format. Please upload a valid JPEG, PNG, or other supported image file.');
        }
        if (error.message.includes('Input file contains unsupported image format')) {
          throw new Error('The uploaded file is not a valid image. Please try uploading a different image.');
        }
        throw new Error(`Image processing failed: ${error.message}`);
      }
      
      throw new Error('Failed to process image file');
    }
  }

  static async deleteImage(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  static getImagePath(relativePath: string): string {
    return path.join(this.uploadDir, relativePath);
  }

  static imageExists(relativePath: string): boolean {
    const fullPath = path.join(this.uploadDir, relativePath);
    return fs.existsSync(fullPath);
  }

  static async getImageBuffer(relativePath: string): Promise<Buffer | null> {
    try {
      const fullPath = path.join(this.uploadDir, relativePath);
      if (fs.existsSync(fullPath)) {
        return await fs.promises.readFile(fullPath);
      }
      return null;
    } catch (error) {
      console.error('Error reading image:', error);
      return null;
    }
  }

  // OCR or ID reading simulation - In real implementation, integrate with OCR service
  static async extractIdInfo(buffer: Buffer): Promise<any> {
    // This is a mock implementation
    // In a real scenario, you would integrate with an OCR service like Tesseract.js
    // or a cloud service like AWS Textract, Google Vision API, etc.
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate extracted ID information
        resolve({
          idNumber: `ID${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01',
          address: '123 Main St, City, State',
          confidence: 0.95
        });
      }, 1000);
    });
  }
}