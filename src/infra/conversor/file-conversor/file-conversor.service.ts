import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class FileConversorService {
  constructor() {}

  async convertToWebp(
    file: Express.Multer.File,
    quality = 100,
  ): Promise<Express.Multer.File> {
    const pipeline = sharp(file.buffer);

    const buffer = await pipeline.webp({ quality }).toBuffer();

    return {
      ...file,
      buffer,
      size: buffer.length,
      mimetype: 'image/webp',
      originalname: this.replaceExtension(file.originalname, 'webp'),
    };
  }

  private replaceExtension(filename: string, ext: string): string {
    return filename.replace(/\.\w+$/, `.${ext}`);
  }
}
