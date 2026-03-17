import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SolicitacaoService } from './solicitacao.service';
import { SolicitacaoController } from './solicitacao.controller';
import { Solicitacao } from '../../models/solicitacao.model';
import { Usuario } from '../../models/usuario.model';
import { Veiculo } from '../../models/veiculo.model';
import { Servico } from '../../models/servico.model';

@Module({
  imports: [SequelizeModule.forFeature([Solicitacao, Usuario, Veiculo, Servico])],
  controllers: [SolicitacaoController],
  providers: [SolicitacaoService],
})
export class SolicitacaoModule {}
