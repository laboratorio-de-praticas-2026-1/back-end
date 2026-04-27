import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
<<<<<<< HEAD
import { Faq } from 'src/models/faq.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriaFaq } from 'src/models/categoria-faq.model';
=======
// import { Empresa } from 'src/models/empresa.model';
// import { Faq } from 'src/models/faq.model';
// import { SequelizeModule } from '@nestjs/sequelize';
>>>>>>> origin/release/entrega-04-05

@Module({
  imports: [SequelizeModule.forFeature([Faq, CategoriaFaq])],
  controllers: [FaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}
