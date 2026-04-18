import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op, where } from 'sequelize';
import { Banner } from 'src/models/banner.model';
import { Blog } from 'src/models/blog.model';
import { Empresa } from 'src/models/empresa.model';
import { Publicidade } from 'src/models/publicidade.model';
import { Servico } from 'src/models/servico.model';
import { Usuario } from 'src/models/usuario.model';
import { BuscaBannerStatusDto } from './dto/busca-banner-status.dto';
import { BuscaBlogIntervaloDto } from './dto/busca-blog-intervalo.dto';
import { BuscaEmpresaFiltroDto } from './dto/busca-empresa-filtro.dto';
import { BuscaPublicidadeStatusDto } from './dto/busca-publicidade-status.dto';
import { BuscaServicoFiltroDto } from './dto/busca-servico-filtro.dto';
import { BuscaUsuarioFiltroDto } from './dto/busca-usuario-filtro.dto';

@Injectable()
export class BuscaService {
  constructor(
    @InjectModel(Blog) private blogModel: typeof Blog,
    @InjectModel(Banner) private bannerModel: typeof Banner,
    @InjectModel(Servico) private servicoModel: typeof Servico,
    @InjectModel(Publicidade) private publicidadeModel: typeof Publicidade,
    @InjectModel(Usuario) private usuarioModel: typeof Usuario,
    @InjectModel(Empresa) private empresaModel: typeof Empresa,
  ) { }

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

  async buscarServicosPorFiltros(
    dto: BuscaServicoFiltroDto,
  ): Promise<Servico[]> {
    const filtros = [
      ...(dto.valor_base !== undefined
        ? [where(col('valor_base'), Op.eq, dto.valor_base)]
        : []),
      ...(dto.prazo_estimado !== undefined
        ? [where(col('prazo_estimado_dias'), Op.eq, dto.prazo_estimado)]
        : []),
      ...(dto.status
        ? [where(col('ativo'), Op.eq, dto.status === 'ativo')]
        : []),
    ];

    if (filtros.length === 0) {
      return await this.servicoModel.findAll({ order: [['id', 'ASC']] });
    }

    return await this.servicoModel.findAll({
      where: {
        [Op.and]: filtros,
      },
      order: [['id', 'ASC']],
    });
  }

  async buscarUsuariosPorFiltros(
    dto: BuscaUsuarioFiltroDto,
  ): Promise<Usuario[]> {
    const nivelUsuario = dto.nivel_usuario?.toLowerCase() as
      | 'cliente'
      | 'administrador'
      | undefined;

    const filtros = [
      ...(nivelUsuario !== undefined
        ? [where(col('nivel'), Op.eq, nivelUsuario)]
        : []),
      ...(dto.data_cadastro !== undefined
        ? [where(fn('DATE', col('data_cadastro')), Op.eq, dto.data_cadastro)]
        : []),
    ];

    if (filtros.length === 0) {
      return await this.usuarioModel.findAll({
        attributes: { exclude: ['senha'] },
        order: [['id', 'ASC']],
      });
    }

    return await this.usuarioModel.findAll({
      attributes: { exclude: ['senha'] },
      where: {
        [Op.and]: filtros,
      },
      order: [['id', 'ASC']],
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

  async buscarPublicidadePorStatus(
    dto: BuscaPublicidadeStatusDto,
  ): Promise<Publicidade[]> {
    const ativo = dto.status === 'ativo';
    return await this.publicidadeModel.findAll({
      where: {
        ativo,
      },
    });
  }

  async buscarEmpresasPorFiltros(
    dto: BuscaEmpresaFiltroDto,
  ): Promise<Empresa[]> {
    const filtros = [
      ...(dto.tipo ? [where(col('tipo'), Op.eq, dto.tipo)] : []),
      ...(dto.estado ? [where(col('estado'), Op.eq, dto.estado)] : []),
      ...(dto.cidade ? [where(col('cidade'), Op.eq, dto.cidade)] : []),
    ];

    if (filtros.length === 0) {
      return await this.empresaModel.findAll({ order: [['id', 'ASC']] });
    }

    return await this.empresaModel.findAll({
      where: {
        [Op.and]: filtros,
      },
      order: [['id', 'ASC']],
    });
  }

  async listarEstadosEmpresas(): Promise<string[]> {
    const rows = (await this.empresaModel.findAll({
      attributes: ['estado'],
      group: ['estado'],
      order: [['estado', 'ASC']],
      raw: true,
    })) as Array<{ estado?: string | null }>;

    const valores = rows
      .map((r) => (r.estado ?? '').trim())
      .filter((v) => v.length > 0);

    return Array.from(new Set(valores));
  }

  async listarCidadesEmpresas(estado?: string): Promise<string[]> {
    const estadoNormalizado = estado?.trim() ? estado.trim().toUpperCase() : '';

    const rows = (await this.empresaModel.findAll({
      attributes: ['cidade'],
      ...(estadoNormalizado
        ? { where: { estado: estadoNormalizado } }
        : undefined),
      group: ['cidade'],
      order: [['cidade', 'ASC']],
      raw: true,
    })) as Array<{ cidade?: string | null }>;

    const valores = rows
      .map((r) => (r.cidade ?? '').trim())
      .filter((v) => v.length > 0);

    return Array.from(new Set(valores));
  }

  async listarEmpresasByTermo(termo?: string): Promise<{
    itens: Empresa[];
    mensagem?: string;
  }> {
    const termoNormalizado = termo?.trim();

    if (!termoNormalizado) {
      const itens = await this.empresaModel.findAll({
        order: [['id', 'DESC']],
      });

      return {
        itens,
        mensagem:
          itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
      };
    }

    const filtros: Array<Record<string, unknown>> = [
      { nomeFantasia: { [Op.like]: `%${termoNormalizado}%` } },
      { cnpj: { [Op.like]: `%${termoNormalizado}%` } },
      { telefone: { [Op.like]: `%${termoNormalizado}%` } },
      { cidade: { [Op.like]: `%${termoNormalizado}%` } },
      { site: { [Op.like]: `%${termoNormalizado}%` } },
    ];

    const itens = await this.empresaModel.findAll({
      where: { [Op.or]: filtros },
      order: [['id', 'DESC']],
    });

    return {
      itens,
      mensagem: itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
    };
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

    const idExtraido = this.extrairIdExato(termoNormalizado);
    const buscaIdExplicita = this.termoRepresentaIdExplicito(termoNormalizado);

    if (idExtraido !== undefined) {
      const itensPorId = await this.publicidadeModel.findAll({
        where: { id: idExtraido },
        order: [['id', 'DESC']],
      });

      if (itensPorId.length > 0 || buscaIdExplicita) {
        return {
          itens: itensPorId,
          mensagem:
            itensPorId.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
        };
      }
    }

    const filtros: Array<Record<string, unknown>> = [
      { urlImagem: { [Op.like]: `%${termoNormalizado}%` } },
      { conteudo: { [Op.like]: `%${termoNormalizado}%` } },
    ];

    const itens = await this.publicidadeModel.findAll({
      where: { [Op.or]: filtros },
      order: [['id', 'DESC']],
    });

    return {
      itens,
      mensagem: itens.length === 0 ? 'Nenhum item foi encontrado.' : undefined,
    };
  }

  private extrairIdExato(valor: string): number | undefined {
    const valorNumerico = valor.match(/^(0|[1-9]\d*)$/);
    if (valorNumerico) {
      return parseInt(valorNumerico[1], 10);
    }

    const valorComPrefixoId = valor.match(/^id\s*[:#-]?\s*(0|[1-9]\d*)$/i);
    if (valorComPrefixoId) {
      return parseInt(valorComPrefixoId[1], 10);
    }

    return undefined;
  }

  private termoRepresentaIdExplicito(valor: string): boolean {
    return /^id\s*[:#-]?\s*(0|[1-9]\d*)$/i.test(valor);
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

    const termoEhNumero = /^(0|[1-9]\d*)(\.\d+)?$/.test(termoNormalizado);
    if (termoEhNumero) {
      const termoComoNumero = Number(termoNormalizado);
      if (!Number.isNaN(termoComoNumero)) {
        filtros.push(where(col('valor_base'), Op.eq, termoComoNumero));
      }
    }

    const termoEhInteiroDecimal = /^(0|[1-9]\d*)$/.test(termoNormalizado);
    if (termoEhInteiroDecimal) {
      const termoComoInteiro = parseInt(termoNormalizado, 10);
      if (!Number.isNaN(termoComoInteiro)) {
        filtros.push(
          where(col('prazo_estimado_dias'), Op.eq, termoComoInteiro),
        );
      }
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

  private validarData(ano: number, mes: number, dia: number): boolean {
    const dataUtc = new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0, 0));
    return (
      dataUtc.getUTCFullYear() === ano &&
      dataUtc.getUTCMonth() === mes - 1 &&
      dataUtc.getUTCDate() === dia
    );
  }
}
