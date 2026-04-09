import { Module } from '@nestjs/common';
import { FileConversorService } from './file-conversor.service';

@Module({
  providers: [FileConversorService],
})
export class FileConversorModule {}
