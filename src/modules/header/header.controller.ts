import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Logger,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AdminGuard } from '../usuario/guards/admin.guard';
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
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar um novo banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        descricao: {
          type: 'string',
          example: 'Banner de exemplo',
        },
        ativo: {
          type: 'boolean',
          example: true,
        },
        imagem: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['ativo', 'imagem'],
    },
  })
  @ApiOkResponse({ description: 'Banner criado', type: Banner })
  @UseInterceptors(FileInterceptor('imagem'))
  async create(
    @Body() headerDto: HeaderCreateDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        errorHttpStatusCode: 400,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: 'image/jpeg|image/png|image/svg\\+xml|image/webp',
          }),
        ],
      }),
    )
    imagem: Express.Multer.File,
  ): Promise<Banner> {
    this.logger.log('Criando novo banner do header...');
    return await this.headerService.create(headerDto, imagem);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        descricao: {
          type: 'string',
          example: 'Banner de exemplo',
        },
        ativo: {
          type: 'boolean',
          example: true,
        },
        imagem: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [],
    },
  })
  @ApiOkResponse({ description: 'Banner atualizado', type: Banner })
  @ApiOperation({ summary: 'Atualizar um banner existente' })
  @ApiOkResponse({ description: 'Banner atualizado', type: Banner })
  @UseInterceptors(FileInterceptor('imagem'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() headerDto: HeaderUpdateDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        errorHttpStatusCode: 400,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: 'image/jpeg|image/png|image/svg\\+xml|image/webp',
          }),
        ],
      }),
    )
    imagem?: Express.Multer.File,
  ): Promise<Banner> {
    this.logger.log(`Atualizando banner do header com ID ${id}...`);
    return await this.headerService.update(id, headerDto, imagem);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar um banner por ID' })
  @ApiOkResponse({ description: 'Banner deletado' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Deletando banner do header com ID ${id}...`);
    await this.headerService.delete(id);
    return { message: `Banner do header com ID ${id} removido com sucesso` };
  }
}
