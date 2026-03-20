import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogCreateDto } from './dto/blog-create.dto';

@Controller('blog')
export class BlogController {
  private readonly logger = new Logger(BlogController.name);
  constructor(private readonly blogService: BlogService) {}

  @Get()
  listarPosts(@Query('termo') termo?: string) {
    this.logger.log(
      `Listando posts do blog com filtro: ${termo ?? 'sem filtro'}`,
    );
    return this.blogService.listarPosts(termo);
  }

  @Post()
  criarPost(@Body() blogDto: BlogCreateDto) {
    this.logger.log(`Iniciando criação de post no blog...`);
    return this.blogService.criarPost(blogDto);
  }
}
