import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { cast, col, fn, Op, where } from 'sequelize';
import { Banner } from 'src/models/banner.model';
import { Blog } from 'src/models/blog.model';
import { Publicidade } from 'src/models/publicidade.model';
import { Servico } from 'src/models/servico.model';
import { Usuario } from 'src/models/usuario.model';
import { BuscaBannerStatusDto } from './dto/busca-banner-status.dto';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';

@Injectable()
export class BuscaService {
  constructor(
    @InjectModel(Blog) private blogModel: typeof Blog,
    @InjectModel(Banner) private bannerModel: typeof Banner,
    @InjectModel(Publicidade) private publicidadeModel: typeof Publicidade,
    @InjectModel(Usuario) private usuarioModel: typeof Usuario,
    @InjectModel(Servico) private servicoModel: typeof Servico,
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
  }
  async listarBlogByTermo(termo?: string): Promise<{
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

  async listarBannersByTermo(termo?: string): Promise<{
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

  async listarPublicidadeByTermo(termo?: string): Promise<{
    itens: Publicidade[];
    mensagem?: string;
  }> {
    const termoNormalizado = termo?.trim();

    if (!termoNormalizado) {
      const itens = await this.publicidadeModel.findAll({
        order: [['id', 'DESC']],
      });

      return {
        itens,
        mensagem:
          itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
      };
    }

    const itens = await this.publicidadeModel.findAll({
      where: {
        [Op.or]: [
          { titulo: { [Op.like]: `%${termoNormalizado}%` } },
          { conteudo: { [Op.like]: `%${termoNormalizado}%` } },
        ],
      },
      order: [['id', 'DESC']],
    });

    return {
      itens,
      mensagem: itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
    };
  }

  async listarUsuariosByTermo(termo?: string): Promise<{
    itens: Usuario[];
    mensagem?: string;
  }> {
    const termoNormalizado = termo?.trim();

    if (!termoNormalizado) {
      const itens = await this.usuarioModel.findAll({
        attributes: { exclude: ['senha'] },
        order: [['id', 'DESC']],
      });

      return {
        itens,
        mensagem:
          itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
      };
    }

    const filtros: Array<Record<string, unknown> | ReturnType<typeof where>> = [
      { nome: { [Op.like]: `%${termoNormalizado}%` } },
      { email: { [Op.like]: `%${termoNormalizado}%` } },
      { cpfCnpj: { [Op.like]: `%${termoNormalizado}%` } },
      { celular: { [Op.like]: `%${termoNormalizado}%` } },
    ];

    const dataNormalizada = this.normalizarDataBusca(termoNormalizado);
    if (dataNormalizada) {
      const inicio = new Date(`${dataNormalizada}T00:00:00.000Z`);
      const fim = new Date(`${dataNormalizada}T23:59:59.999Z`);
      filtros.push(where(col('data_cadastro'), Op.between, [inicio, fim]));
    } else {
      const dataParcialNormalizada =
        this.normalizarDataBuscaParcial(termoNormalizado);
      if (dataParcialNormalizada) {
        filtros.push(
          where(cast(fn('DATE', col('data_cadastro')), 'TEXT'), {
            [Op.like]: `%${dataParcialNormalizada}%`,
          }),
        );
      }
    }

    if (/\d/.test(termoNormalizado) && !dataNormalizada) {
      filtros.push(
        where(cast(col('id'), 'TEXT'), {
          [Op.like]: `%${termoNormalizado}%`,
        }),
      );
    }

    const itens = await this.usuarioModel.findAll({
      attributes: { exclude: ['senha'] },
      where: { [Op.or]: filtros },
      order: [['id', 'DESC']],
    });

    return {
      itens,
      mensagem: itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
    };
  }

  async listarServicosByTermo(termo?: string): Promise<{
    itens: Servico[];
    mensagem?: string;
  }> {
    const termoNormalizado = termo?.trim();

    if (!termoNormalizado) {
      const itens = await this.servicoModel.findAll({
        order: [['id', 'DESC']],
      });

      return {
        itens,
        mensagem:
          itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
      };
    }

    const filtros: Array<Record<string, unknown> | ReturnType<typeof where>> = [
      { nome: { [Op.like]: `%${termoNormalizado}%` } },
      { descricao: { [Op.like]: `%${termoNormalizado}%` } },
    ];

    if (/\d/.test(termoNormalizado)) {
      filtros.push(
        where(cast(col('valor_base'), 'TEXT'), {
          [Op.like]: `%${termoNormalizado}%`,
        }),
      );
      filtros.push(
        where(cast(col('prazo_estimado_dias'), 'TEXT'), {
          [Op.like]: `%${termoNormalizado}%`,
        }),
      );
      filtros.push(
        where(cast(col('id'), 'TEXT'), {
          [Op.like]: `%${termoNormalizado}%`,
        }),
      );
    }

    const itens = await this.servicoModel.findAll({
      where: { [Op.or]: filtros },
      order: [['id', 'DESC']],
    });

    return {
      itens,
      mensagem: itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
    };
  }

  private normalizarDataBusca(valor: string): string | undefined {
    const valorYmd = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (valorYmd) {
      const ano = Number(valorYmd[1]);
      const mes = Number(valorYmd[2]);
      const dia = Number(valorYmd[3]);
      return this.validarData(ano, mes, dia)
        ? `${valorYmd[1]}-${valorYmd[2]}-${valorYmd[3]}`
        : undefined;
    }

    const valorBr = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (valorBr) {
      const dia = Number(valorBr[1]);
      const mes = Number(valorBr[2]);
      const ano = Number(valorBr[3]);
      return this.validarData(ano, mes, dia)
        ? `${valorBr[3]}-${valorBr[2]}-${valorBr[1]}`
        : undefined;
    }

    return undefined;
  }

  private normalizarDataBuscaParcial(valor: string): string | undefined {
    const termo = valor.trim();
    if (!termo || !/[\d/-]/.test(termo)) {
      return undefined;
    }

    const somenteData = termo.replace(/[^\d/-]/g, '');
    if (!somenteData || !/[/-]/.test(somenteData)) {
      return undefined;
    }

    return somenteData.replace(/\//g, '-');
  }

  private extrairIdExatoDoTermo(valor: string): number | undefined {
    const somenteNumero = valor.match(/^\d+$/);
    if (somenteNumero) {
      return Number(somenteNumero[0]);
    }

    const formatoId = valor.match(/^id\s+(\d+)$/i);
    if (formatoId) {
      return Number(formatoId[1]);
    }

    return undefined;
  }

  private validarData(ano: number, mes: number, dia: number): boolean {
    const dataUtc = new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0, 0));
    return (
      dataUtc.getUTCFullYear() === ano &&
      dataUtc.getUTCMonth() === mes - 1 &&
      dataUtc.getUTCDate() === dia
    );
  }
}
