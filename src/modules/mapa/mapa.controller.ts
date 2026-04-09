import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { MapaService } from './mapa.service';

@Controller('mapa')
export class MapaController {
  constructor(private readonly mapaService: MapaService) {}

  @Get()
  async findAll() {
    try {
      return await this.mapaService.findAll();
    } catch {
      throw new BadRequestException('Erro ao buscar empresas');
    }
  }

  @Get('tipo/:tipo')
  async findByTipo(@Param('tipo') tipo: string) {
    if (!tipo?.trim()) {
      throw new BadRequestException('O parâmetro tipo é obrigatório');
    }

    try {
      return await this.mapaService.findByTipo(tipo.trim());
    } catch (error) {
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(`Erro ao buscar empresas do tipo: ${tipo}`);
    }
  }

  @Get('cidade/:cidade')
  async findByCidade(@Param('cidade') cidade: string) {
    if (!cidade?.trim()) {
      throw new BadRequestException('O parâmetro cidade é obrigatório');
    }

    try {
      return await this.mapaService.findByCidade(cidade.trim());
    } catch {
      throw new BadRequestException(
        `Erro ao buscar empresas da cidade: ${cidade}`,
      );
    }
  }

  @Get('filtro')
  async findComFiltro(
    @Query('tipo') tipo?: string,
    @Query('cidade') cidade?: string,
  ) {
    try {
      if (!tipo && !cidade) {
        return await this.mapaService.findAll();
      }

      return await this.mapaService.findComFiltro(tipo, cidade);
    } catch (error) {
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Erro ao aplicar filtros');
    }
  }
}
