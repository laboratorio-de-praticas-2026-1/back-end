import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';
import { UtilsModule } from 'src/commons/utils/utils.module';
import { Relatorio } from 'src/models/relatorio.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Debito } from 'src/models/debito.model';
import { DebitoServico } from 'src/models/debito-servico.model';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';
import { Pagamento } from 'src/models/pagamento.model';
import { Parcela } from 'src/models/parcela.model';
import { UsuarioModule } from '../usuario/usuario.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { ReportQueries } from './queries/reports.queries';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, PdfGeneratorService, ReportQueries],
  imports: [
    SequelizeModule.forFeature([
      Relatorio,
      Usuario,
      Veiculo,
      Servico,
      Solicitacao,
      DocumentoSolicitacao,
      Debito,
      DebitoServico,
      DebitoVeiculo,
      Pagamento,
      Parcela,
    ]),
    CloudinaryModule,
    UtilsModule,
    UsuarioModule,
  ],
})
export class ReportsModule {}
