import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Banner } from '../../models/banner.model';

@Injectable()
export class HeaderService {
  constructor(
    @InjectModel(Banner)
    private readonly bannerModel: typeof Banner,
  ) {}

  async getBannersAtivos(): Promise<
    { id: number; url_imagem: string; descricao: string }[]
  > {
    const banners = await this.bannerModel.findAll({
      where: { ativo: true },
    });

    return banners.map((banner) => ({
      id: banner.id,
      url_imagem: banner.urlImagem || '',
      descricao: banner.descricao || '',
    }));
  }
}
