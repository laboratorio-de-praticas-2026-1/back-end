import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { CloudinaryResponse } from 'src/infra/cloudinary/dto/cloudinary-response';
import { Blog, CategoriaBlog } from 'src/models/blog.model';
import { BlogCreateDto } from './dto/blog-create.dto';
import { BlogUpdateDto } from './dto/blog-update.dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectModel(Blog)
    private blogModel: typeof Blog,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async uploadImageFile(file: Express.Multer.File): Promise<string> {
    const response: CloudinaryResponse =
      await this.cloudinaryService.uploadFile(file);

    if ('secure_url' in response && typeof response.secure_url === 'string') {
      return response.secure_url;
    }

    throw new InternalServerErrorException(
      'Erro ao executar upload do arquivo: resposta inesperada',
    );
  }

  async criarPost(
    blogDto: BlogCreateDto,
    file: Express.Multer.File,
  ): Promise<Blog> {
    this.logger.log(`Iniciando criação de postagem do blog...`);
    const urlImagem = await this.uploadImageFile(file);

    return await this.blogModel.create({
      ...blogDto,
      ativo: blogDto.ativo ?? true,
      categoria: blogDto.categoria ?? CategoriaBlog.Documentacao,
      urlImagem,
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

  async updateBlog(
    id: number,
    blogDto: BlogUpdateDto,
    file?: Express.Multer.File,
  ): Promise<Blog> {
    this.logger.log(`Iniciando atualização de post do blog com ID: ${id}`);
    const blog = await this.blogModel.findByPk(id);

    if (!blog) {
      throw new NotFoundException('Post não encontrado');
    }

    const updateData: Partial<Blog> = { ...blogDto };

    if (file) {
      updateData.urlImagem = await this.uploadImageFile(file);
    }

    await blog.update(updateData);
    return blog;
  }
}
