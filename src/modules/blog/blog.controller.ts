import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { Blog } from 'src/models/blog.model';
import { BlogService } from './blog.service';
import { BlogCreateDto } from './dto/blog-create.dto';

@Controller('blog')
export class BlogController {
  private readonly logger = new Logger(BlogController.name);
  constructor(private readonly blogService: BlogService) {}

  @Post()
  criarPost(@Body() blogDto: BlogCreateDto): Promise<Blog> {
    this.logger.log(`Iniciando criação de post no blog...`);
    return this.blogService.criarPost(blogDto);
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
  updateBlog(
    @Param('id', ParseIntPipe) id: number,
    @Body() blogDto: BlogCreateDto,
  ): Promise<Blog> {
    this.logger.log(`Iniciando atualização de post no blog...`);
    return this.blogService.updateBlog(id, blogDto);
  }
}
