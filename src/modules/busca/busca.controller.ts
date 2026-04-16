import { Controller, Get, Logger, Query } from '@nestjs/common';
import { BuscaService } from './busca.service';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';
import { BuscaBannerStatusDto } from './dto/busca-banner-status.dto';
import { BuscaServicoFiltroDto } from './dto/busca-servico-filtro.dto';
import { BuscaPublicidadeStatusDto } from './dto/busca-publicidade-status.dto';
import { BuscaUsuarioFiltroDto } from './dto/busca-usuario-filtro.dto';
import { Blog } from 'src/models/blog.model';
import { Servico } from 'src/models/servico.model';
import { Usuario } from 'src/models/usuario.model';
import { ApiOperation } from '@nestjs/swagger';

@Controller('busca')
export class BuscaController {
  private readonly logger = new Logger(BuscaController.name);
  constructor(private readonly buscaService: BuscaService) {}

  @Get('blog/periodo')
  @ApiOperation({
    summary: 'Buscar blogs com base em um período de públicação específico',
    description:
      "Parâmetros: 'De' e 'Ate'. Pode-se utilizar apenas um ou ambos em conjunto",
  })
  buscarBlogsPorIntervaloDeData(@Query() dto: BuscaBlogIntervaloDto) {
    this.logger.log(
      `Buscando blogs por intervalo de data: de=${dto.de} ate=${dto.ate}`,
    );
    return this.buscaService.buscarBlogsPorIntervaloDeData(dto);
  }

  @Get('usuario/filtros')
  @ApiOperation({
    summary:
      'Buscar usuários por filtros (nível de usuário e data de cadastro)',
    description:
      'Parâmetros opcionais: nivel_usuario ("cliente" ou "administrador") e data_cadastro (data no formato YYYY-MM-DD).',
  })
  buscarUsuariosPorFiltros(
    @Query() dto: BuscaUsuarioFiltroDto,
  ): Promise<Usuario[]> {
    this.logger.log(
      `Buscando usuarios por filtros: nivel_usuario=${dto.nivel_usuario ?? 'n/a'} data_cadastro=${dto.data_cadastro ?? 'n/a'}`,
    );
    return this.buscaService.buscarUsuariosPorFiltros(dto);
  }

  @Get('banner/status')
  @ApiOperation({
    summary: "Buscar banners com base em status: 'ativo' e 'inativo'",
  })
  buscarBannerPorStatus(@Query() dto: BuscaBannerStatusDto) {
    this.logger.log(`Buscando banners por status: status=${dto.status}`);
    return this.buscaService.buscarBannerPorStatus(dto);
  }

  @Get('publicidade/status')
  @ApiOperation({
    summary: "Buscar publicidades com base em status: 'ativo' e 'inativo'",
  })
  buscarPublicidadePorStatus(@Query() dto: BuscaPublicidadeStatusDto) {
    this.logger.log(`Buscando publicidades por status: status=${dto.status}`);
    return this.buscaService.buscarPublicidadePorStatus(dto);
  }

  @Get('blog/termo')
  @ApiOperation({
    summary:
      'Buscar posts de blog por algum termo presente em conteúdo ou título',
  })
  listarBlog(@Query('termo') termo?: string): Promise<{
    itens: Blog[];
    mensagem?: string;
  }> {
    this.logger.log(
      `Listando posts do blog com filtro: ${termo ?? 'sem filtro'}`,
    );
    return this.buscaService.listarBlogByTermo(termo);
  }

  @Get('carrossel/termo')
  @ApiOperation({ summary: 'Buscar banners por termo presente em descrição.' })
  listarCarrossel(@Query('termo') termo?: string) {
    this.logger.log(
      `Listando itens do carrossel com filtro: ${termo ?? 'sem filtro'}`,
    );
    return this.buscaService.listarBannersByTermo(termo);
  }

  @Get('servico/filtros')
  @ApiOperation({
    summary:
      'Buscar serviços por filtros (valor base, prazo estimado e status)',
    description:
      'Parâmetros opcionais: valor_base (decimal), prazo_estimado (inteiro em dias) e status (ativo|inativo).',
  })
  buscarServicosPorFiltros(
    @Query() dto: BuscaServicoFiltroDto,
  ): Promise<Servico[]> {
    this.logger.log(
      `Buscando servicos por filtros: valor_base=${dto.valor_base ?? 'n/a'} prazo_estimado=${dto.prazo_estimado ?? 'n/a'} status=${dto.status ?? 'n/a'}`,
    );
    return this.buscaService.buscarServicosPorFiltros(dto);
  }
}
