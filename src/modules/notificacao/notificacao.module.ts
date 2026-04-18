import { SequelizeModule } from '@nestjs/sequelize';
import { Module } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';
import { NotificacaoController } from './notificacao.controller';
@Module({
  imports: [SequelizeModule],
  providers: [NotificacaoService],
  controllers: [NotificacaoController],
  exports: [NotificacaoService],
})
export class NotificacaoModule {}