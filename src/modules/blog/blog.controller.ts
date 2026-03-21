import {
  Body,
  Controller,
  FileTypeValidator,
  Logger,
  MaxFileSizeValidator,
  ParseFilePipe,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Param,
  Put,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Blog } from 'src/models/blog.model';
import { BlogService } from './blog.service';
import { BlogCreateDto } from './dto/blog-create.dto';
import { BlogUpdateDto } from './dto/blog-update.dto';

@Controller('blog')
export class BlogController {
  private readonly logger = new Logger(BlogController.name);
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
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
  @UseInterceptors(FileInterceptor('imagem'))
  criarPost(
    @Body()
    blogDto: BlogCreateDto,
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
  ): Promise<Blog> {
    this.logger.log(`Iniciando criação de post no blog...`);

    return this.blogService.criarPost(blogDto, imagem);
  }

  @Get()
  getAll(): Promise<Blog[]> {
    this.logger.log(`Iniciando busca de todos os posts do blog...`);
    return this.blogService.getAll();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<Blog> {
    this.logger.log(`Iniciando busca de post do blog por Id...`);
    return this.blogService.getById(id);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Iniciando remoção de post do blog por Id...`);
    return this.blogService.deleteById(id);
  }

  @Put(':id')
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
  ): Promise<Blog> {
    this.logger.log(`Iniciando atualização de post no blog...`);
    return this.blogService.updateBlog(id, blogDto, imagem);
  }
}
