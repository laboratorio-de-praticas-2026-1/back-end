import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { CloudinaryResponse } from 'src/infra/cloudinary/dto/cloudinary-response';
import { Publicidade } from 'src/models/publicidade.model';
import { PublicidadeCreateDto } from './dto/publicidade-create.dto';
import { PublicidadeUpdateDto } from './dto/publicidade-update.dto';

@Injectable()
export class PublicidadeService {
  private readonly logger = new Logger(PublicidadeService.name);

  constructor(
    @InjectModel(Publicidade)
    private publicidadeModel: typeof Publicidade,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async uploadImageFile(file: Express.Multer.File): Promise<string> {
    this.logger.log(`Iniciando upload de imagem da publicidade...`);
    const response: CloudinaryResponse =
      await this.cloudinaryService.uploadFile(file);

    if ('secure_url' in response && typeof response.secure_url === 'string') {
      return response.secure_url;
    }

    throw new InternalServerErrorException(
      'Erro ao executar upload do arquivo: resposta inesperada',
    );
  }

  async update(
    id: number,
    dto: PublicidadeUpdateDto,
    file?: Express.Multer.File,
  ): Promise<Publicidade> {
    this.logger.log(`Atualizando publicidade ID: ${id}`);

    const publicidade = await this.publicidadeModel.findByPk(id);

    if (!publicidade) {
      throw new NotFoundException('Publicidade n�o encontrada');
    }

    const updateData: Partial<Publicidade> = { ...dto };

    if (file) {
      updateData.urlImagem = await this.uploadImageFile(file);
    }

    const updated = await publicidade.update(updateData);

    return updated;
  }

  async criarPublicidade(
    publicidadeDto: PublicidadeCreateDto,
    file: Express.Multer.File,
  ): Promise<Publicidade> {
    const urlImagem = await this.uploadImageFile(file);

    return await this.publicidadeModel.create({
      titulo: publicidadeDto.titulo,
      conteudo: publicidadeDto.conteudo,
      urlImagem,
    });
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removendo publicidade ID: ${id}`);

    const publicidade = await this.publicidadeModel.findByPk(id);

    if (!publicidade) {
      throw new NotFoundException('Publicidade n�o encontrada');
    }

    await publicidade.destroy();
  }
}
