import { Module } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';
import { NotificacaoGateway } from './notificacao.gateway';

@Module({
  providers: [NotificacaoGateway, NotificacaoService],
  exports: [NotificacaoService],
})
export class NotificacaoModule {}
