import {
  BadRequestException,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  PipeTransform,
} from '@nestjs/common';

export const imageFilePipe = new ParseFilePipe({
  fileIsRequired: true,
  errorHttpStatusCode: 400,
  validators: [
    new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
    new FileTypeValidator({
      fileType: 'image/jpeg|image/png|image/svg\\+xml|image/webp',
    }),
  ],
});

const DOCUMENTO_MIME_TYPES = ['application/pdf'] as const;

export class DocumentoFilePipe implements PipeTransform {
  private readonly maxSize = 10 * 1024 * 1024; // 10mb

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException('Arquivo excede o tamanho máximo de 10MB');
    }

    if (!DOCUMENTO_MIME_TYPES.includes(file.mimetype as any)) {
      throw new BadRequestException(
        `Tipo de arquivo inválido. Tipos permitidos: PDF`,
      );
    }

    return file;
  }
}
