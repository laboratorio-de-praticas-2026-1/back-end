import {
  Body,
  Controller,
  Logger,
  Get,
  Post,
  UseInterceptors,
  ParseIntPipe,
  Param,
  Put,
  Delete,
  HttpCode,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { Blog } from 'src/models/blog.model';
import { BlogService } from './blog.service';
import { BlogCreateDto } from './dto/blog-create.dto';
import { BlogUpdateDto } from './dto/blog-update.dto';
import { imageFilePipe } from 'src/commons/pipes/file.pipe';

@Controller('blog')
export class BlogController {
  private readonly logger = new Logger(BlogController.name);
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo post para o blog' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', example: 'Meu Primeiro Post' },
        conteudo: { type: 'string', example: 'Conteúdo do post aqui...' },
        dataPublicacao: {
          type: 'string',
          format: 'date',
          example: '2026-03-21',
        },
        imagem: { type: 'string', format: 'binary' },
      },
      required: ['titulo', 'conteudo', 'dataPublicacao', 'imagem'],
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagem'))
  criarPost(
    @Body()
    blogDto: BlogCreateDto,
    @UploadedFile(imageFilePipe)
    imagem: Express.Multer.File,
  ): Promise<Blog> {
    this.logger.log(`Iniciando criação de post no blog...`);

    return this.blogService.criarPost(blogDto, imagem);
  }

  @Get()
  @ApiOperation({ summary: 'Busca todos os posts do blog' })
  getAll(): Promise<Blog[]> {
    this.logger.log(`Iniciando busca de todos os posts do blog...`);
    return this.blogService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um post do blog pelo id' })
  getById(@Param('id', ParseIntPipe) id: number): Promise<Blog> {
    this.logger.log(`Iniciando busca de post do blog por Id...`);
    return this.blogService.getById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um post do blog pelo id' })
  @HttpCode(204)
  deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Iniciando remoção de post do blog por Id...`);
    return this.blogService.deleteById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um post do blog' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: {
          type: 'string',
          nullable: true,
          example: 'Título Atualizado',
        },
        conteudo: {
          type: 'string',
          nullable: true,
          example: 'Conteúdo atualizado...',
        },
        dataPublicacao: {
          type: 'string',
          format: 'date',
          nullable: true,
          example: '2026-03-21',
        },
        imagem: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('imagem'))
  updateBlog(
    @Param('id', ParseIntPipe) id: number,
    @Body() blogDto: BlogUpdateDto,
    @UploadedFile(imageFilePipe)
    imagem?: Express.Multer.File,
  ): Promise<Blog> {
    this.logger.log(`Iniciando atualização de post no blog...`);
    return this.blogService.updateBlog(id, blogDto, imagem);
  }
}
