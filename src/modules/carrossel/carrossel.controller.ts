import { Controller, Get, Logger, Query } from '@nestjs/common';
import { CarrosselService } from './carrossel.service';

@Controller(['carrossel', 'banner'])
export class CarrosselController {
  private readonly logger = new Logger(CarrosselController.name);

  constructor(private readonly carrosselService: CarrosselService) {}

  @Get()
  listarBanners(@Query('termo') termo?: string) {
    this.logger.log(`Listando itens do carrossel com filtro: ${termo ?? 'sem filtro'}`);
    return this.carrosselService.listarBanners(termo);
  }
}
