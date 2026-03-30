// No arquivo notificacao.module.ts
import { Module } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';
import { NotificacaoGateway } from './notificacao.gateway';
import { NotificacaoController } from './notificacao.controller';

@Module({
  controllers: [NotificacaoController],
  providers: [
    NotificacaoGateway, 
    NotificacaoService,
    // Se o seu projeto já tem um serviço de banco de dados, coloque o nome dele aqui
  ],
  exports: [NotificacaoService],
})
export class NotificacaoModule {}