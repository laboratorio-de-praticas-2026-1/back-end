import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServicosController } from './servicos.controller';
import { ServicosService } from './servicos.service';
import { Servico } from 'src/models/servico.model';

@Module({
  imports: [SequelizeModule.forFeature([Servico])],
  controllers: [ServicosController],
  providers: [ServicosService],
})
export class ServicosModule {}
