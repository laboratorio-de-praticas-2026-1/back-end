import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { CloudinaryResponse } from 'src/infra/cloudinary/dto/cloudinary-response';
import { Banner } from '../../models/banner.model';
import { CarrosselBannerResponseDto } from './dto/carrosel-banner-response.dto';
import { HeaderCreateDto } from './dto/header-create.dto';
import { HeaderUpdateDto } from './dto/header-update.dto';

@Injectable()
export class HeaderService {
  private readonly logger = new Logger(HeaderService.name);

  constructor(
    @InjectModel(Banner)
    private readonly bannerModel: typeof Banner,
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

  async getBannersAtivos(): Promise<CarrosselBannerResponseDto[]> {
    return await this.bannerModel.findAll({
      where: { ativo: true },
      order: [['id', 'ASC']],
      attributes: [
        ['id', 'id'],
        ['url_imagem', 'urlImagem'],
        ['descricao', 'descricao'],
      ],
      raw: true,
    });
  }

  async listAll(): Promise<Banner[]> {
    return await this.bannerModel.findAll();
  }

  async findById(id: number): Promise<Banner> {
    const banner = await this.bannerModel.findByPk(id);
    if (!banner) {
      throw new NotFoundException(`Banner com ID ${id} não encontrado`);
    }
    return banner;
  }

  async create(
    headerDto: HeaderCreateDto,
    file: Express.Multer.File,
  ): Promise<Banner> {
    const urlImagem = await this.uploadImageFile(file);

    const banner = await this.bannerModel.create({
      urlImagem: urlImagem,
      descricao: headerDto.descricao,
      ativo: headerDto.ativo,
    });
    await banner.reload();
    return banner;
  }

  async update(
    id: number,
    headerDto: HeaderUpdateDto,
    file?: Express.Multer.File,
  ): Promise<Banner> {
    const banner = await this.findById(id);

    const updateData: Partial<Banner> = {};

    if (file) {
      updateData.urlImagem = await this.uploadImageFile(file);
    }

    this.logger.log('aaaaaa');
    this.logger.log(headerDto.descricao !== undefined);
    if (headerDto.descricao !== undefined) {
      updateData.descricao = headerDto.descricao;
    }

    if (headerDto.ativo !== undefined) {
      updateData.ativo = headerDto.ativo;
    }
    this.logger.log('Dados para atualização: ' + JSON.stringify(updateData));

    if (Object.keys(updateData).length > 0) {
      await banner.update(updateData);
    }

    await banner.reload();
    return banner;
  }

  async delete(id: number): Promise<void> {
    const banner = await this.findById(id);
    await banner.destroy();
  }
}
