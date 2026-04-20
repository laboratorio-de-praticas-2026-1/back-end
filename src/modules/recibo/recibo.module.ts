import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UtilsModule } from 'src/commons/utils/utils.module';
import { DebitoSolicitacao } from 'src/models/debito-solicitacao.model';
import { Debito } from 'src/models/debito.model';
import { Pagamento } from 'src/models/pagamento.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { ReciboController } from './recibo.controller';
import { ReciboPdfGeneratorService } from './recibo-pdf-generator.service';
import { ReciboService } from './recibo.service';
import { ReciboQueries } from './queries/recibo.queries';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Solicitacao,
      Usuario,
      Veiculo,
      Servico,
      DebitoSolicitacao,
      Debito,
      Pagamento,
    ]),
    UtilsModule,
  ],
  controllers: [ReciboController],
  providers: [ReciboService, ReciboPdfGeneratorService, ReciboQueries],
})
export class ReciboModule {}
