import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { MapaService } from './mapa.service';
import { EmpresaResponseDto } from './dto/empresa-response.dto';
import { Empresa } from 'src/models/empresa.model';

@Controller('mapa')
export class MapaController {
  constructor(private readonly mapaService: MapaService) {}

  private toDto(empresas: Empresa[]): EmpresaResponseDto[] {
    return empresas.map(
      (e) =>
        new EmpresaResponseDto(
          e.id,
          e.nomeFantasia ?? '',
          e.cnpj ?? '',
          e.telefone ?? '',
          e.email ?? '',
          e.endereco ?? '',
          e.cidade ?? '',
          e.estado ?? '',
          e.site ?? '',
        ),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Lista todas as empresas com coordenadas válidas para o mapa',
  })
  @ApiOkResponse({ type: [EmpresaResponseDto] })
  @ApiBadRequestResponse({ description: 'Erro ao buscar empresas' })
  async findAll(): Promise<EmpresaResponseDto[]> {
    try {
      const empresas = await this.mapaService.findAll();
      return this.toDto(empresas);
    } catch {
      throw new BadRequestException('Erro ao buscar empresas');
    }
  }

  @Get('tipo/:tipo')
  @ApiOperation({
    summary: 'Lista empresas filtradas por tipo',
  })
  @ApiOkResponse({ type: [EmpresaResponseDto] })
  @ApiBadRequestResponse({ description: 'Tipo inválido ou erro na busca' })
  async findByTipo(
    @Param('tipo') tipo: string,
  ): Promise<EmpresaResponseDto[]> {
    if (!tipo?.trim()) {
      throw new BadRequestException('O parâmetro tipo é obrigatório');
    }

    try {
      const empresas = await this.mapaService.findByTipo(tipo.trim());
      return this.toDto(empresas);
    } catch (error) {
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(
            `Erro ao buscar empresas do tipo: ${tipo}`,
          );
    }
  }

  @Get('cidade/:cidade')
  @ApiOperation({
    summary: 'Lista empresas filtradas por cidade',
  })
  @ApiOkResponse({ type: [EmpresaResponseDto] })
  @ApiBadRequestResponse({ description: 'Erro ao buscar por cidade' })
  async findByCidade(
    @Param('cidade') cidade: string,
  ): Promise<EmpresaResponseDto[]> {
    if (!cidade?.trim()) {
      throw new BadRequestException('O parâmetro cidade é obrigatório');
    }

    try {
      const empresas = await this.mapaService.findByCidade(cidade.trim());
      return this.toDto(empresas);
    } catch {
      throw new BadRequestException(
        `Erro ao buscar empresas da cidade: ${cidade}`,
      );
    }
  }

  @Get('filtro')
  @ApiOperation({
    summary: 'Filtra empresas por tipo, cidade ou ambos',
  })
  @ApiOkResponse({ type: [EmpresaResponseDto] })
  @ApiBadRequestResponse({ description: 'Erro ao aplicar filtros' })
  async findComFiltro(
    @Query('tipo') tipo?: string,
    @Query('cidade') cidade?: string,
  ): Promise<EmpresaResponseDto[]> {
    try {
      let empresas: Empresa[];

      if (!tipo && !cidade) {
        empresas = await this.mapaService.findAll();
      } else {
        empresas = await this.mapaService.findComFiltro(tipo, cidade);
      }

      return this.toDto(empresas);
    } catch (error) {
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Erro ao aplicar filtros');
    }
  }
}
