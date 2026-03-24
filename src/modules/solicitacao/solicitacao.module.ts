import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SolicitacaoService } from './solicitacao.service';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { NotificacaoModule } from '../notificacao/notificacao.module';
import { SolicitacaoController } from './solicitacao.controller';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Solicitacao,
      DocumentoSolicitacao,
      Usuario,
      Veiculo,
      Servico,
    ]),
    NotificacaoModule,
  ],
  controllers: [SolicitacaoController],
  providers: [SolicitacaoService],
})
export class SolicitacaoModule {}
