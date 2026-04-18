import { Module } from '@nestjs/common';
import { CryptoUtil } from './crypto';

@Module({
  providers: [CryptoUtil],
  exports: [CryptoUtil],
})
export class UtilsModule {}
