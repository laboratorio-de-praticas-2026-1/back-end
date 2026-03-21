import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, Op, where } from 'sequelize';
import { Banner } from 'src/models/banner.model';
import { Blog } from 'src/models/blog.model';
import { CarrosselService } from '../carrossel/carrossel.service';
import { BuscaBannerStatusDto } from './dto/busca-banner-status.dto';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';

@Injectable()
export class BuscaService {
  constructor(
    @InjectModel(Blog) private blogModel: typeof Blog,
    private readonly carrosselService: CarrosselService,
  ) {}

  async buscarBlogsPorIntervaloDeData(
    dto: BuscaBlogIntervaloDto,
  ): Promise<Blog[]> {
    if (!dto.de && !dto.ate) {
      throw new BadRequestException('Informe ao menos uma data: "de" ou "ate"');
    }

    const de = dto.de ? this.parseYmdDate(dto.de, 'de') : undefined;
    const ate = dto.ate ? this.parseYmdDate(dto.ate, 'ate') : undefined;

    if (de && ate && de.key > ate.key) {
      throw new BadRequestException(
        'Intervalo inválido: "de" não pode ser maior que "ate"',
      );
    }

    const inicio = de ? de.ymd : undefined;
    const fimInclusivo = ate ? ate.ymd : undefined;

    const filtros = [
      ...(inicio ? [where(col('data_publicacao'), Op.gte, inicio)] : []),
      ...(fimInclusivo
        ? [where(col('data_publicacao'), Op.lte, fimInclusivo)]
        : []),
    ];

    return await this.blogModel.findAll({
      where: {
        [Op.and]: filtros,
      },
    });
  }

  async buscarBannerPorStatus(dto: BuscaBannerStatusDto): Promise<Banner[]> {
    const ativo = dto.status === 'ativo';
    return await this.bannerModel.findAll({
      where: {
        ativo,
      },
    });
  }

  private parseYmdDate(
    valor: string,
    campo: string,
  ): { ymd: string; key: number } {
    const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new BadRequestException(
        `Campo "${campo}" deve estar no formato YYYY-MM-DD`,
      );
    }

    const dia = Number(match[3]);
    const mes = Number(match[2]);
    const ano = Number(match[1]);

    const dataUtc = new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0, 0));

    const isDataValida =
      dataUtc.getUTCFullYear() === ano &&
      dataUtc.getUTCMonth() === mes - 1 &&
      dataUtc.getUTCDate() === dia;

    if (!isDataValida) {
      throw new BadRequestException(`Data inválida no campo "${campo}"`);
    }

    return {
      ymd: `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(
        dia,
      ).padStart(2, '0')}`,
      key: ano * 10000 + mes * 100 + dia,
    };
  };

  async listarBlog(termo?: string): Promise<{
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

    const termoEhInteiroDecimal = /^(0|[1-9]\d*)$/.test(termoNormalizado);
    if (termoEhInteiroDecimal) {
      const termoComoNumero = parseInt(termoNormalizado, 10);
      if (!Number.isNaN(termoComoNumero)) {
        filtros.push({ id: termoComoNumero });
      }
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

  async listarCarrossel(termo?: string): Promise<{
    itens: Banner[];
    mensagem?: string;
  }> {
    return this.carrosselService.listarBanners(termo);
  }
}
