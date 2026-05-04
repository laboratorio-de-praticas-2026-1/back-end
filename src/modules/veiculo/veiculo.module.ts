import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Veiculo } from 'src/models/veiculo.model';
import { VeiculoController } from './veiculo.controller';
import { VeiculoService } from './veiculo.service';

@Module({
  imports: [SequelizeModule.forFeature([Veiculo])],
  controllers: [VeiculoController],
  providers: [VeiculoService],
})
export class VeiculoModule {}
