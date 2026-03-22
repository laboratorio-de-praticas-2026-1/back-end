import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Banner } from '../../models/banner.model';
import { CarrosselBannerResponseDto } from './dto/carrosel-banner-response.dto';

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
}
