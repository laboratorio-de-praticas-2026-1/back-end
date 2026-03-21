import { Controller, Get } from '@nestjs/common';
import { HeaderService } from './header.service';

@Controller()
export class HeaderController {
  constructor(private readonly headerService: HeaderService) {}

  @Get('carrossel')
  async getCarrossel(): Promise<
    { id: number; url_imagem: string; descricao: string }[]
  > {
    return this.headerService.getBannersAtivos();
  }
}
