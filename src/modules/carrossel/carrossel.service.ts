import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Banner } from 'src/models/banner.model';

@Injectable()
export class CarrosselService {
  constructor(@InjectModel(Banner) private bannerModel: typeof Banner) {}

  async listarBanners(termo?: string): Promise<{
    itens: Banner[];
    mensagem?: string;
  }> {
    const termoNormalizado = termo?.trim();

    if (!termoNormalizado) {
      const itens = await this.bannerModel.findAll({ order: [['id', 'DESC']] });

      return {
        itens,
        mensagem:
          itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
      };
    }

    const filtros: Array<Record<string, unknown>> = [
      { descricao: { [Op.like]: `%${termoNormalizado}%` } },
    ];

    const termoEhInteiroDecimal = /^(0|[1-9]\d*)$/.test(termoNormalizado);
    if (termoEhInteiroDecimal) {
      const termoComoNumero = parseInt(termoNormalizado, 10);
      if (!Number.isNaN(termoComoNumero)) {
        filtros.push({ id: termoComoNumero });
      }
    }

    const itens = await this.bannerModel.findAll({
      where: { [Op.or]: filtros },
      order: [['id', 'DESC']],
    });

    return {
      itens,
      mensagem: itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
    };
  }
}
