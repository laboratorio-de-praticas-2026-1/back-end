import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { CloudinaryResponse } from 'src/infra/cloudinary/dto/cloudinary-response';
import { Blog } from 'src/models/blog.model';
import { BlogCreateDto } from './dto/blog-create.dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectModel(Blog)
    private blogModel: typeof Blog,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async criarPost(
    blogDto: BlogCreateDto,
    file: Express.Multer.File,
  ): Promise<Blog> {
    this.logger.log(`Iniciando criação de postagem do blog...`);
    let urlImagem: string = '';

    const response: CloudinaryResponse =
      await this.cloudinaryService.uploadFile(file);

    if ('secure_url' in response && typeof response.secure_url === 'string') {
      urlImagem = response.secure_url;
    } else {
      throw new InternalServerErrorException(
        'Erro ao executar upload do arquivo: resposta inesperada',
      );
    }

    return await this.blogModel.create({
      titulo: blogDto.titulo,
      conteudo: blogDto.conteudo,
      dataPublicacao: blogDto.dataPublicacao,
      urlImagem: urlImagem,
    });
  }
}
