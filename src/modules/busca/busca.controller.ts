import { Controller, Get, Logger, Query } from '@nestjs/common';
import { BuscaService } from './busca.service';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';
import { BuscaBannerStatusDto } from './dto/busca-banner-status.dto';
import { Blog } from 'src/models/blog.model';

@Controller('busca')
export class BuscaController {
  private readonly logger = new Logger(BuscaController.name);
  constructor(private readonly buscaService: BuscaService) {}

  @Get('blog/periodo')
  buscarBlogsPorIntervaloDeData(@Query() dto: BuscaBlogIntervaloDto) {
    this.logger.log(
      `Buscando blogs por intervalo de data: de=${dto.de} ate=${dto.ate}`,
    );
    return this.buscaService.buscarBlogsPorIntervaloDeData(dto);
  }

  @Get('banner/status')
  buscarBannerPorStatus(@Query() dto: BuscaBannerStatusDto) {
    this.logger.log(`Buscando banners por status: status=${dto.status}`);
    return this.buscaService.buscarBannerPorStatus(dto);
  }
  @Get('blog/termo')
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
  listarCarrossel(@Query('termo') termo?: string) {
    this.logger.log(
      `Listando itens do carrossel com filtro: ${termo ?? 'sem filtro'}`,
    );
    return this.buscaService.listarBannersByTermo(termo);
  }
}
