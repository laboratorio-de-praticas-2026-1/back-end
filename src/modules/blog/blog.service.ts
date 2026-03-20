import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Blog } from 'src/models/blog.model';
import { Op } from 'sequelize';
import { BlogCreateDto } from './dto/blog-create.dto';

@Injectable()
export class BlogService {
  constructor(@InjectModel(Blog) private blogModel: typeof Blog) {}

  async listarPosts(termo?: string): Promise<{
    itens: Blog[];
    mensagem?: string;
  }> {
    const termoNormalizado = termo?.trim();

    if (!termoNormalizado) {
      const itens = await this.blogModel.findAll({ order: [['id', 'DESC']] });

      return {
        itens,
        mensagem:
          itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
      };
    }

    const filtros: Array<Record<string, unknown>> = [
      { titulo: { [Op.like]: `%${termoNormalizado}%` } },
      { conteudo: { [Op.like]: `%${termoNormalizado}%` } },
    ];

    const termoComoNumero = Number(termoNormalizado);
    if (!Number.isNaN(termoComoNumero)) {
      filtros.push({ id: termoComoNumero });
    }

    const itens = await this.blogModel.findAll({
      where: { [Op.or]: filtros },
      order: [['id', 'DESC']],
    });

    return {
      itens,
      mensagem: itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
    };
  }

  async criarPost(blogDto: BlogCreateDto): Promise<Blog> {
    return await this.blogModel.create({
      titulo: blogDto.titulo,
      conteudo: blogDto.conteudo,
      dataPublicacao: blogDto.dataPublicacao,
      urlImagem: blogDto.urlImagem,
    });
  }
}
