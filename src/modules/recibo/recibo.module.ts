import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UtilsModule } from 'src/commons/utils/utils.module';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';
import { DebitoServico } from 'src/models/debito-servico.model';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';
import { Debito } from 'src/models/debito.model';
import { Pagamento } from 'src/models/pagamento.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { UsuarioModule } from '../usuario/usuario.module';
import { ReciboController } from './recibo.controller';
import { ReciboService } from './recibo.service';

@Module({
  controllers: [ReciboController],
  providers: [ReciboService],
  imports: [
    SequelizeModule.forFeature([
      Servico,
      Solicitacao,
      Veiculo,
      Usuario,
      DebitoServico,
      DebitoVeiculo,
      Debito,
      Pagamento,
    ]),
    CloudinaryModule,
    UtilsModule,
    UsuarioModule,
  ],
})
export class ReciboModule {}
