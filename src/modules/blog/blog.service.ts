import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getAll(): Promise<Blog[]> {
    return this.blogModel.findAll();
  }

  async getById(id: number): Promise<Blog> {
    const blog = await this.blogModel.findByPk(id);

    if (!blog) {
      throw new NotFoundException('Post não encontrado');
    }

    return blog;
  }

  async deleteById(id: number): Promise<void> {
    const blog = await this.blogModel.findByPk(id);

    if (!blog) {
      throw new NotFoundException('Post não encontrado');
    }

    await blog.destroy();
  }

  async updateBlog(id: number, blogDto: BlogCreateDto): Promise<Blog> {
    const blog = await this.blogModel.findByPk(id);

    if (!blog) {
      throw new NotFoundException('Post não encontrado');
    }

    await blog.update({
      titulo: blogDto.titulo,
      conteudo: blogDto.conteudo,
      dataPublicacao: blogDto.dataPublicacao,
      urlImagem: blogDto.urlImagem,
    });

    return blog;
  }
}
