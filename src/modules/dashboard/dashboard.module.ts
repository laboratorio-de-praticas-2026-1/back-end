import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Solicitacao } from 'src/models/solicitacao.model';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { Servico } from 'src/models/servico.model';
import { Debito } from 'src/models/debito.model';
import { Pagamento } from 'src/models/pagamento.model';
import { Parcela } from 'src/models/parcela.model';
import { DebitoServico } from 'src/models/debito-servico.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Solicitacao,
      DocumentoSolicitacao,
      Usuario,
      Veiculo,
      Servico,
      Debito,
      Pagamento,
      Parcela,
      DebitoServico,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
