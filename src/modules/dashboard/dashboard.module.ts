import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Servico } from 'src/models/servico.model';

@Module({
  imports: [SequelizeModule.forFeature([Solicitacao, Servico])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
