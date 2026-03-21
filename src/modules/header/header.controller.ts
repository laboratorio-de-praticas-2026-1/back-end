import { Controller, Get } from '@nestjs/common';
import { HeaderService } from './header.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CarrosselBannerResponseDto } from './dto/carrosel-banner-response.dto';

@Controller()
export class HeaderController {
  constructor(private readonly headerService: HeaderService) {}

  @Get('carrossel')
  @ApiOperation({
    summary: 'Obter banners para o carrossel',
    description: 'Retorna os banners ativos para o carrossel do site',
  })
  @ApiOkResponse({
    description: 'Retorna os banners ativos para o carrossel do site',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'ID único do banner',
            example: 1,
          },
          urlImagem: {
            type: 'string',
            description: 'URL da imagem do banner',
            example: 'https://exemplo.com/imagem.jpg',
          },
          descricao: {
            type: 'string',
            description: 'Descrição ou título do banner',
            example: 'Banner promocional',
          },
        },
      },
    },
    isArray: true,
  })
  async getCarrossel(): Promise<CarrosselBannerResponseDto[]> {
    return this.headerService.getBannersAtivos();
  }
}
