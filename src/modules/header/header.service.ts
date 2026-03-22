import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Banner } from '../../models/banner.model';
import { CarrosselBannerResponseDto } from './dto/carrosel-banner-response.dto';
import { HeaderCreateDto } from './dto/header-create.dto';
import { HeaderUpdateDto } from './dto/header-update.dto';

@Injectable()
export class HeaderService {
  constructor(
    @InjectModel(Banner)
    private readonly bannerModel: typeof Banner,
  ) {}

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

  async create(headerDto: HeaderCreateDto): Promise<Banner> {
    const banner = await this.bannerModel.create({
      urlImagem: headerDto.urlImagem,
      descricao: headerDto.descricao,
      ativo: headerDto.ativo,
    });
    await banner.reload();
    return banner;
  }

  async update(id: number, headerDto: HeaderUpdateDto): Promise<Banner> {
    const banner = await this.findById(id);

    const updateData: Partial<Banner> = {};
    if (headerDto.urlImagem !== undefined) {
      updateData.urlImagem = headerDto.urlImagem;
    }
    if (headerDto.descricao !== undefined) {
      updateData.descricao = headerDto.descricao;
    }
    if (headerDto.ativo !== undefined) {
      updateData.ativo = headerDto.ativo;
    }

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
