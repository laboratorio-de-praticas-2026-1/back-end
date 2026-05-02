import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Blog } from 'src/models/blog.model';
import { Publicidade } from 'src/models/publicidade.model';
import { Empresa } from 'src/models/empresa.model';
import { Servico } from 'src/models/servico.model';
import { Usuario } from 'src/models/usuario.model';
import { BuscaService } from './busca.service';
import { BuscaBannerStatusDto } from './dto/busca-banner-status.dto';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';
import { BuscaEmpresaFiltroDto } from './dto/busca-empresa-filtro.dto';
import { BuscaPublicidadeStatusDto } from './dto/busca-publicidade-status.dto';
import { BuscaServicoFiltroDto } from './dto/busca-servico-filtro.dto';
import { BuscaUsuarioFiltroDto } from './dto/busca-usuario-filtro.dto';
import { BuscaFaqDto } from './dto/busca-faq.dto';

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

  @Get('publicidade/termo')
  @ApiOperation({
    summary: 'Buscar publicidades por termo presente em imagem, conteúdo ou id',
  })
  listarPublicidade(@Query('termo') termo?: string): Promise<{
    itens: Publicidade[];
    mensagem?: string;
  }> {
    this.logger.log(
      `Listando publicidades do CMS com filtro: ${termo?.trim() ?? 'sem filtro'}`,
    );
    return this.buscaService.listarPublicidadeByTermo(termo);
  }

  @Get('servico/filtros')
  @ApiOperation({
    summary:
      'Buscar serviços por filtros (faixa de valor base, faixa de prazo estimado e status)',
    description:
      'Parâmetros opcionais: valor_base_de, valor_base_ate, prazo_estimado_de, prazo_estimado_ate e status (ativo|inativo).',
  })
  buscarServicosPorFiltros(
    @Query() dto: BuscaServicoFiltroDto,
  ): Promise<Servico[]> {
    this.logger.log(
      `Buscando servicos por filtros: valor_base_de=${dto.valor_base_de ?? 'n/a'} valor_base_ate=${dto.valor_base_ate ?? 'n/a'} prazo_estimado_de=${dto.prazo_estimado_de ?? 'n/a'} prazo_estimado_ate=${dto.prazo_estimado_ate ?? 'n/a'} status=${dto.status ?? 'n/a'}`,
    );
    return this.buscaService.buscarServicosPorFiltros(dto);
  }

  @Get('empresa/filtros')
  @ApiOperation({
    summary: 'Buscar empresas por filtros (tipo, estado e cidade)',
    description:
      'Parâmetros opcionais: tipo (clinica|detran|vistoria), estado (UF) e cidade (string).',
  })
  buscarEmpresasPorFiltros(
    @Query() dto: BuscaEmpresaFiltroDto,
  ): Promise<Empresa[]> {
    this.logger.log(
      `Buscando empresas por filtros: tipo=${dto.tipo ?? 'n/a'} estado=${dto.estado ?? 'n/a'} cidade=${dto.cidade ?? 'n/a'}`,
    );
    return this.buscaService.buscarEmpresasPorFiltros(dto);
  }

  @Get('empresa/termo')
  @ApiOperation({
    summary:
      'Buscar empresas do CMS por nome fantasia, CNPJ, telefone, cidade ou site',
  })
  listarEmpresas(@Query('termo') termo?: string): Promise<{
    itens: Empresa[];
    mensagem?: string;
  }> {
    this.logger.log(
      `Listando empresas do CMS com filtro: ${termo?.trim() ?? 'sem filtro'}`,
    );
    return this.buscaService.listarEmpresasByTermo(termo);
  }

  @Get('empresa/estados')
  @ApiOperation({
    summary: 'Listar UFs (estados) disponíveis nas empresas',
    description:
      'Retorna apenas UFs únicas encontradas na tabela empresa (para preencher o filtro de estado).',
  })
  listarEstadosEmpresas(): Promise<string[]> {
    this.logger.log('Listando estados disponíveis nas empresas');
    return this.buscaService.listarEstadosEmpresas();
  }

  @Get('empresa/cidades')
  @ApiOperation({
    summary: 'Listar cidades disponíveis nas empresas (opcionalmente por UF)',
    description:
      'Sem UF retorna todas as cidades únicas; com UF retorna somente as cidades das empresas daquele estado.',
  })
  listarCidadesEmpresas(@Query('estado') estado?: string): Promise<string[]> {
    this.logger.log(
      `Listando cidades disponíveis nas empresas: estado=${estado?.trim() ?? 'n/a'}`,
    );
    return this.buscaService.listarCidadesEmpresas(estado);
  }

  @Get('usuario/termo')
  @ApiOperation({
    summary:
      'Buscar usuários do CMS por nome, email, CPF/CNPJ, celular ou data de cadastro',
  })
  listarUsuarios(@Query('termo') termo?: string): Promise<{
    itens: Usuario[];
    mensagem?: string;
  }> {
    this.logger.log(
      `Listando usuarios do CMS com filtro: ${termo?.trim() ?? 'sem filtro'}`,
    );
    return this.buscaService.listarUsuariosByTermo(termo);
  }

  @Get('servico/termo')
  @ApiOperation({
    summary:
      'Buscar serviços por termo simples nos campos nome, descrição, valor base e prazo estimado',
  })
  listarServicos(@Query('termo') termo?: string): Promise<{
    itens: Servico[];
    mensagem?: string;
  }> {
    this.logger.log(`Listando servicos com filtro: ${termo ?? 'sem filtro'}`);
    return this.buscaService.listarServicosByTermo(termo);
  }

  @Get('faq')
  @ApiOperation({
    summary:
      'Buscar FAQ por texto (pergunta/resposta/categoria) e filtros de status/categoria',
  })
  listarFaq(@Query() dto: BuscaFaqDto) {
    this.logger.log(
      `Buscando FAQ com filtros: termo=${dto.termo ?? '-'} status=${dto.status ?? '-'} categoria=${dto.categoria ?? '-'}`,
    );
    return this.buscaService.listarFaqByBusca(dto);
  }
}
