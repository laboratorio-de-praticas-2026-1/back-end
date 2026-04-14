import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Debito } from '../../models/debito.model';
import { DebitoVeiculo } from '../../models/debito-veiculo.model';
import { Veiculo } from '../../models/veiculo.model';
import { DebitoController } from './debito.controller';
import { DebitoService } from './debito.service';

@Module({
  imports: [SequelizeModule.forFeature([Veiculo, Debito, DebitoVeiculo])],
  controllers: [DebitoController],
  providers: [DebitoService],
})
export class DebitoModule {}
