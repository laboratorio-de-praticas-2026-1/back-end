import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';
import { FaqModule } from '../faq/faq.module';
import { ContatoController } from './contato.controller';
import { ContatoService } from './contato.service';

@Module({
  imports: [SequelizeModule.forFeature([Empresa])],
  controllers: [ContatoController],
  providers: [ContatoService],
})
export class ContatoModule {}
