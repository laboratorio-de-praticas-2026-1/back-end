import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';

import { Faq } from 'src/models/faq.model';

import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [SequelizeModule.forFeature([Faq]), UsuarioModule],

  controllers: [FaqController],

  providers: [FaqService],

  exports: [FaqService],
})
export class FaqModule {}
