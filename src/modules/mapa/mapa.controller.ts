import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { MapaService } from './mapa.service';
import { EmpresaResponseDto } from './dto/empresa-response.dto';

@Controller('mapa')
export class MapaController {
  constructor(private readonly mapaService: MapaService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista todas as empresas com coordenadas para exibição no mapa',
  })
  @ApiOkResponse({ type: EmpresaResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Nenhuma empresa encontrada' })
  findAll(): Promise<EmpresaResponseDto[]> {
    return this.mapaService.findAll();
  }

  @Get('tipo/:tipo')
  @ApiOperation({
    summary: 'Filtra empresas por tipo (clinica, vistoria, detran)',
  })
  @ApiOkResponse({ type: EmpresaResponseDto, isArray: true })
  @ApiNotFoundResponse({
    description: 'Nenhuma empresa encontrada para o tipo informado',
  })
  findByTipo(@Param('tipo') tipo: string): Promise<EmpresaResponseDto[]> {
    return this.mapaService.findByTipo(tipo);
  }

  @Get('cidade/:cidade')
  @ApiOperation({
    summary: 'Filtra empresas por cidade',
  })
  @ApiOkResponse({ type: EmpresaResponseDto, isArray: true })
  @ApiNotFoundResponse({
    description: 'Nenhuma empresa encontrada para a cidade informada',
  })
  findByCidade(@Param('cidade') cidade: string): Promise<EmpresaResponseDto[]> {
    return this.mapaService.findByCidade(cidade);
  }

  @Get('filtro')
  @ApiOperation({
    summary: 'Filtra empresas por tipo e/ou cidade',
  })
  @ApiOkResponse({ type: EmpresaResponseDto, isArray: true })
  @ApiNotFoundResponse({
    description: 'Nenhuma empresa encontrada com os filtros informados',
  })
  findComFiltro(
    @Query('tipo') tipo?: string,
    @Query('cidade') cidade?: string,
  ): Promise<EmpresaResponseDto[]> {
    return this.mapaService.findComFiltro(tipo, cidade);
  }
}
