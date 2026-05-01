import { Controller, Get, Logger, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { Veiculo } from 'src/models/veiculo.model';
import { VeiculoService } from './veiculo.service';

@ApiTags('Veículo')
@Controller('veiculo')
export class VeiculoController {
  private readonly logger = new Logger(VeiculoController.name);

  constructor(private readonly veiculoService: VeiculoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os veículos' })
  @ApiResponse({ status: 200, type: Veiculo, isArray: true })
  async getAll(): Promise<Veiculo[]> {
    this.logger.log('Iniciando busca de todos os veículos...');
    return this.veiculoService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um veículo pelo ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do veículo' })
  @ApiResponse({ status: 200, type: Veiculo })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Veiculo> {
    this.logger.log(`Iniciando busca de veículo por ID: ${id}`);
    return this.veiculoService.getById(id);
  }
}
