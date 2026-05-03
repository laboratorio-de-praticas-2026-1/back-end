import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Empresa } from 'src/models/empresa.model';
import { ContatoController } from './contato.controller';
import { ContatoService } from './contato.service';
import { EmailModule } from 'src/infra/email/email.module';

@Module({
  imports: [SequelizeModule.forFeature([Empresa]), EmailModule],
  controllers: [ContatoController],
  providers: [ContatoService],
  exports: [ContatoService],
})
export class ContatoModule {}
