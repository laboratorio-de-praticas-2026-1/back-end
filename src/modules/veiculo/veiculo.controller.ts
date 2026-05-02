import { Body, Controller, Get, Logger, Param, ParseIntPipe,  Delete,
  HttpCode, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { Veiculo } from 'src/models/veiculo.model';
import { VeiculoService } from './veiculo.service';
import { VeiculoCreateDto } from './dto/veiculo-create.dto';
import { VeiculoUpdateDto } from './dto/veiculo-update.dto';

@ApiTags('Veículo')
@Controller('veiculo')
export class VeiculoController {
  private readonly logger = new Logger(VeiculoController.name);

  constructor(private readonly veiculoService: VeiculoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo veículo' })
  @ApiBody({ type: VeiculoCreateDto })
  @ApiResponse({ status: 201, type: Veiculo, description: 'Veículo criado com sucesso' })
  async criarVeiculo(@Body() veiculoDto: VeiculoCreateDto): Promise<Veiculo> {
    this.logger.log('Iniciando criação de veículo...');
    return this.veiculoService.criarVeiculo(veiculoDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um veículo existente' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do veículo' })
  @ApiBody({ type: VeiculoUpdateDto })
  @ApiResponse({ status: 200, type: Veiculo, description: 'Veículo atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  async atualizarVeiculo(
    @Param('id', ParseIntPipe) id: number,
    @Body() veiculoDto: VeiculoUpdateDto,
  ): Promise<Veiculo> {
    this.logger.log(`Iniciando atualização de veículo com ID: ${id}`);
    return this.veiculoService.atualizarVeiculo(id, veiculoDto);
  }

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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um veículo pelo ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do veículo' })
  @ApiResponse({ status: 204, description: 'Veículo removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  async deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Removendo veículo com ID: ${id}`);
    return this.veiculoService.deleteById(id);
  }
}
