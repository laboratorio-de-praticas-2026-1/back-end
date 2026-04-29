import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MapaService } from './mapa.service';
import { EmpresaResponseDto } from './dto/empresa-response.dto';
import { Empresa } from '../../models/empresa.model';

@ApiTags('Mapa')
@Controller('mapa')
export class MapaController {
  constructor(private readonly mapaService: MapaService) {}

  private toDto(empresas: Empresa[]): EmpresaResponseDto[] {
    return empresas.map((e) => ({
      id: e.id,
      nomeFantasia: e.nomeFantasia,
      cnpj: e.cnpj,
      telefone: e.telefone,
      email: e.email,
      endereco: e.endereco,
      cidade: e.cidade,
      estado: e.estado,
      site: e.site,
      tipo: e.tipo,
      latitude: e.latitude,
      longitude: e.longitude,
    }));
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas com coordenadas válidas' })
  @ApiResponse({ status: 200, type: [EmpresaResponseDto] })
  async findAll(): Promise<EmpresaResponseDto[]> {
    return this.toDto(await this.mapaService.findAll());
  }

  @Get('tipo')
  @ApiOperation({ summary: 'Listar empresas por tipo' })
  @ApiQuery({ name: 'tipo', enum: ['clinica', 'vistoria', 'detran'] })
  @ApiResponse({ status: 200, type: [EmpresaResponseDto] })
  async findByTipo(
    @Query('tipo') tipo: 'clinica' | 'vistoria' | 'detran',
  ): Promise<EmpresaResponseDto[]> {
    return this.toDto(await this.mapaService.findByTipo(tipo));
  }

  @Get('cidade')
  @ApiOperation({ summary: 'Listar empresas por cidade' })
  @ApiQuery({ name: 'cidade', type: String })
  @ApiResponse({ status: 200, type: [EmpresaResponseDto] })
  async findByCidade(
    @Query('cidade') cidade: string,
  ): Promise<EmpresaResponseDto[]> {
    return this.toDto(await this.mapaService.findByCidade(cidade));
  }

  @Get('filtro')
  @ApiOperation({ summary: 'Listar empresas por tipo e/ou cidade' })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: ['clinica', 'vistoria', 'detran'],
  })
  @ApiQuery({ name: 'cidade', required: false, type: String })
  @ApiResponse({ status: 200, type: [EmpresaResponseDto] })
  async findComFiltro(
    @Query('tipo') tipo?: 'clinica' | 'vistoria' | 'detran',
    @Query('cidade') cidade?: string,
  ): Promise<EmpresaResponseDto[]> {
    return this.toDto(await this.mapaService.findComFiltro(tipo, cidade));
  }
}
