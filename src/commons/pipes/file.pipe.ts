import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
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
