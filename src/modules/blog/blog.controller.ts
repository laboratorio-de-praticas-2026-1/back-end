import { Body, Controller, Logger, Post } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogCreateDto } from './dto/blog-create.dto';

@Controller('blog')
export class BlogController {
  private readonly logger = new Logger(BlogController.name);
  constructor(private readonly blogService: BlogService) {}

  @Post()
  criarPost(@Body() blogDto: BlogCreateDto) {
    this.logger.log(`Iniciando criação de post no blog...`);
    return this.blogService.criarPost(blogDto);
  }
}
