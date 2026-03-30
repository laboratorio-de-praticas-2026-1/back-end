import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { Empresa } from 'src/models/empresa.model';
import { Faq } from 'src/models/faq.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  controllers: [FaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}
