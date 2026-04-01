import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ScheduleService } from './schedule.service';
import { NotificacaoModule } from '../notificacao/notificacao.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Usuario } from '../../models/usuario.model';
import { Veiculo } from '../../models/veiculo.model';

@Module({
  imports: [
    NestScheduleModule.forRoot(),
    SequelizeModule.forFeature([Usuario, Veiculo]),
    NotificacaoModule,
  ],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
