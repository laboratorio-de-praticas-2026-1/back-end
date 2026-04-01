// src/notificacao/notificacao.module.ts

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificacaoService } from './notificacao.service';
import { NotificacaoController } from './notificacao.controller';
import { EmailModule } from '../email/email.module';
import { Usuario } from '../models/usuario.model';
import { Veiculo } from '../models/veiculo.model';

@Module({
  imports: [SequelizeModule.forFeature([Usuario, Veiculo]), EmailModule],
  controllers: [NotificacaoController],
  providers: [NotificacaoService],
  exports: [NotificacaoService],
})
export class NotificacaoModule {}
