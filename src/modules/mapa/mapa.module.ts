import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MapaService } from './mapa.service';
import { MapaController } from './mapa.controller';
import { Empresa } from 'src/models/empresa.model';

@Module({
  imports: [SequelizeModule.forFeature([Empresa])],
  controllers: [MapaController],
  providers: [MapaService],
})
export class MapaModule {}
