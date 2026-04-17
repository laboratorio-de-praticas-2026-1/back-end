import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { RelatorioCategoriaResponseDto } from './dto/categoria-response.dto';
import { ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';

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
}
