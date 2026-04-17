import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Relatorio } from 'src/models/relatorio.model';
import { RelatorioCategoriaResponseDto } from './dto/categoria-response.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('categorias')
  @ApiOperation({
    summary: 'Retorna as categorias de relatórios disponíveis',
    description:
      'Fornece uma lista de categorias de relatórios, cada uma com um nome amigável e um valor identificador.',
  })
  @ApiOkResponse({
    description: 'Lista de categorias de relatórios retornada com sucesso',
    type: [RelatorioCategoriaResponseDto],
  })
  getCategorias(): RelatorioCategoriaResponseDto[] {
    return this.reportsService.getCategorias();
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
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
  generateReport(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.generateReport(createReportDto);
  }
}
