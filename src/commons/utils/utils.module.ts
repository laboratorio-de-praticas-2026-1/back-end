import { Module } from '@nestjs/common';
import { CryptoUtil } from './crypto';
import { Formatters } from './formatters';

@Module({
  providers: [CryptoUtil, Formatters],
  exports: [CryptoUtil, Formatters],
})
export class UtilsModule {}
