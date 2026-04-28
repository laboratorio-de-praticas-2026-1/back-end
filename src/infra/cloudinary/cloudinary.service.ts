import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CloudinaryResponse } from './dto/cloudinary-response';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject('CLOUDINARY')
    private cloudinary: typeof Cloudinary,
  ) {}

  IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      try {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          {
            folder: process.env.CLOUDINARY_FOLDER || 'app_despachante',
            format: 'webp',
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
          new InternalServerErrorException(`Erro ao iniciar upload da imagem.`),
        );
      }
    });
  }

  uploadDocument(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      try {
        const nomeOriginal = file.originalname
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_');

        const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
        const isImagem = this.IMAGE_MIME_TYPES.includes(file.mimetype);

        const uploadStream = this.cloudinary.uploader.upload_stream(
          {
            folder: process.env.CLOUDINARY_FOLDER,
            resource_type: isImagem ? 'image' : 'raw',
            type: 'authenticated',
            display_name: nomeOriginal,
            unique_filename: true,
            ...(!isImagem && ext && { format: ext }),
            ...(isImagem && {
              format: 'webp',
              quality: 'auto',
            }),
          },
          (error, result) => {
            if (error) {
              this.logger.error(
                `Erro ao fazer upload do documento: ${error.message}`,
              );
              return reject(
                new InternalServerErrorException(
                  `Erro ao fazer upload do documento`,
                ),
              );
            }

            if (!result) {
              return reject(
                new InternalServerErrorException(
                  'Não foi possível realizar upload do documento',
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
            `Erro ao iniciar upload do documento: ${error.message}`,
          );
        }

        reject(
          new InternalServerErrorException(
            `Erro ao iniciar upload do documento`,
          ),
        );
      }
    });
  }

  generateTemporaryUrl(publicIdWithResourceType: string): string {
    try {
      const separador = publicIdWithResourceType.indexOf('|');
      const resourceType = publicIdWithResourceType.slice(0, separador) as
        | 'raw'
        | 'image';
      const publicId = publicIdWithResourceType.slice(separador + 1);

      const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hora

      return this.cloudinary.utils.private_download_url(publicId, '', {
        resource_type: resourceType,
        expires_at: expiresAt,
        attachment: false,
        type: 'authenticated',
      });
    } catch (error) {
      this.logger.error(
        `Erro ao gerar URL temporária: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`,
      );
      return '';
    }
  }
}
