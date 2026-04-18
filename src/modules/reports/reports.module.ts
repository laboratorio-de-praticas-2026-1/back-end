import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Relatorio } from 'src/models/relatorio.model';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';
import { UtilsModule } from 'src/commons/utils/utils.module';
import { PdfGeneratorService } from './pdf-generator.service';
import { ReportQueries } from './queries/report.queries';
import { PrismaModule } from 'src/infra/prisma/prisma.module'; // adjust path if needed

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, PdfGeneratorService, ReportQueries],
  imports: [
    SequelizeModule.forFeature([Relatorio]),
    CloudinaryModule,
    UtilsModule,
    PrismaModule, // por conta do ReportQueries
  ],
})
export class ReportsModule {}
