import { Controller, Get, Logger, Query } from '@nestjs/common';
import { BuscaService } from './busca.service';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';
import { BuscaBannerStatusDto } from './dto/busca-banner-status.dto';
import { Blog } from 'src/models/blog.model';
import { ApiOperation } from '@nestjs/swagger';
import { Usuario } from 'src/models/usuario.model';

@Controller('busca')
export class BuscaController {
  private readonly logger = new Logger(BuscaController.name);
  constructor(private readonly buscaService: BuscaService) { }

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

  @Get('banner/status')
  @ApiOperation({
    summary: "Buscar banners com base em status: 'ativo' e 'inativo'",
  })
  buscarBannerPorStatus(@Query() dto: BuscaBannerStatusDto) {
    this.logger.log(`Buscando banners por status: status=${dto.status}`);
    return this.buscaService.buscarBannerPorStatus(dto);
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
      `Listando usuarios do CMS com filtro: ${termo ?? 'sem filtro'}`,
    );
    return this.buscaService.listarUsuariosByTermo(termo);
  }
}
