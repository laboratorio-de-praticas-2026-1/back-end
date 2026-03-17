import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServicosService } from './servicos.service';
import { ServicosController } from './servicos.controller';
import { Solicitacao } from '../../models/solicitacao.model';
import { Usuario } from '../../models/usuario.model';
import { Veiculo } from '../../models/veiculo.model';
import { Servico } from '../../models/servico.model';

@Module({
  imports: [SequelizeModule.forFeature([Solicitacao, Usuario, Veiculo, Servico])],
  controllers: [ServicosController],
  providers: [ServicosService],
})
export class ServicosModule {}
