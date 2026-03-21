import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Blog } from 'src/models/blog.model';
import { BlogCreateDto } from './dto/blog-create.dto';

@Injectable()
export class BlogService {
  constructor(@InjectModel(Blog) private blogModel: typeof Blog) {}

  async criarPost(blogDto: BlogCreateDto): Promise<Blog> {
    return await this.blogModel.create({
      titulo: blogDto.titulo,
      conteudo: blogDto.conteudo,
      dataPublicacao: blogDto.dataPublicacao,
      urlImagem: blogDto.urlImagem,
    });
  }
}
