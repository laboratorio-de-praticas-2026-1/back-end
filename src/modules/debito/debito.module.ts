import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';
import { Debito } from 'src/models/debito.model';
import { Veiculo } from 'src/models/veiculo.model';
import { DebitoController } from './debito.controller';
import { DebitoService } from './debito.service';

@Module({
  imports: [SequelizeModule.forFeature([Veiculo, Debito, DebitoVeiculo])],
  controllers: [DebitoController],
  providers: [DebitoService],
})
export class DebitoModule {}
