import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Debito } from 'src/models/debito.model';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Pagamento } from 'src/models/pagamento.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Parcela } from 'src/models/parcela.model';
import { Usuario } from '../../models/usuario.model';
import { Veiculo } from '../../models/veiculo.model';
import { Servico } from '../../models/servico.model';
import { DebitoServico } from '../../models/debito-servico.model';
import { DebitoVeiculo } from '../../models/debito-veiculo.model';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
import { RolesGuard } from '../usuario/guards/roles.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Solicitacao,
      DocumentoSolicitacao,
      Debito,
      Pagamento,
      Parcela,
      Usuario,
      Veiculo,
      Servico,
      DebitoServico,
      DebitoVeiculo,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, JwtAuthGuard, RolesGuard],
})
export class DashboardModule {}
