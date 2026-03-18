import { Controller, Get, Logger, Query } from '@nestjs/common';
import { BuscaService } from './busca.service';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';

@Controller('busca')
export class BuscaController {
  private readonly logger = new Logger(BuscaController.name);
  constructor(private readonly buscaService: BuscaService) {}

  @Get('blogs_avancada')
  buscarBlogsPorIntervaloDeData(@Query() dto: BuscaBlogIntervaloDto) {
    this.logger.log(
      `Buscando blogs por intervalo de data: de=${dto.de} ate=${dto.ate}`,
    );
    return this.buscaService.buscarBlogsPorIntervaloDeData(dto);
  }
}
