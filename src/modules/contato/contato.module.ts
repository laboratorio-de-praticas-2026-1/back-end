import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { EmailEnviado } from 'src/models/email-enviado.model';
import { Empresa } from 'src/models/empresa.model';

import { ContatoController } from './contato.controller';
import { ContatoService } from './contato.service';

import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [SequelizeModule.forFeature([Empresa, EmailEnviado]), UsuarioModule],

  controllers: [ContatoController],

  providers: [ContatoService],

  exports: [ContatoService],
})
export class ContatoModule {}
