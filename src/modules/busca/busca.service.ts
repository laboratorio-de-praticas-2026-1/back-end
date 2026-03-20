import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, Op, where } from 'sequelize';
import { Blog } from 'src/models/blog.model';
import { Banner } from 'src/models/banner.model';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';
import { BuscaBannerStatusDto } from './dto/busca-banner-status.dto';

@Injectable()
export class BuscaService {
  constructor(
    @InjectModel(Blog) private blogModel: typeof Blog,
    @InjectModel(Banner) private bannerModel: typeof Banner,
  ) {}

  async buscarBlogsPorIntervaloDeData(
    dto: BuscaBlogIntervaloDto,
  ): Promise<Blog[]> {
    if (!dto.de && !dto.ate) {
      throw new BadRequestException('Informe ao menos uma data: "de" ou "ate"');
    }

    const de = dto.de ? this.parseDataBr(dto.de, 'de') : undefined;
    const ate = dto.ate ? this.parseDataBr(dto.ate, 'ate') : undefined;

    if (de && ate && de.key > ate.key) {
      throw new BadRequestException(
        'Intervalo inválido: "de" não pode ser maior que "ate"',
      );
    }

    const inicio = de ? this.startOfDayDateTime(de.ymd) : undefined;
    const fimExclusivo = ate
      ? this.startOfDayDateTime(this.addDaysYmd(ate.ymd, 1))
      : undefined;

    const filtros = [
      ...(inicio ? [where(col('data_publicacao'), Op.gte, inicio)] : []),
      ...(fimExclusivo
        ? [where(col('data_publicacao'), Op.lt, fimExclusivo)]
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

  private parseDataBr(
    valor: string,
    campo: string,
  ): { ymd: string; key: number } {
    const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) {
      throw new BadRequestException(
        `Campo "${campo}" deve estar no formato DD/MM/YYYY`,
      );
    }

    const dia = Number(match[1]);
    const mes = Number(match[2]);
    const ano = Number(match[3]);

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
  }

  private addDaysYmd(ymd: string, dias: number): string {
    const match = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new BadRequestException('Formato interno de data inválido');
    }

    const ano = Number(match[1]);
    const mes = Number(match[2]);
    const dia = Number(match[3]);

    const dataUtc = new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0, 0));
    dataUtc.setUTCDate(dataUtc.getUTCDate() + dias);

    const novoAno = dataUtc.getUTCFullYear();
    const novoMes = dataUtc.getUTCMonth() + 1;
    const novoDia = dataUtc.getUTCDate();

    return `${String(novoAno).padStart(4, '0')}-${String(novoMes).padStart(
      2,
      '0',
    )}-${String(novoDia).padStart(2, '0')}`;
  }

  private startOfDayDateTime(ymd: string): string {
    return `${ymd} 00:00:00`;
  }
}
