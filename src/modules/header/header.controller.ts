import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CarrosselBannerResponseDto } from './dto/carrosel-banner-response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { HeaderService } from './header.service';
import { HeaderCreateDto } from './dto/header-create.dto';
import { HeaderUpdateDto } from './dto/header-update.dto';

@Controller()
export class HeaderController {
  private readonly logger = new Logger(HeaderController.name);

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
  @Get()
  async getAll() {
    this.logger.log('Listando todos os banners do header...');
    return await this.headerService.listAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    this.logger.log(`Buscando banner do header com ID ${id}...`);
    return await this.headerService.findById(Number(id));
  }

  @Post()
  async create(@Body() headerDto: HeaderCreateDto) {
    this.logger.log('Criando novo banner do header...');
    return await this.headerService.create(headerDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() headerDto: HeaderUpdateDto) {
    this.logger.log(`Atualizando banner do header com ID ${id}...`);
    return await this.headerService.update(Number(id), headerDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    this.logger.log(`Deletando banner do header com ID ${id}...`);
    await this.headerService.delete(Number(id));
    return { message: `Banner do header com ID ${id} removido com sucesso` };
  }
}
