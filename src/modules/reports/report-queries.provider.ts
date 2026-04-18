import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service'; // adjust path
import { ReportQueries as BaseReportQueries } from './queries/report.queries';

@Injectable()
export class ReportQueries extends BaseReportQueries {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService as any); // PrismaService extends PrismaClient
  }
}
