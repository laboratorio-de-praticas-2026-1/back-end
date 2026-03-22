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
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Banner } from 'src/models/banner.model';
import { CarrosselBannerResponseDto } from './dto/carrosel-banner-response.dto';
import { HeaderCreateDto } from './dto/header-create.dto';
import { HeaderUpdateDto } from './dto/header-update.dto';
import { HeaderService } from './header.service';

@Controller('header')
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
  @ApiOperation({ summary: 'Listar todos os banners' })
  @ApiOkResponse({
    description: 'Lista de banners',
    type: Banner,
    isArray: true,
  })
  async getAll(): Promise<Banner[]> {
    this.logger.log('Listando todos os banners do header...');
    return await this.headerService.listAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar banner por ID' })
  @ApiOkResponse({ description: 'Banner  encontrado', type: Banner })
  async getById(@Param('id') id: string) {
    this.logger.log(`Buscando banner do header com ID ${id}...`);
    return await this.headerService.findById(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo banner' })
  @ApiOkResponse({ description: 'Banner criado', type: Banner })
  async create(@Body() headerDto: HeaderCreateDto) {
    this.logger.log('Criando novo banner do header...');
    return await this.headerService.create(headerDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um banner existente' })
  @ApiOkResponse({ description: 'Banner atualizado', type: Banner })
  async update(@Param('id') id: string, @Body() headerDto: HeaderUpdateDto) {
    this.logger.log(`Atualizando banner do header com ID ${id}...`);
    return await this.headerService.update(Number(id), headerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um banner por ID' })
  @ApiOkResponse({ description: 'Banner deletado' })
  async delete(@Param('id') id: string) {
    this.logger.log(`Deletando banner do header com ID ${id}...`);
    await this.headerService.delete(Number(id));
    return { message: `Banner do header com ID ${id} removido com sucesso` };
  }
}
