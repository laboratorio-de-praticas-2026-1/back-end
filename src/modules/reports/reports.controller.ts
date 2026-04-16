import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Relatorio } from 'src/models/relatorio.model';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({
    summary: 'Gerar Relatório PDF',
    description:
      'Endpoint para gerar um relatório PDF com base nos dados fornecidos.',
  })
  @ApiCreatedResponse({
    description:
      'Relatório gerado com sucesso. Retorna a URL temporária para acesso ao PDF e dados do relatório.',
    type: Relatorio,
  })
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  generateReport(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.generateReport(createReportDto);
  }
}
