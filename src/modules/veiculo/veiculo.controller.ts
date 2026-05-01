import { Controller, Get, Logger, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Veiculo } from 'src/models/veiculo.model';
import { VeiculoService } from './veiculo.service';

@Controller('veiculo')
export class VeiculoController {
  private readonly logger = new Logger(VeiculoController.name);

  constructor(private readonly veiculoService: VeiculoService) {}

  @Get()
  @ApiOperation({ summary: 'Busca todos os veículos' })
  async getAll(): Promise<Veiculo[]> {
    this.logger.log('Iniciando busca de todos os veículos...');
    return this.veiculoService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um veículo pelo ID' })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Veiculo> {
    this.logger.log(`Iniciando busca de veículo por ID: ${id}`);
    return this.veiculoService.getById(id);
  }
}
