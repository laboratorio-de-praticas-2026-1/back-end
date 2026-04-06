import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './dto/cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject('CLOUDINARY')
    private cloudinary: typeof Cloudinary,
  ) {}

  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      try {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          {
            folder: process.env.CLOUDINARY_FOLDER || 'app_despachante',
          },
          (error, result) => {
            if (error) {
              this.logger.error(
                `Erro ao fazer upload da imagem para Cloudinary: ${error.message}`,
              );
              return reject(
                new InternalServerErrorException(
                  `Erro ao fazer upload da imagem`,
                ),
              );
            }

            if (!result) {
              return reject(
                new InternalServerErrorException(
                  'Cloudinary não retornou resultado',
                ),
              );
            }

            resolve(result);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.logger.error(
            `Erro ao iniciar upload no Cloudinary: ${error.message}`,
          );
        }

        reject(
          new InternalServerErrorException(
            `Erro ao iniciar upload no Cloudinary`,
          ),
        );
      }
    });
  }
}
