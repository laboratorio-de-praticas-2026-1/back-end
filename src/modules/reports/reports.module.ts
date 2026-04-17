import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Relatorio } from 'src/models/relatorio.model';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';
import { UtilsModule } from 'src/commons/utils/utils.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [
    SequelizeModule.forFeature([Relatorio]),
    CloudinaryModule,
    UtilsModule,
  ],
})
export class ReportsModule {}
